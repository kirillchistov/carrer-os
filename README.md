This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Implementation Plan by Phase
### Phase 1 — Foundation
- create-next-app (TS, App Router, Tailwind, ESLint), shadcn/ui init, pnpm.
git init, initial commit.
- Prisma schema (section 4) + prisma migrate dev; Supabase project wiring (env vars, auth.users → public.users trigger, RLS enabled on every table as defense-in-depth).
- Supabase Auth wiring: server-side session helper, middleware-protected route group (app), (marketing) for /.
- App shell: sidebar nav, dashboard skeleton (empty states), Settings shell.
- track() analytics helper (no-op until Sentry/analytics keys present) + Sentry init.
- Seed script: one demo candidate + 3 opportunities (permanent leadership role, fractional/advisory opportunity, role with a real industry gap).
- Tests: ownership-helper unit tests, Zod env-schema test, smoke test that protected routes redirect unauthenticated users.

### Phase 2 — Candidate knowledge base
- Onboarding wizard (steps + persistence).
- Profile CRUD.
- Experience import: paste text, DOCX upload/extract, PDF best-effort; Document records in Storage; importExperience AI task → draft Experience rows (verificationStatus=unverified).
- Experience review/edit UI; confirm → verified.
- Evidence Bank CRUD incl. AI gap-suggestion task and quality score/explanation.
- Career Track CRUD incl. AI positioning-draft task.
- Base Resume CRUD with structured content JSON + section editor.
- Tests: extraction Zod schemas, evidence quality-score function,career-track ownership.

### Phase 3 — Opportunity workflow
- Opportunity CRUD (manual form).
- Text paste ingestion + URL ingestion (server fetch + OG/text extraction, manual-paste fallback) → AI structuring task → OpportunityRequirement rows.
- Pipeline Kanban (statuses, drag, Task/next-action/follow-up fields).
- Opportunity detail view.
- Tests: URL-fetch failure fallback path, requirement-parsing schema, Kanban status-transition ownership guard.

### Phase 4 — AI value loop
- LlmProvider abstraction + Anthropic implementation + runAiTask() (credits, audit log, Zod validation, feedback-report plumbing).
- CreditAccount/CreditTransaction + balance UI + insufficient-credit UX.
- AiFeedbackReport end-to-end (button → record → Settings history).
- Fit Assessment: deterministic layer (skills/format/location/seniority/evidence-presence scoring) + LLM explanation layer, assembled into the 10-dimension report.
- Resume Change Proposals: diff generation constrained to existing Evidence/Experience IDs, Accept/Reject/Edit flow, DOCX export.
- Outreach/cover-letter draft generator (verified facts only).
- Tests: fit-rule unit tests per dimension, proposal-evidence-citation validator (rejects any proposal referencing an unknown evidence ID), credit-debit transaction atomicity test.

### Phase 5 — Learning loop & polish
- Interview notes CRUD + AI follow-up/learning-extraction task.
- Learnings surfaced back into Evidence Bank / Career Track suggestions (as drafts).
- DOCX export polish, PDF export (best-effort), accessibility pass, responsive pass.
- Resources page (static).
- Full event instrumentation (onboarding_completed … interview_note_created).
- Integration test: onboarding → evidence → opportunity → fit report → proposal acceptance → pipeline stage change.