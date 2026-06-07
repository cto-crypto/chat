-- KeevOS Housing Operations Platform
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
CREATE TYPE user_role AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'STAFF', 'VIEWER');
CREATE TYPE contact_type AS ENUM ('TENANT', 'LANDLORD', 'BROKER', 'CASEWORKER', 'OTHER');
CREATE TYPE contact_status AS ENUM ('NEW', 'ACTIVE', 'INACTIVE', 'FOLLOW_UP_NEEDED', 'ARCHIVED');
CREATE TYPE urgency_level AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE tenant_status AS ENUM ('NEW', 'SEARCHING', 'VIEWING', 'APPLICATION_SUBMITTED', 'INSPECTION_PENDING', 'APPROVED', 'HOUSED', 'INACTIVE');
CREATE TYPE property_status AS ENUM ('AVAILABLE', 'PENDING', 'INSPECTION_SCHEDULED', 'APPROVED', 'OCCUPIED', 'UNAVAILABLE');
CREATE TYPE case_status AS ENUM ('NEW', 'SEARCHING', 'VIEWING_SCHEDULED', 'APPLICATION_STARTED', 'DOCUMENTS_NEEDED', 'INSPECTION_PENDING', 'APPROVED', 'LEASE_SIGNING', 'HOUSED', 'CLOSED', 'LOST');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');
CREATE TYPE note_type AS ENUM ('GENERAL', 'CALL', 'EMAIL', 'MEETING', 'SYSTEM', 'STATUS_UPDATE');
CREATE TYPE document_type AS ENUM ('VOUCHER', 'ID', 'LEASE', 'INSPECTION', 'APPLICATION', 'INCOME_PROOF', 'UTILITY_BILL', 'OTHER');

