import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors.js";

// Helper: verify invoice exists and belongs to user. Returns invoice row.
async function getOwnedInvoice(invoice_id, user_id) {
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_id, status, subtotal, tax_rate, discount_type, discount_value')
        .eq('invoice_id', invoice_id)
        .eq('user_id', user_id)
        .single();
    if (error || !data) throw new NotFoundError('Invoice not found.');
    return data;
}

// Helper: recalculate invoice totals from all its items and update the invoice row.
// Called after any add / update / delete on items.
async function recalculateInvoiceTotals(invoice_id, tax_rate, discount_type, discount_value) {
    const { data: items, error } = await supabase
        .from('invoice_items')
        .select('subtotal')
        .eq('invoice_id', invoice_id);
    if (error) throw new Error(`Failed to recalculate totals: ${error.message}`);

    const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);

    let discount_amount = 0;
    if (discount_type === 'percentage') {
        discount_amount = subtotal * (Number(discount_value) / 100);
    } else if (discount_type === 'fixed') {
        discount_amount = Math.min(Number(discount_value), subtotal);
    }

    const taxable_amount = subtotal - discount_amount;
    const tax_amount = taxable_amount * (Number(tax_rate) / 100);
    const total_amount = taxable_amount + tax_amount;

    const { error: updateError } = await supabase
        .from('invoices')
        .update({
            subtotal: subtotal.toFixed(2),
            discount_amount: discount_amount.toFixed(2),
            taxable_amount: taxable_amount.toFixed(2),
            tax_amount: tax_amount.toFixed(2),
            total_amount: total_amount.toFixed(2),
        })
        .eq('invoice_id', invoice_id);
    if (updateError) throw new Error(`Failed to update invoice totals: ${updateError.message}`);
}

// ─── GET ALL ITEMS ────────────────────────────────────────────────────────────
// Mental model: "List all line items on the invoice" — ordered by item_order.
export const getInvoiceItems = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId } = req.params;

    await getOwnedInvoice(invoiceId, user_id); // ownership check

    const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('item_order', { ascending: true });

    if (error) throw new Error(`Failed to fetch invoice items: ${error.message}`);

    res.status(200).json({
        success: true,
        data: data || []
    });
});

// ─── ADD ITEM ─────────────────────────────────────────────────────────────────
// Mental model: "Add a line to the invoice" — only on drafts. Subtotal is
// calculated server-side (quantity × unit_price) so frontend can't fudge it.
export const addInvoiceItem = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId } = req.params;

    const invoice = await getOwnedInvoice(invoiceId, user_id);
    if (invoice.status !== 'draft') throw new ForbiddenError('Items can only be added to draft invoices.');

    const { description, quantity, unit_price, item_order } = req.body;

    if (!description)                                   throw new ValidationError('description is required.');
    if (quantity === undefined || quantity === null)     throw new ValidationError('quantity is required.');
    if (unit_price === undefined || unit_price === null) throw new ValidationError('unit_price is required.');
    if (Number(quantity) <= 0)      throw new ValidationError('quantity must be greater than 0.');
    if (Number(unit_price) < 0)     throw new ValidationError('unit_price must be non-negative.');

    const subtotal = (Number(quantity) * Number(unit_price)).toFixed(2);

    const { data, error } = await supabase
        .from('invoice_items')
        .insert([{
            invoice_id:  invoiceId,
            description,
            quantity:    Number(quantity),
            unit_price:  Number(unit_price),
            subtotal:    Number(subtotal),
            item_order:  item_order ?? 0,
        }])
        .select()
        .single();

    if (error) throw new Error(`Failed to add invoice item: ${error.message}`);

    await recalculateInvoiceTotals(invoiceId, invoice.tax_rate, invoice.discount_type, invoice.discount_value);

    res.status(201).json({
        success: true,
        message: 'Item added successfully.',
        data
    });
});

// ─── UPDATE ITEM ──────────────────────────────────────────────────────────────
// Mental model: "Edit a line on the draft invoice" — recalculates subtotal
// and cascades totals back up to the invoice header.
export const updateInvoiceItem = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId, itemId } = req.params;

    const invoice = await getOwnedInvoice(invoiceId, user_id);
    if (invoice.status !== 'draft') throw new ForbiddenError('Items can only be edited on draft invoices.');

    const { description, quantity, unit_price, item_order } = req.body;

    const updates = {};
    if (description !== undefined) updates.description = description;
    if (item_order  !== undefined) updates.item_order  = item_order;

    // Fetch current values to recalculate subtotal if only one of qty/price changes
    const { data: existing, error: fetchErr } = await supabase
        .from('invoice_items')
        .select('quantity, unit_price')
        .eq('item_id', itemId)
        .eq('invoice_id', invoiceId)
        .single();
    if (fetchErr || !existing) throw new NotFoundError('Invoice item not found.');

    const newQty   = quantity   !== undefined ? Number(quantity)   : existing.quantity;
    const newPrice = unit_price !== undefined ? Number(unit_price) : existing.unit_price;

    if (newQty <= 0)  throw new ValidationError('quantity must be greater than 0.');
    if (newPrice < 0) throw new ValidationError('unit_price must be non-negative.');

    updates.quantity   = newQty;
    updates.unit_price = newPrice;
    updates.subtotal   = Number((newQty * newPrice).toFixed(2));

    if (Object.keys(updates).length === 0) throw new ValidationError('No valid fields to update.');

    const { data, error } = await supabase
        .from('invoice_items')
        .update(updates)
        .eq('item_id', itemId)
        .eq('invoice_id', invoiceId)
        .select()
        .single();

    if (error) throw new Error(`Failed to update invoice item: ${error.message}`);

    await recalculateInvoiceTotals(invoiceId, invoice.tax_rate, invoice.discount_type, invoice.discount_value);

    res.status(200).json({
        success: true,
        message: 'Item updated successfully.',
        data
    });
});

// ─── DELETE ITEM ──────────────────────────────────────────────────────────────
// Mental model: "Cross out a line on the draft invoice" — removes the item
// and recalculates the invoice total.
export const deleteInvoiceItem = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId, itemId } = req.params;

    const invoice = await getOwnedInvoice(invoiceId, user_id);
    if (invoice.status !== 'draft') throw new ForbiddenError('Items can only be deleted from draft invoices.');

    const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('item_id', itemId)
        .eq('invoice_id', invoiceId);

    if (error) throw new Error(`Failed to delete invoice item: ${error.message}`);

    await recalculateInvoiceTotals(invoiceId, invoice.tax_rate, invoice.discount_type, invoice.discount_value);

    res.status(200).json({
        success: true,
        message: 'Item deleted successfully.'
    });
});
