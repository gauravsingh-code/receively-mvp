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