-- Profiles table
CREATE TABLE profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  auth_user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'STAFF',
  avatar_url TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  full_name TEXT NOT NULL,
  contact_type contact_type NOT NULL DEFAULT 'OTHER',
  phone TEXT,
  alternate_phone TEXT,
  email TEXT,
  address TEXT,
  borough TEXT,
  neighborhood TEXT,
  organization TEXT,
  preferred_contact_method TEXT,
  status contact_status NOT NULL DEFAULT 'NEW',
  tags TEXT[] DEFAULT '{}',
  source TEXT,
  notes TEXT,
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tenants table
CREATE TABLE tenants (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contact_id TEXT UNIQUE NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  voucher_type TEXT,
  voucher_size INT,
  voucher_number TEXT,
  household_size INT,
  max_rent DECIMAL(10,2),
  preferred_boroughs TEXT[] DEFAULT '{}',
  preferred_neighborhoods TEXT[] DEFAULT '{}',
  accessibility_needs TEXT,
  pets BOOLEAN NOT NULL DEFAULT FALSE,
  move_in_deadline DATE,
  urgency_level urgency_level NOT NULL DEFAULT 'MEDIUM',
  tenant_status tenant_status NOT NULL DEFAULT 'NEW',
  assigned_caseworker_id TEXT REFERENCES caseworkers(id),
  documents_complete BOOLEAN NOT NULL DEFAULT FALSE,
  missing_documents TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Landlords table
CREATE TABLE landlords (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contact_id TEXT UNIQUE NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  company_name TEXT,
  portfolio_size INT,
  section_8_friendly BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_vouchers BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_contact_method TEXT,
  payment_requirements TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Brokers table
CREATE TABLE brokers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contact_id TEXT UNIQUE NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  brokerage_name TEXT,
  license_number TEXT,
  service_areas TEXT[] DEFAULT '{}',
  commission_notes TEXT,
  active_listings_count INT DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Caseworkers table
CREATE TABLE caseworkers (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  contact_id TEXT UNIQUE NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  agency_name TEXT,
  caseload_count INT DEFAULT 0,
  specialization TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Properties table
CREATE TABLE properties (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  landlord_id TEXT REFERENCES landlords(id),
  broker_id TEXT REFERENCES brokers(id),
  property_name TEXT,
  address TEXT NOT NULL,
  borough TEXT NOT NULL,
  neighborhood TEXT,
  zip_code TEXT,
  bedrooms INT NOT NULL,
  bathrooms DECIMAL(3,1),
  rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2),
  voucher_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  voucher_types_accepted TEXT[] DEFAULT '{}',
  status property_status NOT NULL DEFAULT 'AVAILABLE',
  availability_date DATE,
  utilities_included TEXT[] DEFAULT '{}',
  pet_policy TEXT,
  accessibility_features TEXT[] DEFAULT '{}',
  elevator BOOLEAN NOT NULL DEFAULT FALSE,
  laundry BOOLEAN NOT NULL DEFAULT FALSE,
  parking BOOLEAN NOT NULL DEFAULT FALSE,
  photos TEXT[] DEFAULT '{}',
  description TEXT,
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Housing Cases table
CREATE TABLE housing_cases (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  case_number TEXT UNIQUE NOT NULL,
  tenant_id TEXT REFERENCES tenants(id),
  property_id TEXT REFERENCES properties(id),
  landlord_id TEXT REFERENCES landlords(id),
  broker_id TEXT REFERENCES brokers(id),
  caseworker_id TEXT REFERENCES caseworkers(id),
  assigned_staff_id TEXT REFERENCES profiles(id),
  contact_id TEXT REFERENCES contacts(id),
  status case_status NOT NULL DEFAULT 'NEW',
  priority urgency_level NOT NULL DEFAULT 'MEDIUM',
  move_in_target_date DATE,
  next_follow_up_date DATE,
  last_contacted_at TIMESTAMPTZ,
  case_summary TEXT,
  blockers TEXT,
  outcome TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT,
  related_contact_id TEXT REFERENCES contacts(id),
  related_tenant_id TEXT REFERENCES tenants(id),
  related_property_id TEXT REFERENCES properties(id),
  related_case_id TEXT REFERENCES housing_cases(id),
  assigned_to TEXT REFERENCES profiles(id),
  due_date TIMESTAMPTZ,
  status task_status NOT NULL DEFAULT 'PENDING',
  priority urgency_level NOT NULL DEFAULT 'MEDIUM',
  reminder_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  note TEXT NOT NULL,
  note_type note_type NOT NULL DEFAULT 'GENERAL',
  related_contact_id TEXT REFERENCES contacts(id),
  related_tenant_id TEXT REFERENCES tenants(id),
  related_property_id TEXT REFERENCES properties(id),
  related_case_id TEXT REFERENCES housing_cases(id),
  created_by TEXT REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Documents table
CREATE TABLE documents (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT,
  document_type document_type NOT NULL DEFAULT 'OTHER',
  related_contact_id TEXT REFERENCES contacts(id),
  related_tenant_id TEXT REFERENCES tenants(id),
  related_property_id TEXT REFERENCES properties(id),
  related_case_id TEXT REFERENCES housing_cases(id),
  uploaded_by TEXT REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activity Logs table
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  actor_id TEXT REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Integrations table
CREATE TABLE integrations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  provider TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  config_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE webhooks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  endpoint_url TEXT NOT NULL,
  secret TEXT NOT NULL,
  event_types TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automation Rules table
CREATE TABLE automation_rules (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL,
  conditions_json JSONB,
  actions_json JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Backups table
CREATE TABLE backups (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  backup_type TEXT NOT NULL,
  status TEXT NOT NULL,
  file_url TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_by TEXT REFERENCES profiles(id)
);

-- Indexes for performance
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_borough ON contacts(borough);
CREATE INDEX idx_tenants_status ON tenants(tenant_status);
CREATE INDEX idx_tenants_urgency ON tenants(urgency_level);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_borough ON properties(borough);
CREATE INDEX idx_properties_bedrooms ON properties(bedrooms);
CREATE INDEX idx_cases_status ON housing_cases(status);
CREATE INDEX idx_cases_priority ON housing_cases(priority);
CREATE INDEX idx_cases_follow_up ON housing_cases(next_follow_up_date);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_actor ON activity_logs(actor_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_landlords_updated_at BEFORE UPDATE ON landlords FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON brokers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_caseworkers_updated_at BEFORE UPDATE ON caseworkers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON housing_cases FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_user_id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'STAFF')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
