-- KeevOS Demo Seed Data (SQL version)
-- Run this AFTER schema.sql and policies.sql
-- Note: For full seed data, use: npm run db:seed

-- Insert default automation rules
INSERT INTO automation_rules (id, name, trigger_type, conditions_json, actions_json, is_active) VALUES
(
  gen_random_uuid()::text,
  'Documents Needed → Create Follow-up Task',
  'case.status_changed',
  '{"status": "DOCUMENTS_NEEDED"}'::jsonb,
  '{"type": "create_task", "title": "Collect missing documents", "priority": "HIGH"}'::jsonb,
  true
),
(
  gen_random_uuid()::text,
  'Overdue Task → Update Status',
  'task.due_date_passed',
  '{"status": ["PENDING", "IN_PROGRESS"]}'::jsonb,
  '{"type": "update_status", "status": "OVERDUE"}'::jsonb,
  true
),
(
  gen_random_uuid()::text,
  'Tenant Housed → Close Case Tasks',
  'tenant.status_changed',
  '{"status": "HOUSED"}'::jsonb,
  '{"type": "close_case_tasks"}'::jsonb,
  true
),
(
  gen_random_uuid()::text,
  'Property Occupied → Remove from Suggestions',
  'property.status_changed',
  '{"status": "OCCUPIED"}'::jsonb,
  '{"type": "remove_from_matching"}'::jsonb,
  true
);

-- Use npm run db:seed for the full realistic dataset
-- (40 contacts, 15 tenants, 10 landlords, 6 brokers, etc.)
