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







---------------Implementing multi-tenancy with the "users_data" table----------------
----------JUst for reference, not to be included in the final code----------


-- Table: modules (available features in the app)
CREATE TABLE modules (
  module_id uuid primary key default gen_random_uuid(),
  module_key varchar(50) unique not null, -- 'dashboard', 'invoices', etc.
  name varchar(100) not null,
  icon varchar(10),
  route_path varchar(255) not null,
  description text,
  display_order int default 0,
  is_active boolean default true,
  created_at timestamp default current_timestamp
);

-- Table: subscription_tiers (free, premium, enterprise)
CREATE TABLE subscription_tiers (
  tier_id uuid primary key default gen_random_uuid(),
  tier_key varchar(50) unique not null, -- 'free', 'premium', 'enterprise'
  name varchar(100) not null,
  price decimal(10, 2) default 0,
  created_at timestamp default current_timestamp
);

-- Table: tier_modules (which modules are available in each tier)
CREATE TABLE tier_modules (
  tier_id uuid references subscription_tiers(tier_id) on delete cascade,
  module_id uuid references modules(module_id) on delete cascade,
  is_enabled boolean default true,
  primary key (tier_id, module_id)
);

-- Add subscription_tier to users_data
ALTER TABLE users_data 
ADD COLUMN subscription_tier varchar(50) default 'free',
ADD COLUMN subscription_expires_at timestamp;

-- Optional: User-specific module overrides (for special cases)
CREATE TABLE user_module_overrides (
  user_id uuid references users_data(id) on delete cascade,
  module_id uuid references modules(module_id) on delete cascade,
  is_enabled boolean not null,
  primary key (user_id, module_id)
);

-- Seed default modules
INSERT INTO modules (module_key, name, icon, route_path, display_order) VALUES
('dashboard', 'Dashboard', '📊', '/dashboard', 1),
('invoices', 'Invoices', '📝', '/dashboard/invoices', 2),
('clients', 'Clients', '👥', '/dashboard/clients', 3),
('payments', 'Payments', '💳', '/dashboard/payments', 4),
('analytics', 'Analytics', '📈', '/dashboard/analytics', 5),
('settings', 'Settings', '⚙️', '/dashboard/settings', 99);

-- Seed subscription tiers
INSERT INTO subscription_tiers (tier_key, name, price) VALUES
('free', 'Free Plan', 0),
('premium', 'Premium Plan', 29.99),
('enterprise', 'Enterprise Plan', 99.99);

-- Assign modules to tiers
-- Free tier
INSERT INTO tier_modules (tier_id, module_id, is_enabled)
SELECT t.tier_id, m.module_id, true
FROM subscription_tiers t
CROSS JOIN modules m
WHERE t.tier_key = 'free' 
AND m.module_key IN ('dashboard', 'invoices', 'clients', 'settings');

-- Premium tier (all of free + analytics, payments)
INSERT INTO tier_modules (tier_id, module_id, is_enabled)
SELECT t.tier_id, m.module_id, true
FROM subscription_tiers t
CROSS JOIN modules m
WHERE t.tier_key = 'premium';

-- Enterprise tier (all modules)
INSERT INTO tier_modules (tier_id, module_id, is_enabled)
SELECT t.tier_id, m.module_id, true
FROM subscription_tiers t
CROSS JOIN modules m
WHERE t.tier_key = 'enterprise';

------------------------------


