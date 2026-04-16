# 📘 Receively API Documentation

**Base URL:** `http://localhost:4000`  
**Version:** 1.0.0  
**Last Updated:** April 14, 2026

---

## 📑 Table of Contents

1. [Authentication](#authentication)
2. [Clients Management](#clients-management)
3. [Invoices Management](#invoices-management)
4. [Error Responses](#error-responses)
5. [Status Codes](#status-codes)

---

## 🔐 Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### POST /api/auth/register

Create a new user account.

**Request Body:**
```json
{
  "self_name": "John Doe",
  "user_email": "john@example.com",
  "password": "SecurePass123!",
  "business_name": "John's Consulting",
  "currency": "USD"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "self_name": "John Doe",
      "user_email": "john@example.com",
      "business_name": "John's Consulting",
      "currency": "USD",
      "created_at": "2024-01-15T10:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Validation Rules:**
- `self_name`: Required, min 2 characters
- `user_email`: Required, valid email format, unique
- `password`: Required, min 6 characters
- `currency`: Optional, defaults to 'INR'

---

### POST /api/auth/login

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "self_name": "John Doe",
      "user_email": "john@example.com",
      "business_name": "John's Consulting",
      "currency": "USD"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST /api/auth/logout

Invalidate refresh token.

**Authentication:** Required

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### GET /api/auth/profile

Get authenticated user's profile.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "self_name": "John Doe",
    "user_email": "john@example.com",
    "business_name": "John's Consulting",
    "logo_url": "https://example.com/logo.png",
    "currency": "USD",
    "payment_method": "bank_transfer",
    "permissions": [
      "invoices:view",
      "invoices:create",
      "clients:view",
      "clients:create"
    ],
    "subscription_tier": "free",
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

## 👥 Clients Management

### GET /api/clients

Get all clients for authenticated user.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `includeArchived` | boolean | `false` | Include archived clients |

**Example Request:**
```
GET /api/clients?includeArchived=false
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "client_id": "uuid",
      "user_id": "uuid",
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "company_name": "Acme Corp",
      "billing_address": "123 Main St, New York, NY 10001",
      "default_currency": "USD",
      "notes": "Preferred client",
      "archived_at": null,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### GET /api/clients/:id

Get single client with invoice summary.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Client ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "client_id": "uuid",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "company_name": "Acme Corp",
    "billing_address": "123 Main St, New York, NY 10001",
    "default_currency": "USD",
    "notes": "Preferred client",
    "created_at": "2024-01-01T00:00:00Z",
    "invoices": [
      {
        "invoice_id": "uuid",
        "invoice_number": "INV-001",
        "status": "paid",
        "total_amount": 1500.00,
        "paid_amount": 1500.00,
        "due_date": "2024-02-01",
        "created_at": "2024-01-15T00:00:00Z"
      }
    ],
    "summary": {
      "totalBilled": 3500.00,
      "totalPaid": 2000.00,
      "outstanding": 1500.00,
      "invoiceCount": 5
    }
  }
}
```

---

### POST /api/clients

Create a new client.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "company_name": "Acme Corp",
  "billing_address": "123 Main St, New York, NY 10001",
  "default_currency": "USD",
  "notes": "Preferred client"
}
```

**Required Fields:**
- `name` (string, min 1 character)
- `email` (string, valid email format)

**Optional Fields:**
- `company_name` (string)
- `billing_address` (text)
- `default_currency` (string, 3 chars, defaults to 'USD')
- `notes` (text)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Client created successfully",
  "data": {
    "client_id": "uuid",
    "user_id": "uuid",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "company_name": "Acme Corp",
    "billing_address": "123 Main St, New York, NY 10001",
    "default_currency": "USD",
    "notes": "Preferred client",
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Error Cases:**
- `400`: Email already exists for this user
- `400`: Invalid email format
- `400`: Missing required fields

---

### PUT /api/clients/:id

Update an existing client.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Client ID |

**Request Body:** (all fields optional)
```json
{
  "name": "Acme Corporation Ltd",
  "email": "newcontact@acme.com",
  "company_name": "Acme Corp Ltd",
  "billing_address": "456 New St, New York, NY 10002",
  "default_currency": "EUR",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Client updated successfully",
  "data": {
    "client_id": "uuid",
    "name": "Acme Corporation Ltd",
    "email": "newcontact@acme.com",
    "company_name": "Acme Corp Ltd",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Cases:**
- `404`: Client not found
- `400`: Email already used by another client
- `403`: Not authorized to update this client

---

### POST /api/clients/:id/archive

Archive a client (soft delete).

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Client ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Client archived successfully",
  "data": {
    "client_id": "uuid",
    "name": "Acme Corporation",
    "archived_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Cases:**
- `404`: Client not found
- `400`: Client is already archived

---

### POST /api/clients/:id/restore

Restore an archived client.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Client ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Client restored successfully",
  "data": {
    "client_id": "uuid",
    "name": "Acme Corporation",
    "archived_at": null
  }
}
```

**Error Cases:**
- `404`: Client not found
- `400`: Client is not archived

---

## 📝 Invoices Management

### GET /api/invoices

Get all invoices for authenticated user.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | all | Filter by status: `draft`, `sent`, `paid`, `overdue`, `cancelled` |
| `client_id` | uuid | - | Filter by client |
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `sort` | string | created_at | Sort by: `created_at`, `due_date`, `total_amount`, `invoice_number` |
| `order` | string | desc | Sort order: `asc`, `desc` |
| `from_date` | date | - | Filter from date (YYYY-MM-DD) |
| `to_date` | date | - | Filter to date (YYYY-MM-DD) |

**Example Request:**
```
GET /api/invoices?status=sent&page=1&limit=10&sort=due_date&order=asc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "invoice_id": "uuid",
        "invoice_number": "JD-2024-001",
        "client": {
          "client_id": "uuid",
          "name": "Acme Corp",
          "email": "client@acme.com"
        },
        "status": "sent",
        "is_draft": false,
        "subtotal": 1000.00,
        "tax_amount": 180.00,
        "discount_amount": 0,
        "total_amount": 1180.00,
        "paid_amount": 0,
        "balance": 1180.00,
        "currency": "USD",
        "issue_date": "2024-01-15",
        "due_date": "2024-02-15",
        "sent_at": "2024-01-15T10:00:00Z",
        "created_at": "2024-01-15T09:00:00Z",
        "updated_at": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5,
      "hasMore": true
    }
  }
}
```

---

### GET /api/invoices/next-number

Get next available invoice number.

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invoice_number": "JD-2024-015",
    "prefix": "JD",
    "year": 2024,
    "sequence": 15,
    "format": "{prefix}-{year}-{sequence}",
    "editable": true
  }
}
```

---

### GET /api/invoices/:id

Get single invoice with all details and line items.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "JD-2024-001",
    "client": {
      "client_id": "uuid",
      "name": "Acme Corp",
      "email": "client@acme.com",
      "company_name": "Acme Corporation",
      "billing_address": "123 Main St"
    },
    "status": "sent",
    "is_draft": false,
    "issue_date": "2024-01-15",
    "due_date": "2024-02-15",
    "currency": "USD",
    "notes": "Payment terms: Net 30",
    "items": [
      {
        "item_id": "uuid",
        "description": "Website Design",
        "quantity": 1.00,
        "unit_price": 1000.00,
        "subtotal": 1000.00,
        "item_order": 0
      },
      {
        "item_id": "uuid",
        "description": "Hosting (1 year)",
        "quantity": 1.00,
        "unit_price": 120.00,
        "subtotal": 120.00,
        "item_order": 1
      }
    ],
    "calculations": {
      "subtotal": 1120.00,
      "discount_type": "percentage",
      "discount_value": 10.00,
      "discount_amount": 112.00,
      "taxable_amount": 1008.00,
      "tax_rate": 18.00,
      "tax_amount": 181.44,
      "total_amount": 1189.44,
      "paid_amount": 0,
      "balance": 1189.44
    },
    "sent_at": "2024-01-15T10:00:00Z",
    "last_saved_at": "2024-01-15T09:55:00Z",
    "created_at": "2024-01-15T09:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### POST /api/invoices

Create a new invoice.

**Authentication:** Required

**Request Body:**
```json
{
  "client_id": "uuid",
  "invoice_number": "JD-2024-015",
  "issue_date": "2024-01-15",
  "due_date": "2024-02-15",
  "currency": "USD",
  "notes": "Payment terms: Net 30",
  "tax_rate": 18.00,
  "discount_type": "percentage",
  "discount_value": 10.00,
  "items": [
    {
      "description": "Website Design",
      "quantity": 1,
      "unit_price": 1000.00
    },
    {
      "description": "Hosting (1 year)",
      "quantity": 1,
      "unit_price": 120.00
    }
  ]
}
```

**Required Fields:**
- `client_id` (uuid)
- `items` (array, min 1 item)
- Each item must have: `description`, `quantity`, `unit_price`

**Optional Fields:**
- `invoice_number` (auto-generated if not provided)
- `issue_date` (defaults to today)
- `due_date` (defaults to 30 days from issue_date)
- `currency` (defaults to client's default currency)
- `notes` (text)
- `tax_rate` (decimal, defaults to 0)
- `discount_type` ('percentage', 'fixed', 'none', defaults to 'none')
- `discount_value` (decimal, defaults to 0)

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "JD-2024-015",
    "status": "draft",
    "is_draft": true,
    "subtotal": 1120.00,
    "tax_amount": 181.44,
    "discount_amount": 112.00,
    "total_amount": 1189.44,
    "items": [
      {
        "item_id": "uuid",
        "description": "Website Design",
        "quantity": 1.00,
        "unit_price": 1000.00,
        "subtotal": 1000.00
      }
    ],
    "created_at": "2024-01-15T10:00:00Z"
  }
}
```

**Calculation Logic:**
1. **Line Item Subtotal**: `quantity × unit_price`
2. **Invoice Subtotal**: Sum of all line item subtotals
3. **Discount Amount**: 
   - If `percentage`: `subtotal × (discount_value / 100)`
   - If `fixed`: `discount_value`
4. **Taxable Amount**: `subtotal - discount_amount`
5. **Tax Amount**: `taxable_amount × (tax_rate / 100)`
6. **Total Amount**: `taxable_amount + tax_amount`

---

### PUT /api/invoices/:id

Update an existing invoice (draft only).

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Request Body:** (all fields optional)
```json
{
  "client_id": "uuid",
  "invoice_number": "JD-2024-015",
  "issue_date": "2024-01-16",
  "due_date": "2024-02-16",
  "currency": "USD",
  "notes": "Updated terms",
  "tax_rate": 18.00,
  "discount_type": "fixed",
  "discount_value": 50.00,
  "items": [
    {
      "item_id": "uuid",
      "description": "Updated description",
      "quantity": 2,
      "unit_price": 1000.00
    },
    {
      "description": "New item",
      "quantity": 1,
      "unit_price": 200.00
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "JD-2024-015",
    "status": "draft",
    "total_amount": 2370.00,
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

**Error Cases:**
- `400`: Cannot update non-draft invoice
- `404`: Invoice not found
- `403`: Not authorized to update this invoice

---

### PATCH /api/invoices/:id/auto-save

Auto-save draft invoice (for real-time saving).

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Request Body:** (partial update)
```json
{
  "items": [
    {
      "description": "Item 1",
      "quantity": 1,
      "unit_price": 100.00
    }
  ],
  "notes": "Draft notes",
  "tax_rate": 18
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Draft auto-saved",
  "data": {
    "invoice_id": "uuid",
    "last_saved_at": "2024-01-15T10:30:00Z",
    "total_amount": 118.00
  }
}
```

---

### POST /api/invoices/:id/send

Send invoice to client (marks as sent, no longer draft).

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Request Body:**
```json
{
  "send_email": true,
  "email_message": "Please find your invoice attached. Payment is due within 30 days."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invoice sent successfully",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "JD-2024-015",
    "status": "sent",
    "is_draft": false,
    "sent_at": "2024-01-15T10:00:00Z",
    "email_sent": true
  }
}
```

**Status Changes:**
- Draft → Sent
- Updates `sent_at` timestamp
- Sets `is_draft` to false

**Error Cases:**
- `400`: Invoice already sent
- `400`: Invoice has no items
- `404`: Invoice not found

---

### POST /api/invoices/:id/duplicate

Duplicate an existing invoice.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID to duplicate |

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Invoice duplicated successfully",
  "data": {
    "invoice_id": "new-uuid",
    "invoice_number": "JD-2024-016",
    "status": "draft",
    "is_draft": true,
    "original_invoice_id": "uuid",
    "created_at": "2024-01-15T11:00:00Z"
  }
}
```

**Behavior:**
- Creates new invoice with new ID and invoice number
- Copies all items, tax, discount settings
- Status is always `draft`
- Issue date set to today
- Due date recalculated based on original term length

---

### DELETE /api/invoices/:id

Delete a draft invoice.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

**Error Cases:**
- `400`: Cannot delete non-draft invoice
- `404`: Invoice not found
- `403`: Not authorized to delete this invoice

---

### GET /api/invoices/:id/preview

Get invoice preview data (for rendering UI preview).

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "invoice": {
      "invoice_number": "JD-2024-015",
      "issue_date": "2024-01-15",
      "due_date": "2024-02-15",
      "status": "draft",
      "currency": "USD",
      "notes": "Payment terms: Net 30"
    },
    "business": {
      "name": "John's Consulting",
      "email": "john@example.com",
      "logo_url": "https://example.com/logo.png",
      "payment_method": "Bank Transfer"
    },
    "client": {
      "name": "Acme Corp",
      "email": "client@acme.com",
      "company_name": "Acme Corporation",
      "billing_address": "123 Main St, New York, NY 10001"
    },
    "items": [
      {
        "description": "Website Design",
        "quantity": 1.00,
        "unit_price": 1000.00,
        "subtotal": 1000.00
      }
    ],
    "calculations": {
      "subtotal": 1120.00,
      "discount_type": "percentage",
      "discount_value": 10.00,
      "discount_amount": 112.00,
      "taxable_amount": 1008.00,
      "tax_rate": 18.00,
      "tax_amount": 181.44,
      "total_amount": 1189.44,
      "paid_amount": 0,
      "balance": 1189.44
    }
  }
}
```

---

### GET /api/invoices/:id/pdf

Generate and download invoice PDF.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Response:** `200 OK`
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="invoice-JD-2024-015.pdf"

[PDF Binary Data]
```

