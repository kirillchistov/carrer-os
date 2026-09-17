# Career Evidence OS

Next.js 16 (App Router) + Supabase Auth + Prisma (`career_os` schema) + Anthropic.
Продуктовый план: [`docs/product-plan.md`](docs/product-plan.md).

## Local setup

```bash
pnpm install
cp .env.example .env   # fill in Supabase + DB + Anthropic
pnpm db:deploy         # Prisma migrations
# then apply supabase/sql/001_auth_sync_and_rls.sql in the Supabase SQL editor
pnpm dev
```

Useful scripts: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm db:studio`.

## Environment variables

| Variable | Where | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel + local | Anon / publishable key |
| `NEXT_PUBLIC_APP_URL` | Vercel + local | **Required in production**, public `https://…` (not localhost). Used for magic-link / confirm / reset redirects |
| `DATABASE_URL` | Vercel + local | **Transaction pooler**, `*.pooler.supabase.com:6543`. Do not use `db.<project>.supabase.co` on Vercel (IPv6-only, pages 500 after login) |
| `DIRECT_URL` | local / CI migrate | Direct Postgres (port 5432), for `prisma migrate` |
| `ANTHROPIC_API_KEY` | Vercel + local | Optional locally; AI features degrade without it |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel + local | Server-only, for Storage |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Vercel | Optional |

Never commit `.env`.

## Auth on Vercel — runbook

If login / signup / magic link «не работает» on the deployed app, check in this order:

1. **Vercel env.** `NEXT_PUBLIC_APP_URL` is exactly `https://<production-host>` (no trailing slash). Redeploy after changing it — it is inlined at build time.
2. **Supabase → Authentication → URL Configuration.**
   - Site URL = the same production origin.
   - Redirect URLs include `https://<production-host>/auth/callback` (and preview `https://*-<project>.vercel.app/auth/callback` if you use preview deploys).
3. **Email templates** link to `{{ .SiteURL }}/auth/callback?code=…` (PKCE). After clicking, the app exchanges the code and **must** set cookies on the redirect response (`src/app/auth/callback/route.ts`).
4. **Identity trigger.** `supabase/sql/001_auth_sync_and_rls.sql` must be applied once (not a Prisma migration). If `career_os.users` is missing, the app backfills the row; if that also fails, the user sees `/account-unavailable` instead of a 500.
5. **Database URL.** Vercel `DATABASE_URL` must be the Supabase **Transaction pooler** URI (`aws-0-<region>.pooler.supabase.com`, port `6543`, user `postgres.<project-ref>`). The direct host `db.<project>.supabase.co` is IPv6-only — login will work, `/dashboard` will 500.
6. **Confirm email.** If confirmation is on, signup does **not** enter the app until the email link is opened. The UI says to check mail.
7. **Logs.** Server logs emit `{"type":"auth_event",…}` with `event`, `ok`, `reason` — no email, no tokens. DB failures emit `{"type":"db_error",…}` with `hostKind` (`supabase_direct` vs `supabase_pooler`). Sentry captures unhandled errors when `SENTRY_DSN` is set.

Password reset: `/forgot-password` → email → `/auth/callback?next=/reset-password` → `/reset-password`.
