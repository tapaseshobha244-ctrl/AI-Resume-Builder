# ResumeMint AI

An AI-powered resume builder SaaS that helps users create ATS-optimized resumes, get AI-enhanced content via Google Gemini, analyze their ATS compatibility score, and export professional PDFs.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/resume-mint run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: Firebase Authentication (client-side, via `firebase` SDK)
- AI: Google Gemini (`@google/generative-ai`) — no OpenAI
- Payments: Razorpay placeholder (disabled, not implemented)
- PDF: html2canvas + jsPDF
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/resume-mint/` — React+Vite frontend (SPA at `/`)
  - `src/pages/` — all page components
  - `src/components/` — Navbar, ProtectedRoute, ThemeProvider, template renderers
  - `src/contexts/AuthContext.tsx` — Firebase auth state + helpers
  - `src/lib/firebase.ts` — Firebase app init + `isFirebaseConfigured` guard
  - `src/index.css` — Tailwind theme tokens (light default, dark support)
- `artifacts/api-server/` — Express API (at `/api`)
  - `src/routes/` — resumes, ai, payments, admin, health
  - `src/lib/gemini.ts` — Gemini AI wrapper with fallback logic
  - `src/lib/logger.ts` — pino logger
- `lib/db/` — Drizzle ORM schema (`schema.ts`) and DB client
- `lib/api-spec/` — OpenAPI spec → Orval codegen → React Query hooks

## Architecture decisions

- Firebase Auth is client-side only. The server does NOT use Firebase Admin SDK.
- AI is Google Gemini only (`gemini-1.5-flash`). All AI calls go through `lib/gemini.ts` with offline fallbacks.
- Razorpay is intentionally disabled — the `/payment` page is a placeholder with no live integration.
- Theme defaults to `light`; stored under localStorage key `rm-theme`. Dark mode supported via `.dark` CSS class.
- `isFirebaseConfigured` in `firebase.ts` gates auth features when VITE_FIREBASE_API_KEY/APP_ID are absent, showing a warning banner instead of crashing.

## Product

- **Resume Builder** — 9-step guided form (personal info, education, skills, projects, experience, internships, certifications, achievements, target role)
- **AI Enhancement** — Gemini rewrites summaries, skills, and project descriptions for ATS optimization
- **ATS Score** — Scores resume 0–100 with missing keywords and improvement suggestions
- **Cover Letter** — AI-generated cover letter based on resume data + target company
- **PDF Export** — html2canvas + jsPDF renders the selected template to PDF
- **3 Templates** — ATS Professional, Modern Corporate, Minimal

## User preferences

- Default theme: light mode
- AI provider: Google Gemini only (no OpenAI anywhere)
- Payments: Razorpay disabled, placeholder only

## Gotchas

- `VITE_FIREBASE_API_KEY` and `VITE_FIREBASE_APP_ID` must be set for client-side auth to work. Without them, the app shows a warning banner and disables auth buttons gracefully.
- The Firebase PRIVATE_KEY secret is the Admin SDK credential (server-side). The frontend uses a separate Web SDK config (API key + App ID from Firebase Console → Your Apps → Web).
- Never use `console.log` in server code — use `req.log` in route handlers, `logger` singleton elsewhere.
- Do not run `pnpm dev` at workspace root — use workflow restart or per-package dev commands.
- After changing Drizzle schema: run `pnpm --filter @workspace/db run push` to apply to dev DB.
- After changing OpenAPI spec: run `pnpm --filter @workspace/api-spec run codegen` to regenerate hooks.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Firebase Web config (for VITE_FIREBASE_API_KEY): Firebase Console → Project Settings → Your apps → Web app → SDK setup
