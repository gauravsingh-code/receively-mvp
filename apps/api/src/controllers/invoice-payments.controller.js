import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors.js";

const PAYABLE_STATUSES = ['sent', 'overdue'];

// Helper: verify invoice exists, belongs to user, and return it.
async function getOwnedInvoice(invoice_id, user_id) {
    const { data, error } = await supabase
        .from('invoices')
        .select('invoice_id, status, total_amount, paid_amount')
        .eq('invoice_id', invoice_id)
        .eq('user_id', user_id)
        .single();
    if (error || !data) throw new NotFoundError('Invoice not found.');
    return data;
}

// Helper: sum all payments and sync paid_amount on the invoice.
// Also marks invoice as 'paid' if fully paid, or back to 'overdue'/'sent' if payment removed.
async function syncPaidAmount(invoice_id, invoice) {
    const { data: payments, error } = await supabase
        .from('invoice_payments')
        .select('amount')
        .eq('invoice_id', invoice_id);
    if (error) throw new Error(`Failed to sync paid amount: ${error.message}`);

    const paid_amount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const total_amount = Number(invoice.total_amount);

    let newStatus = invoice.status;
    if (paid_amount >= total_amount) {
        newStatus = 'paid';
    } else if (invoice.status === 'paid') {
        // Payment was deleted — revert to overdue if past due, else sent
        newStatus = 'overdue';
    }

    const { error: updateError } = await supabase
        .from('invoices')
        .update({ paid_amount: paid_amount.toFixed(2), status: newStatus })
        .eq('invoice_id', invoice_id);
    if (updateError) throw new Error(`Failed to update paid amount: ${updateError.message}`);
}

// ─── GET ALL PAYMENTS ─────────────────────────────────────────────────────────
// Mental model: "Show me the receipt history for this invoice" — list all
// recorded payments, newest first.
export const getInvoicePayments = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId } = req.params;

    await getOwnedInvoice(invoiceId, user_id); // ownership check

    const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });

    if (error) throw new Error(`Failed to fetch payments: ${error.message}`);

    res.status(200).json({
        success: true,
        data: data || []
    });
});

// ─── RECORD PAYMENT ───────────────────────────────────────────────────────────
// Mental model: "Stamp 'paid' on the invoice receipt" — only sent/overdue
// invoices can receive payments. Overpayment is blocked.
export const recordPayment = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId } = req.params;

    const invoice = await getOwnedInvoice(invoiceId, user_id);
    if (!PAYABLE_STATUSES.includes(invoice.status)) {
        throw new ForbiddenError(`Payments can only be recorded on sent or overdue invoices. Current status: '${invoice.status}'.`);
    }

    const { amount, payment_date, payment_method, notes } = req.body;

    if (!amount)       throw new ValidationError('amount is required.');
    if (!payment_date) throw new ValidationError('payment_date is required.');
    if (Number(amount) <= 0) throw new ValidationError('amount must be greater than 0.');

    // Prevent overpayment
    const outstanding = Number(invoice.total_amount) - Number(invoice.paid_amount);
    if (Number(amount) > outstanding) {
        throw new ValidationError(`Payment amount (${amount}) exceeds outstanding balance (${outstanding.toFixed(2)}).`);
    }

    const { data, error } = await supabase
        .from('invoice_payments')
        .insert([{
            invoice_id:     invoiceId,
            user_id,
            amount:         Number(amount),
            payment_date,
            payment_method: payment_method || null,
            notes:          notes || null,
        }])
        .select()
        .single();

    if (error) throw new Error(`Failed to record payment: ${error.message}`);

    await syncPaidAmount(invoiceId, invoice);

    res.status(201).json({
        success: true,
        message: 'Payment recorded successfully.',
        data
    });
});

// ─── DELETE PAYMENT ───────────────────────────────────────────────────────────
// Mental model: "Void a payment entry" — removes the record and recalculates
// the invoice's paid_amount. Reverts 'paid' status if the invoice becomes underpaid.
export const deletePayment = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    const { invoiceId, paymentId } = req.params;

    const invoice = await getOwnedInvoice(invoiceId, user_id);

    // Verify payment belongs to this invoice
    const { data: payment, error: fetchErr } = await supabase
        .from('invoice_payments')
        .select('payment_id')
        .eq('payment_id', paymentId)
        .eq('invoice_id', invoiceId)
        .single();
    if (fetchErr || !payment) throw new NotFoundError('Payment not found.');

    const { error } = await supabase
        .from('invoice_payments')
        .delete()
        .eq('payment_id', paymentId);

    if (error) throw new Error(`Failed to delete payment: ${error.message}`);

    await syncPaidAmount(invoiceId, invoice);

    res.status(200).json({
        success: true,
        message: 'Payment deleted successfully.'
    });
});
