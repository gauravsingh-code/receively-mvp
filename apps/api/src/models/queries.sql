-- This file contains SQL queries for creating the necessary tables in the database.

-- Table: users_data
CREATE TABLE users_data(
  id uuid primary key default gen_random_uuid(),
  self_name varchar(255) not null,
  password_hash text not null,
  business_name varchar(255),
  user_email text,
  logo_url text,
  currency varchar(10) not null default 'inr',
  payment_method varchar(50), --e.g. 'bank_transfers', 'upi', 'paypal'

  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

CREATE TABLE refresh_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users_data(id) on delete cascade,
  token text not null unique,
  expires_at timestamp not null,
  created_at timestamp default current_timestamp
);

-- Table: clients
-- Stores client information with soft delete support
CREATE TABLE clients (
  client_id uuid primary key default gen_random_uuid(),
  user_id uuid references users_data(id) on delete cascade not null,
  name varchar(255) not null,
  email varchar(255) not null,
  company_name varchar(255),
  billing_address text,
  default_currency varchar(10) default 'USD',
  notes text,
  archived_at timestamp, -- Soft delete: if not null, client is archived
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  
  -- Ensure unique email per user (excluding archived)
  unique(user_id, email)
);

-- Index for faster queries
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_archived_at ON clients(archived_at);

-- Table: invoices
-- Stores invoice information linked to clients
CREATE TABLE invoices (
  invoice_id uuid primary key default gen_random_uuid(),
  user_id uuid references users_data(id) on delete cascade not null,
  client_id uuid references clients(client_id) on delete restrict not null,
  invoice_number varchar(50) not null,
  status varchar(20) default 'draft', -- draft, sent, paid, overdue, cancelled
  total_amount decimal(15, 2) not null default 0,
  paid_amount decimal(15, 2) not null default 0,
  currency varchar(10) default 'USD',
  issue_date date,
  due_date date,
  notes text,
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp,
  
  -- Ensure unique invoice number per user
  unique(user_id, invoice_number)
);

-- Indexes for faster queries
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
