import { supabase } from "../config/supabase.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * Get all clients for the authenticated user (excluding archived)
 */
export const getClients = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { includeArchived = false } = req.query;

  let query = supabase
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Filter out archived clients unless explicitly requested
  if (!includeArchived || includeArchived === 'false') {
    query = query.is("archived_at", null);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch clients: ${error.message}`);
  }

  res.json({
    success: true,
    data: data || [],
  });
});

/**
 * Get a single client by ID with invoice summary
 */
export const getClientById = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  // Get client details
  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("client_id", id)
    .eq("user_id", userId)
    .single();

  if (clientError || !client) {
    throw new NotFoundError("Client not found");
  }

  // Get invoice summary for this client
  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("invoice_id, invoice_number, status, total_amount, paid_amount, due_date, created_at")
    .eq("client_id", id)
    .order("created_at", { ascending: false });

  if (invoicesError) {
    throw new Error(`Failed to fetch invoices: ${invoicesError.message}`);
  }

  // Calculate totals
  const totalBilled = (invoices || []).reduce((sum, inv) => sum + (parseFloat(inv.total_amount) || 0), 0);
  const totalPaid = (invoices || []).reduce((sum, inv) => sum + (parseFloat(inv.paid_amount) || 0), 0);
  const outstanding = totalBilled - totalPaid;

  res.json({
    success: true,
    data: {
      ...client,
      invoices: invoices || [],
      summary: {
        totalBilled,
        totalPaid,
        outstanding,
        invoiceCount: (invoices || []).length,
      },
    },
  });
});

/**
 * Create a new client
 */
export const createClient = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { name, email, company_name, billing_address, default_currency, notes } = req.body;

  // Validate required fields
  if (!name || !email) {
    throw new ValidationError("Name and email are required");
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ValidationError("Invalid email format");
  }

  // Check if client with this email already exists for this user
  const { data: existingClient } = await supabase
    .from("clients")
    .select("client_id")
    .eq("user_id", userId)
    .eq("email", email)
    .is("archived_at", null)
    .single();

  if (existingClient) {
    throw new ValidationError("A client with this email already exists");
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: userId,
      name,
      email,
      company_name: company_name || null,
      billing_address: billing_address || null,
      default_currency: default_currency || 'USD',
      notes: notes || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create client: ${error.message}`);
  }

  res.status(201).json({
    success: true,
    message: "Client created successfully",
    data,
  });
});

/**
 * Update an existing client
 */
export const updateClient = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;
  const { name, email, company_name, billing_address, default_currency, notes } = req.body;

  // Verify client exists and belongs to user
  const { data: existingClient, error: checkError } = await supabase
    .from("clients")
    .select("client_id")
    .eq("client_id", id)
    .eq("user_id", userId)
    .single();

  if (checkError || !existingClient) {
    throw new NotFoundError("Client not found");
  }

  // Validate email format if provided
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    // Check if another client has this email
    const { data: duplicateClient } = await supabase
      .from("clients")
      .select("client_id")
      .eq("user_id", userId)
      .eq("email", email)
      .neq("client_id", id)
      .is("archived_at", null)
      .single();

    if (duplicateClient) {
      throw new ValidationError("Another client with this email already exists");
    }
  }

  // Build update object
  const updateData = {
    ...(name && { name }),
    ...(email && { email }),
    ...(company_name !== undefined && { company_name }),
    ...(billing_address !== undefined && { billing_address }),
    ...(default_currency && { default_currency }),
    ...(notes !== undefined && { notes }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("client_id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update client: ${error.message}`);
  }

  res.json({
    success: true,
    message: "Client updated successfully",
    data,
  });
});

/**
 * Archive a client (soft delete)
 */
export const archiveClient = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  // Verify client exists and belongs to user
  const { data: existingClient, error: checkError } = await supabase
    .from("clients")
    .select("client_id, archived_at")
    .eq("client_id", id)
    .eq("user_id", userId)
    .single();

  if (checkError || !existingClient) {
    throw new NotFoundError("Client not found");
  }

  if (existingClient.archived_at) {
    throw new ValidationError("Client is already archived");
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      archived_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("client_id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to archive client: ${error.message}`);
  }

  res.json({
    success: true,
    message: "Client archived successfully",
    data,
  });
});

/**
 * Restore an archived client
 */
export const restoreClient = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { id } = req.params;

  // Verify client exists and belongs to user
  const { data: existingClient, error: checkError } = await supabase
    .from("clients")
    .select("client_id, archived_at")
    .eq("client_id", id)
    .eq("user_id", userId)
    .single();

  if (checkError || !existingClient) {
    throw new NotFoundError("Client not found");
  }

  if (!existingClient.archived_at) {
    throw new ValidationError("Client is not archived");
  }

  const { data, error } = await supabase
    .from("clients")
    .update({
      archived_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("client_id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to restore client: ${error.message}`);
  }

  res.json({
    success: true,
    message: "Client restored successfully",
    data,
  });
});
