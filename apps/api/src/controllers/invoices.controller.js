import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { UnauthorizedError, NotFoundError, ValidationError, ForbiddenError } from "../utils/errors.js";

// Valid statuses and the transitions each allows
// Think of it like a shipment label — once it's "delivered" (paid), you can't relabel it.
const VALID_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
const STATUS_TRANSITIONS = {
    draft:     ['sent', 'cancelled'],
    sent:      ['paid', 'overdue', 'cancelled'],
    overdue:   ['paid', 'cancelled'],
    paid:      [],   // terminal
    cancelled: [],   // terminal
};

// Mental model: "Show me my filing cabinet" — list all invoices in your drawer,
// newest first. Optional status filter to narrow down.
export const getInvoices = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;

    const { status, client_id } = req.query;

    let query = supabase
        .from('invoices')
        .select('*, clients(name, email, company_name)')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

    if (status) {
        if (!VALID_STATUSES.includes(status)) throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
        query = query.eq('status', status);
    }

    if (client_id) {
        query = query.eq('client_id', client_id);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);

    res.status(200).json({
        success: true,
        message: 'Invoices fetched successfully.',
        data: data || []
    });
});

// Mental model: "What's the next ticket number at the deli counter?" —
// peek at the last number issued and suggest the next one. Nothing is saved yet.
export const getNextInvoiceNumber = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;

    // maybeSingle() returns null if no row exists, unlike single() which throws
    const { data, error } = await supabase
        .from('invoice_sequences')
        .select('last_sequence, year')
        .eq('user_id', user_id)
        .maybeSingle();

    if (error) throw new Error(`Failed to generate invoice number: ${error.message}`);

    const currentYear = new Date().getFullYear();
    let nextNumber;
    let next_invoice_number;

    if (data) {
        nextNumber = (data.last_sequence || 0) + 1;
        const year = data.year || currentYear;
        const { error: updateError } = await supabase
            .from('invoice_sequences')
            .update({ last_sequence: nextNumber, year })
            .eq('user_id', user_id);
        if (updateError) throw new Error(`Failed to update invoice sequence: ${updateError.message}`);
        next_invoice_number = `INV-${year}-${String(nextNumber).padStart(3, '0')}`;
    } else {
        nextNumber = 1;
        const { error: initError } = await supabase
            .from('invoice_sequences')
            .insert({ user_id, last_sequence: nextNumber, year: currentYear });
        if (initError) throw new Error(`Failed to initialize invoice sequence: ${initError.message}`);
        next_invoice_number = `INV-${currentYear}-${String(nextNumber).padStart(3, '0')}`;
    }

    res.status(200).json({
        success: true,
        data: { next_invoice_number }
    });
});

// Mental model: "Pull a specific file from the cabinet" — fetch one invoice by
// its UUID. Always verify the invoice belongs to the requesting user (security).
export const getInvoiceById = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const { data, error } = await supabase
        .from('invoices')
        .select('*, clients(name, email, company_name, billing_address)')
        .eq('invoice_id', id)
        .eq('user_id', user_id)   // ownership check — never skip this
        .single();

    if (error || !data) throw new NotFoundError('Invoice not found.');

    res.status(200).json({
        success: true,
        data
    });
});

// Mental model: "Write a new invoice and drop it in the cabinet" — validate all
// fields, then insert. DB unique constraint on (user_id, invoice_number) is the
// last line of defence against race conditions.
export const createInvoice = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;

    const { invoice_number, client_id, total_amount, currency, issue_date, due_date, notes } = req.body;

    if (!invoice_number) throw new ValidationError('invoice_number is required.');
    if (!client_id)      throw new ValidationError('client_id is required.');
    if (total_amount === undefined || total_amount === null) throw new ValidationError('total_amount is required.');
    if (isNaN(Number(total_amount)) || Number(total_amount) < 0) throw new ValidationError('total_amount must be a non-negative number.');

    // Verify the client belongs to this user before linking
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('client_id')
        .eq('client_id', client_id)
        .eq('user_id', user_id)
        .is('archived_at', null)
        .single();

    if (clientError || !client) throw new NotFoundError('Client not found or is archived.');

    const { data, error } = await supabase
        .from('invoices')
        .insert([{
            user_id,
            invoice_number,
            client_id,
            total_amount: Number(total_amount),
            paid_amount: 0,
            currency: currency || 'USD',
            status: 'draft',
            issue_date: issue_date || null,
            due_date: due_date || null,
            notes: notes || null,
        }])
        .select()
        .single();

    if (error) {
        if (error.code === '23505') throw new ValidationError(`Invoice number '${invoice_number}' already exists.`);
        throw new Error(`Failed to create invoice: ${error.message}`);
    }

    res.status(201).json({
        success: true,
        message: 'Invoice created successfully.',
        data
    });
});

