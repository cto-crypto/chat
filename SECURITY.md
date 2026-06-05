# KeevOS Security Documentation

## Authentication

- **Provider**: Supabase Auth (JWT-based)
- **Session management**: Supabase SSR with secure HTTP-only cookies
- **Password hashing**: Handled by Supabase (bcrypt)
- **Route protection**: Next.js middleware checks session on every protected route

## Authorization

### Role-Based Access Control (RBAC)

Five roles with hierarchical permissions:
- **Owner** → Full system access
- **Admin** → Full operational access (no org settings deletion)
- **Manager** → Manage contacts, cases, properties, documents
- **Staff** → Create/edit records, add notes and tasks
- **Viewer** → Read-only access

### Server-Side Enforcement

Permissions are checked at **three levels**:
1. **Middleware** (`middleware.ts`) — Route-level auth check
2. **API Routes** — Server-side role validation before any data mutation
3. **Database** — Supabase Row Level Security (RLS) policies

Never rely only on UI hiding.

## Row Level Security (RLS)

All tables have RLS enabled. Key policies:
- Users can only read data they have access to
- `STAFF` and above can create/update records
- Only `ADMIN` and `OWNER` can delete records
- Profiles can only be updated by their owner (or admin)

RLS policies are in `supabase/policies.sql`.

## API Security

### External API Keys

- All `/api/*` routes that accept external calls require `x-api-key` header
- Key stored in `KEEVOS_API_KEY` environment variable (server-side only)
- Never expose API keys in frontend code

### Rate Limiting

In-memory rate limiting is implemented in `lib/security/api-auth.ts`:
- Default: 60 requests per minute per IP
- Applies to GET and POST external API endpoints

For production, use Redis-backed rate limiting (Upstash Redis recommended).

### Input Validation

All user inputs are validated with Zod schemas (`lib/validations/schemas.ts`):
- String length limits
- Type validation
- Enum validation
- Email format validation

## File Upload Security

- **Allowed MIME types**: PDF, JPEG, PNG, WEBP, DOC, DOCX only
- **Max file size**: 10MB
- **No executable uploads**: `.exe`, `.sh`, `.js`, etc. are blocked
- **Storage**: Private Supabase Storage bucket
- **Access**: Signed URLs with expiry (never public URLs for sensitive docs)

## Document Storage

- Storage bucket is **private** by default
- Files accessed via short-lived signed URLs
- Service role key used only server-side for signed URL generation
- Storage policies in `supabase/storage.sql`

## Environment Variables

| Variable | Exposure | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Browser | Safe — public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser | Safe — has RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | NEVER expose to browser |
| `KEEVOS_API_KEY` | Server only | NEVER expose to browser |
| `DATABASE_URL` | Server only | NEVER expose to browser |

## Audit Logging

All sensitive actions are logged in `activity_logs` table:
- Record creation, updates, deletions
- Document uploads
- Status changes
- Authentication events

Logs are append-only (no update/delete permissions on activity_logs for non-owners).

## Sensitive Data Handling

- Phone numbers and emails stored in plaintext (encrypted at rest by Supabase)
- No SSNs or highly sensitive PII stored in this system
- Document files stored in Supabase Storage (encrypted at rest)

## CSRF Protection

Next.js App Router's server actions include CSRF protection by default.
For external API endpoints, API key validation provides equivalent protection.

## Dependency Security

Run regularly:
```bash
npm audit
npm audit fix
```

## Security Incident Response

1. Immediately rotate `KEEVOS_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
2. Review `activity_logs` for unauthorized actions
3. Revoke compromised Supabase tokens in Dashboard
4. Review and tighten RLS policies if needed
5. Notify affected users if data was accessed

## Penetration Testing

Before production deployment, perform:
- SQL injection testing on API endpoints
- Auth bypass attempts
- File upload abuse testing
- Rate limit bypass testing
- XSS testing on form inputs
