/*
# AssetFlow AI - Complete Database Schema

## Overview
Creates all tables needed for the AssetFlow enterprise asset management platform.

## New Tables
1. `users` - User accounts with roles (ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
2. `assets` - Physical asset inventory with categories, status tracking, depreciation
3. `allocations` - Asset allocation/transfer workflow with approval states
4. `bookings` - Calendar-based resource reservations with conflict prevention
5. `maintenance_tickets` - Maintenance request tracking with priority levels
6. `audit_records` - Compliance audit records with discrepancy tracking
7. `notifications` - User notification system
8. `activity_log` - Audit trail for all actions

## Security
- RLS enabled on all tables
- Policies use TO anon, authenticated since this app has its own auth layer on top of Supabase
  and we want the anon key frontend to read/write freely (auth is handled at the app layer)
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'EMPLOYEE' CHECK (role IN ('ADMIN','ASSET_MANAGER','DEPARTMENT_HEAD','EMPLOYEE')),
  department text,
  is_active boolean NOT NULL DEFAULT true,
  failed_login_attempts integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "users_update" ON users;
CREATE POLICY "users_update" ON users FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "users_delete" ON users;
CREATE POLICY "users_delete" ON users FOR DELETE TO anon, authenticated USING (true);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sessions_select" ON sessions;
CREATE POLICY "sessions_select" ON sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "sessions_insert" ON sessions;
CREATE POLICY "sessions_insert" ON sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "sessions_update" ON sessions;
CREATE POLICY "sessions_update" ON sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "sessions_delete" ON sessions;
CREATE POLICY "sessions_delete" ON sessions FOR DELETE TO anon, authenticated USING (true);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('COMPUTERS','MONITORS','FURNITURE','EQUIPMENT','VEHICLES','MACHINERY','TOOLS','OTHER')),
  subcategory text,
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','IN_USE','IN_MAINTENANCE','RESERVED','RETIRED','LOST','DAMAGED')),
  location text NOT NULL,
  assigned_to text,
  purchase_date date,
  purchase_value numeric,
  current_value numeric,
  serial_number text,
  qr_code text UNIQUE,
  manufacturer text,
  model text,
  warranty_expiry date,
  depreciation_rate numeric DEFAULT 0,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assets_status_idx ON assets(status);
CREATE INDEX IF NOT EXISTS assets_category_idx ON assets(category);
CREATE INDEX IF NOT EXISTS assets_deleted_at_idx ON assets(deleted_at);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "assets_select" ON assets;
CREATE POLICY "assets_select" ON assets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "assets_insert" ON assets;
CREATE POLICY "assets_insert" ON assets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "assets_update" ON assets;
CREATE POLICY "assets_update" ON assets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "assets_delete" ON assets;
CREATE POLICY "assets_delete" ON assets FOR DELETE TO anon, authenticated USING (true);

-- Allocations table
CREATE TABLE IF NOT EXISTS allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  allocation_id text UNIQUE NOT NULL,
  asset_id uuid NOT NULL REFERENCES assets(id),
  from_user_id uuid REFERENCES users(id),
  to_user_id uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','COMPLETED','CANCELLED')),
  reason text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  rejected_reason text,
  rejected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS allocations_asset_id_idx ON allocations(asset_id);
CREATE INDEX IF NOT EXISTS allocations_to_user_id_idx ON allocations(to_user_id);
CREATE INDEX IF NOT EXISTS allocations_status_idx ON allocations(status);

ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allocations_select" ON allocations;
CREATE POLICY "allocations_select" ON allocations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "allocations_insert" ON allocations;
CREATE POLICY "allocations_insert" ON allocations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "allocations_update" ON allocations;
CREATE POLICY "allocations_update" ON allocations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allocations_delete" ON allocations;
CREATE POLICY "allocations_delete" ON allocations FOR DELETE TO anon, authenticated USING (true);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id text UNIQUE NOT NULL,
  asset_id uuid NOT NULL REFERENCES assets(id),
  user_id uuid NOT NULL REFERENCES users(id),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  purpose text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED','ACTIVE','COMPLETED','CANCELLED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bookings_asset_id_idx ON bookings(asset_id);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings(status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookings_select" ON bookings;
CREATE POLICY "bookings_select" ON bookings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "bookings_insert" ON bookings;
CREATE POLICY "bookings_insert" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "bookings_update" ON bookings;
CREATE POLICY "bookings_update" ON bookings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "bookings_delete" ON bookings;
CREATE POLICY "bookings_delete" ON bookings FOR DELETE TO anon, authenticated USING (true);

-- Maintenance tickets table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id text UNIQUE NOT NULL,
  asset_id uuid NOT NULL REFERENCES assets(id),
  created_by uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('PREVENTIVE','CORRECTIVE','INSPECTION','REPAIR','EMERGENCY')),
  priority text NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','IN_PROGRESS','COMPLETED','CANCELLED','ON_HOLD')),
  scheduled_date timestamptz,
  completed_at timestamptz,
  completed_by uuid REFERENCES users(id),
  estimated_cost numeric,
  actual_cost numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS maintenance_asset_id_idx ON maintenance_tickets(asset_id);
CREATE INDEX IF NOT EXISTS maintenance_status_idx ON maintenance_tickets(status);

ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "maintenance_select" ON maintenance_tickets;
CREATE POLICY "maintenance_select" ON maintenance_tickets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "maintenance_insert" ON maintenance_tickets;
CREATE POLICY "maintenance_insert" ON maintenance_tickets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "maintenance_update" ON maintenance_tickets;
CREATE POLICY "maintenance_update" ON maintenance_tickets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "maintenance_delete" ON maintenance_tickets;
CREATE POLICY "maintenance_delete" ON maintenance_tickets FOR DELETE TO anon, authenticated USING (true);

-- Audit records table
CREATE TABLE IF NOT EXISTS audit_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id text UNIQUE NOT NULL,
  asset_id uuid REFERENCES assets(id),
  created_by uuid NOT NULL REFERENCES users(id),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','VERIFIED','REJECTED')),
  discrepancies integer NOT NULL DEFAULT 0,
  notes text,
  verified_at timestamptz,
  verified_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_records_select" ON audit_records;
CREATE POLICY "audit_records_select" ON audit_records FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "audit_records_insert" ON audit_records;
CREATE POLICY "audit_records_insert" ON audit_records FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "audit_records_update" ON audit_records;
CREATE POLICY "audit_records_update" ON audit_records FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "audit_records_delete" ON audit_records;
CREATE POLICY "audit_records_delete" ON audit_records FOR DELETE TO anon, authenticated USING (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON notifications(user_id);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "notifications_select" ON notifications;
CREATE POLICY "notifications_select" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "notifications_insert" ON notifications;
CREATE POLICY "notifications_insert" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "notifications_delete" ON notifications;
CREATE POLICY "notifications_delete" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- Activity log table
CREATE TABLE IF NOT EXISTS activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  description text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_log_user_id_idx ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS activity_log_action_idx ON activity_log(action);

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activity_log_select" ON activity_log;
CREATE POLICY "activity_log_select" ON activity_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "activity_log_insert" ON activity_log;
CREATE POLICY "activity_log_insert" ON activity_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "activity_log_update" ON activity_log;
CREATE POLICY "activity_log_update" ON activity_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "activity_log_delete" ON activity_log;
CREATE POLICY "activity_log_delete" ON activity_log FOR DELETE TO anon, authenticated USING (true);

-- Seed demo users (password: Admin123456, bcrypt hash)
INSERT INTO users (id, email, name, password_hash, role, is_active)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@assetflow.com', 'Admin User', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'ADMIN', true),
  ('00000000-0000-0000-0000-000000000002', 'manager@assetflow.com', 'Asset Manager', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'ASSET_MANAGER', true),
  ('00000000-0000-0000-0000-000000000003', 'employee@assetflow.com', 'Test Employee', '$2a$12$R9h7cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jKMm2', 'EMPLOYEE', true)
ON CONFLICT (email) DO NOTHING;