// Mental model: "Edit the invoice before sending it" — only drafts are fully
// editable. Once sent/paid, the record is locked to preserve audit integrity.
export const updateInvoice = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;

    // Fetch existing invoice (ownership check included)
    const { data: existing, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_id, status')
        .eq('invoice_id', id)
        .eq('user_id', user_id)
        .single();

    if (fetchError || !existing) throw new NotFoundError('Invoice not found.');
    if (existing.status !== 'draft') throw new ForbiddenError('Only draft invoices can be edited.');

    const { client_id, total_amount, currency, issue_date, due_date, notes } = req.body;

    const updates = {};
    if (client_id      !== undefined) updates.client_id    = client_id;
    if (total_amount   !== undefined) {
        if (isNaN(Number(total_amount)) || Number(total_amount) < 0) throw new ValidationError('total_amount must be a non-negative number.');
        updates.total_amount = Number(total_amount);
    }
    if (currency       !== undefined) updates.currency     = currency;
    if (issue_date     !== undefined) updates.issue_date   = issue_date;
    if (due_date       !== undefined) updates.due_date     = due_date;
    if (notes          !== undefined) updates.notes        = notes;

    if (Object.keys(updates).length === 0) throw new ValidationError('No valid fields provided to update.');

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('invoice_id', id)
        .eq('user_id', user_id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update invoice: ${error.message}`);

    res.status(200).json({
        success: true,
        message: 'Invoice updated successfully.',
        data
    });
});

// Mental model: "Move the invoice along the pipeline" — like a Kanban board,
// each status only allows specific next states. You can't undo a paid invoice.
export const updateInvoiceStatus = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) throw new ValidationError('status is required.');
    if (!VALID_STATUSES.includes(status)) throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);

    const { data: existing, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_id, status, total_amount')
        .eq('invoice_id', id)
        .eq('user_id', user_id)
        .single();

    if (fetchError || !existing) throw new NotFoundError('Invoice not found.');

    const allowedTransitions = STATUS_TRANSITIONS[existing.status];
    if (!allowedTransitions.includes(status)) {
        throw new ForbiddenError(`Cannot transition from '${existing.status}' to '${status}'.`);
    }

    const updates = {
        status,
        updated_at: new Date().toISOString(),
    };

    // If marking as paid, set paid_amount = total_amount
    if (status === 'paid') {
        updates.paid_amount = existing.total_amount;
    }

    const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('invoice_id', id)
        .eq('user_id', user_id)
        .select()
        .single();

    if (error) throw new Error(`Failed to update invoice status: ${error.message}`);

    res.status(200).json({
        success: true,
        message: `Invoice status updated to '${status}'.`,
        data
    });
});

// Mental model: "Shred a document" — only drafts can be shredded. Sent/paid
// invoices are financial records and must be kept (cancel instead of delete).
export const deleteInvoice = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { id } = req.params;

    const { data: existing, error: fetchError } = await supabase
        .from('invoices')
        .select('invoice_id, status')
        .eq('invoice_id', id)
        .eq('user_id', user_id)
        .single();

    if (fetchError || !existing) throw new NotFoundError('Invoice not found.');
    if (existing.status !== 'draft') throw new ForbiddenError('Only draft invoices can be deleted. Use status change to cancel instead.');

    const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('invoice_id', id)
        .eq('user_id', user_id);

    if (error) throw new Error(`Failed to delete invoice: ${error.message}`);

    res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully.'
    });
});