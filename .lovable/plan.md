

## Public Credential Page (No Login Required)

### Problem
The `pacientes` and `credenciales` tables have RLS policies that require authentication. A public page cannot query them directly with the anon key.

### Solution
Create an edge function that uses the service role key to look up patient and credential data by DNI, and a new public route `/credencial` with a standalone page.

### Architecture

```text
/credencial (public route, no auth)
    └── PublicCredencial.tsx
            ├── DNI input form
            ├── Calls edge function "public-credencial"
            ├── Renders CredencialCard (reused from existing)
            └── Download as PNG (html2canvas)

Edge Function: public-credencial
    ├── Receives { dni: string }
    ├── Queries pacientes by DNI (service role, bypasses RLS)
    ├── Queries credenciales for that patient
    ├── Queries system_config for logo/name
    └── Returns patient + credential + config data
```

### Changes

1. **New edge function** `supabase/functions/public-credencial/index.ts`
   - Accepts POST with `{ dni }`, validates input
   - Uses service role key to query `pacientes` (where `dni = input AND activo = true`), joining `obras_sociales`
   - Queries `credenciales` for that patient (active, ordered by created_at desc, limit 1)
   - If no credential exists, generates one on the fly (same logic: expiry = last day of current month)
   - Returns patient info, credential, and system_config data
   - Rate limiting: basic DNI format validation only (no sensitive data exposed beyond credential card info)

2. **New page** `src/pages/PublicCredencial.tsx`
   - Standalone page with DNI input, no sidebar/auth
   - Shows system logo/name from the response
   - Reuses the `CredencialCard` visual component (extracted or duplicated inline)
   - Download button using html2canvas

3. **Route addition** in `src/App.tsx`
   - Add `/credencial` route pointing to `PublicCredencial`
   - No auth wrapper needed

### Security Considerations
- The edge function only returns limited patient data (name, DNI, affiliate number, obra social name) — same info that appears on a physical credential card
- No sensitive medical data exposed
- DNI format validation to prevent abuse

