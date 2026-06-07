-- KeevOS Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE caseworkers ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE backups ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE auth_user_id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Helper to check if user is at least a certain role
CREATE OR REPLACE FUNCTION has_role(required_role user_role)
RETURNS BOOLEAN AS $$
DECLARE
  user_role user_role;
BEGIN
  SELECT role INTO user_role FROM profiles WHERE auth_user_id = auth.uid();
  RETURN CASE required_role
    WHEN 'VIEWER' THEN TRUE
    WHEN 'STAFF' THEN user_role IN ('STAFF', 'MANAGER', 'ADMIN', 'OWNER')
    WHEN 'MANAGER' THEN user_role IN ('MANAGER', 'ADMIN', 'OWNER')
    WHEN 'ADMIN' THEN user_role IN ('ADMIN', 'OWNER')
    WHEN 'OWNER' THEN user_role = 'OWNER'
    ELSE FALSE
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Profiles policies
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (has_role('ADMIN'));

-- Contacts policies
CREATE POLICY "contacts_select" ON contacts FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "contacts_insert" ON contacts FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "contacts_update" ON contacts FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "contacts_delete" ON contacts FOR DELETE USING (has_role('ADMIN'));

-- Tenants policies
CREATE POLICY "tenants_select" ON tenants FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "tenants_insert" ON tenants FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "tenants_update" ON tenants FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "tenants_delete" ON tenants FOR DELETE USING (has_role('ADMIN'));

-- Landlords policies
CREATE POLICY "landlords_select" ON landlords FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "landlords_insert" ON landlords FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "landlords_update" ON landlords FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "landlords_delete" ON landlords FOR DELETE USING (has_role('ADMIN'));

-- Brokers policies
CREATE POLICY "brokers_select" ON brokers FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "brokers_insert" ON brokers FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "brokers_update" ON brokers FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "brokers_delete" ON brokers FOR DELETE USING (has_role('ADMIN'));

-- Caseworkers policies
CREATE POLICY "caseworkers_select" ON caseworkers FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "caseworkers_insert" ON caseworkers FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "caseworkers_update" ON caseworkers FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "caseworkers_delete" ON caseworkers FOR DELETE USING (has_role('ADMIN'));

-- Properties policies
CREATE POLICY "properties_select" ON properties FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "properties_insert" ON properties FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "properties_update" ON properties FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "properties_delete" ON properties FOR DELETE USING (has_role('MANAGER'));

-- Housing Cases policies
CREATE POLICY "cases_select" ON housing_cases FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "cases_insert" ON housing_cases FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "cases_update" ON housing_cases FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "cases_delete" ON housing_cases FOR DELETE USING (has_role('MANAGER'));

-- Tasks policies
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (has_role('STAFF'));
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (has_role('STAFF'));

-- Notes policies
CREATE POLICY "notes_select" ON notes FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "notes_insert" ON notes FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "notes_delete" ON notes FOR DELETE USING (created_by = (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR has_role('ADMIN'));

-- Documents policies
CREATE POLICY "documents_select" ON documents FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "documents_insert" ON documents FOR INSERT WITH CHECK (has_role('STAFF'));
CREATE POLICY "documents_delete" ON documents FOR DELETE USING (has_role('MANAGER'));

-- Activity logs (read-only for all authenticated users)
CREATE POLICY "activity_logs_select" ON activity_logs FOR SELECT USING (has_role('VIEWER'));
CREATE POLICY "activity_logs_insert" ON activity_logs FOR INSERT WITH CHECK (has_role('STAFF'));

-- Admin-only tables
CREATE POLICY "integrations_select" ON integrations FOR SELECT USING (has_role('MANAGER'));
CREATE POLICY "integrations_all" ON integrations FOR ALL USING (has_role('ADMIN'));

CREATE POLICY "webhooks_select" ON webhooks FOR SELECT USING (has_role('MANAGER'));
CREATE POLICY "webhooks_all" ON webhooks FOR ALL USING (has_role('ADMIN'));

CREATE POLICY "automation_select" ON automation_rules FOR SELECT USING (has_role('MANAGER'));
CREATE POLICY "automation_all" ON automation_rules FOR ALL USING (has_role('ADMIN'));

CREATE POLICY "backups_select" ON backups FOR SELECT USING (has_role('ADMIN'));
CREATE POLICY "backups_insert" ON backups FOR INSERT WITH CHECK (has_role('ADMIN'));
