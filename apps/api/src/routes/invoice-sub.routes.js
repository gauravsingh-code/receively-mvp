import { Router } from "express";
import * as itemsController from '../controllers/invoice-items.controller.js';
import * as paymentsController from '../controllers/invoice-payments.controller.js';
import { authenticate } from "../middlewares/authenticate.js";

const router = Router({ mergeParams: true }); // mergeParams gives access to :invoiceId from parent
router.use(authenticate);

// ─── INVOICE ITEMS ────────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Invoice Items
 *   description: Line items on an invoice (draft only)
 */

/**
 * @swagger
 * /invoices/{invoiceId}/items:
 *   get:
 *     summary: Get all line items for an invoice
 *     tags: [Invoice Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of invoice items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvoiceItem'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/items',                    itemsController.getInvoiceItems);

/**
 * @swagger
 * /invoices/{invoiceId}/items:
 *   post:
 *     summary: Add a line item to a draft invoice
 *     description: Subtotal is calculated server-side as quantity × unit_price. Invoice totals are recalculated automatically.
 *     tags: [Invoice Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - description
 *               - quantity
 *               - unit_price
 *             properties:
 *               description:
 *                 type: string
 *                 example: Web design services
 *               quantity:
 *                 type: number
 *                 example: 2
 *               unit_price:
 *                 type: number
 *                 example: 500.00
 *               item_order:
 *                 type: integer
 *                 example: 0
 *     responses:
 *       201:
 *         description: Item added and invoice totals recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Item added successfully.
 *                 data:
 *                   $ref: '#/components/schemas/InvoiceItem'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invoice is not a draft
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/items',                   itemsController.addInvoiceItem);

/**
 * @swagger
 * /invoices/{invoiceId}/items/{itemId}:
 *   put:
 *     summary: Update a line item on a draft invoice
 *     description: Recalculates subtotal and cascades updated totals to the invoice header.
 *     tags: [Invoice Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit_price:
 *                 type: number
 *               item_order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item updated and invoice totals recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Item updated successfully.
 *                 data:
 *                   $ref: '#/components/schemas/InvoiceItem'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invoice is not a draft
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/items/:itemId',            itemsController.updateInvoiceItem);

/**
 * @swagger
 * /invoices/{invoiceId}/items/{itemId}:
 *   delete:
 *     summary: Delete a line item from a draft invoice
 *     description: Removes the item and recalculates invoice totals.
 *     tags: [Invoice Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item deleted and invoice totals recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Item deleted successfully.
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invoice is not a draft
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice or item not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/items/:itemId',         itemsController.deleteInvoiceItem);

// ─── INVOICE PAYMENTS ─────────────────────────────────────────────────────────

/**
 * @swagger
 * tags:
 *   name: Invoice Payments
 *   description: Payment records against an invoice (sent/overdue only)
 */

/**
 * @swagger
 * /invoices/{invoiceId}/payments:
 *   get:
 *     summary: Get all payments for an invoice
 *     tags: [Invoice Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InvoiceItem'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/payments',                 paymentsController.getInvoicePayments);

/**
 * @swagger
 * /invoices/{invoiceId}/payments:
 *   post:
 *     summary: Record a payment against an invoice
 *     description: Only sent or overdue invoices can receive payments. Overpayment is blocked. Invoice is automatically marked 'paid' when fully covered.
 *     tags: [Invoice Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - payment_date
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 750.00
 *               payment_date:
 *                 type: string
 *                 format: date
 *                 example: '2026-04-16'
 *               payment_method:
 *                 type: string
 *                 example: bank_transfer
 *               notes:
 *                 type: string
 *                 example: First installment
 *     responses:
 *       201:
 *         description: Payment recorded and invoice paid_amount updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment recorded successfully.
 *       400:
 *         description: Validation error or overpayment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invoice is not in a payable status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/payments',                paymentsController.recordPayment);

/**
 * @swagger
 * /invoices/{invoiceId}/payments/{paymentId}:
 *   delete:
 *     summary: Delete a payment record
 *     description: Removes the payment and recalculates paid_amount. Reverts 'paid' status to 'overdue' if the invoice becomes underpaid.
 *     tags: [Invoice Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payment deleted and paid_amount recalculated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment deleted successfully.
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Invoice or payment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/payments/:paymentId',   paymentsController.deletePayment);

export default router;