---

### PATCH /api/invoices/:id/status

Update invoice status.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Request Body:**
```json
{
  "status": "cancelled",
  "reason": "Client requested cancellation"
}
```

**Valid Status Transitions:**
- `draft` → `sent`, `cancelled`
- `sent` → `paid`, `overdue`, `cancelled`
- `overdue` → `paid`, `cancelled`
- `paid` → (no transitions)
- `cancelled` → (no transitions)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Invoice status updated",
  "data": {
    "invoice_id": "uuid",
    "status": "cancelled",
    "updated_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### POST /api/invoices/:id/record-payment

Record a payment for an invoice.

**Authentication:** Required

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | Invoice ID |

**Request Body:**
```json
{
  "amount": 500.00,
  "payment_date": "2024-01-20",
  "payment_method": "bank_transfer",
  "notes": "Partial payment received"
}
```

**Required Fields:**
- `amount` (decimal, must be > 0)
- `payment_date` (date, format: YYYY-MM-DD)

**Optional Fields:**
- `payment_method` (string)
- `notes` (text)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Payment recorded successfully",
  "data": {
    "invoice_id": "uuid",
    "invoice_number": "JD-2024-015",
    "total_amount": 1189.44,
    "paid_amount": 500.00,
    "balance": 689.44,
    "status": "sent",
    "payment": {
      "amount": 500.00,
      "payment_date": "2024-01-20",
      "payment_method": "bank_transfer",
      "notes": "Partial payment received"
    }
  }
}
```

**Status Auto-Update:**
- If `paid_amount >= total_amount`: Status changes to `paid`
- If partial payment: Status remains `sent` or `overdue`

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | No valid authentication token |
| `FORBIDDEN` | 403 | Not authorized to perform this action |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Example Error Responses

**Validation Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Name and email are required",
    "details": {
      "fields": ["name", "email"]
    }
  }
}
```

**Not Found:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Client not found"
  }
}
```

**Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "No authentication token provided"
  }
}
```

---

## 📊 Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error - Server error |

---

## 📝 Notes

### Invoice Status Lifecycle

```
draft → sent → paid
  ↓      ↓      
cancelled  overdue → cancelled
```

### Multi-Tenancy

- All resources are scoped to the authenticated user
- Users can only access their own clients and invoices
- Invoice numbers are unique per user (not globally)

### Rate Limiting

- Currently not implemented
- Planned for future releases

### Pagination

Default pagination settings:
- `limit`: 20 items per page
- `max limit`: 100 items per page
- `default sort`: created_at DESC

### Date Formats

- All dates in ISO 8601 format: `YYYY-MM-DD`
- All timestamps in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
- Timezone: UTC

### Currency

- Currency codes follow ISO 4217 (USD, EUR, INR, etc.)
- All monetary values are decimals with 2 decimal places
- Currency symbol display is handled client-side

---

## 🔄 Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Authentication endpoints
- Clients management
- Invoices management (planned)

---

**Last Updated:** April 14, 2026  
**Maintained By:** Receively Development Team
