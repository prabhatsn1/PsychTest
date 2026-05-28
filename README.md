# PsychProfile

A web-based psychological assessment platform for schools and counsellors. Admins upload student assessment scores; students log in with their registered mobile number to view a personalised trait profile and career guidance report.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Repository Structure](#3-repository-structure)
4. [Key Design Decisions](#4-key-design-decisions)
5. [Core Workflows](#5-core-workflows)
6. [Configuration & Environment](#6-configuration--environment)
7. [Development Guide](#7-development-guide-internal)
8. [Non-Functional Aspects](#8-non-functional-aspects)
9. [Limitations & Known Gaps](#9-limitations--known-gaps)
10. [Appendix](#10-appendix)

---

## 1. Project Overview

### Problem

Schools and counsellors conduct paper-based or spreadsheet-driven psychometric assessments that are hard to distribute back to students. There is no self-service way for a student to retrieve their personalised result.

### System Description

PsychProfile is a full-stack Next.js application with two distinct user roles:

| Role    | How they authenticate           | What they can do                                            |
|---------|---------------------------------|-------------------------------------------------------------|
| Admin   | Email + password → JWT cookie   | Upload reports, view all reports, delete reports            |
| Student | 10-digit mobile number → cookie | View their own trait profile, scores, and career guidance   |

The system scores students across four personality traits (Analytical, Reflective, Creative, Leader) and renders an interactive report with charts and career recommendations.

### Target Users

- **School counsellors / administrators** — create and manage student reports.
- **Students (age ~14–18)** — view their own assessment results.
- **School management / stakeholders** — non-technical reviewers of the system.

---

## 2. Architecture Overview

### High-Level Diagram

```
Browser
  │
  ├─ GET  /                        → Student login page (Server Component)
  ├─ GET  /admin/login             → Admin login page  (Server Component)
  ├─ GET  /admin/dashboard         → Admin dashboard   (Server + Client Components)
  └─ GET  /student/report          → Student report    (Server + Client Components)
        │
        │   Next.js App Router (v16)
        │   ┌──────────────────────────────────────────────┐
        │   │  proxy.ts  (route-guard / middleware layer)  │
        │   │  – Protects /admin/dashboard, /student/report│
        │   │    and /api/reports via JWT / cookie checks  │
        │   └──────────────────────────────────────────────┘
        │
        ├─ Server Actions (app/actions/)
        │     adminLogin / adminLogout
        │     studentLogin / studentLogout
        │     checkDbConnection
        │
        ├─ API Routes (app/api/reports/)
        │     POST   /api/reports        → Create report + optional PDF upload
        │     GET    /api/reports        → List all reports (admin only)
        │     DELETE /api/reports/[id]   → Delete report + PDF file
        │
        └─ Database layer (lib/prisma.ts)
              ├─ Production: Prisma + @prisma/adapter-pg → Neon PostgreSQL (serverless)
              └─ Development / CI: in-memory MockPrisma (USE_MOCK_DB=true)
```

### Major Components

| Component | Location | Responsibility |
|---|---|---|
| Route guard | `proxy.ts` | JWT / cookie validation before pages and API routes are reached |
| Auth utilities | `lib/auth.ts` | JWT creation & verification (`jose`), session cookie helpers |
| Database client | `lib/prisma.ts` | Singleton Prisma client; switches to mock based on env var |
| Mock database | `lib/mock-prisma.ts` | In-memory replacement for Prisma, seeded with sample data |
| Trait engine | `lib/traits.ts` | Converts raw scores into `TraitProfile` objects with descriptions & careers |
| Error helpers | `lib/db-errors.ts` | Detects database connectivity errors from Prisma error codes |
| Admin actions | `app/actions/admin.ts` | Server Actions: login, logout |
| Student actions | `app/actions/student.ts` | Server Actions: login, logout |
| Reports API | `app/api/reports/` | REST handlers for report CRUD + PDF file handling |
| Admin dashboard | `app/admin/dashboard/` | Server Component (data fetch) + Client Component (interactive UI) |
| Student report | `app/student/report/` | Server Component (data fetch) + Client Component (charts, animations) |
| Upload form | `components/UploadForm.tsx` | Client form that POSTs multipart data to `/api/reports` |
| Report list | `components/ReportList.tsx` | Client table of reports with inline delete |

### Architectural Patterns

- **Next.js App Router** — file-system routing with Server and Client Components.
- **Server Actions** — form submissions handled server-side without a dedicated API route (login flows).
- **Layered architecture** — UI → Actions/API Routes → lib (auth, traits, db) → database.
- **Strategy pattern for database** — `lib/prisma.ts` exports the same interface whether backed by Prisma or the mock, chosen at startup via an environment variable.

### External Dependencies

| Dependency | Purpose |
|---|---|
| Neon (`@neondatabase/serverless`) | Serverless PostgreSQL host |
| Prisma 7 + `@prisma/adapter-pg` | ORM + PostgreSQL driver adapter |
| `jose` | JWT signing and verification (RFC-compliant, edge-compatible) |
| `bcryptjs` | Password hashing |
| Recharts | Score visualisation charts in student report |
| Framer Motion | Animations in student report view |
| Tailwind CSS v4 | Utility-first styling |
| Zod | Input validation (available; usage scope is limited — see §9) |

---

## 3. Repository Structure

```
psych_test/
├── app/                        # Next.js App Router root
│   ├── layout.tsx              # Root layout (fonts, global styles)
│   ├── page.tsx                # "/" — Student login page
│   ├── globals.css             # Global CSS / Tailwind base
│   ├── actions/
│   │   ├── admin.ts            # Server Actions: adminLogin, adminLogout
│   │   ├── student.ts          # Server Actions: studentLogin, studentLogout
│   │   └── health.ts           # Server Action: checkDbConnection
│   ├── admin/
│   │   ├── login/page.tsx      # Admin login UI
│   │   └── dashboard/
│   │       ├── page.tsx        # Server Component — fetches reports, guards session
│   │       └── AdminDashboardClient.tsx  # Client Component — state, upload, delete
│   ├── api/
│   │   └── reports/
│   │       ├── route.ts        # GET (list) + POST (create + PDF upload)
│   │       └── [id]/route.ts   # DELETE (report + PDF file)
│   └── student/
│       └── report/
│           ├── page.tsx        # Server Component — fetches report, builds traits
│           └── ReportView.tsx  # Client Component — renders charts, profile, careers
├── components/
│   ├── UploadForm.tsx          # Multipart form → POST /api/reports
│   └── ReportList.tsx          # Tabular list with delete action
├── lib/
│   ├── auth.ts                 # JWT helpers + cookie session readers
│   ├── db-errors.ts            # Database connectivity error detection
│   ├── mock-prisma.ts          # In-memory Prisma-compatible database
│   ├── prisma.ts               # Prisma singleton / mock selector
│   ├── traits.ts               # Trait scoring logic and definitions
│   └── types.ts                # Shared TypeScript interfaces
├── prisma/
│   ├── schema.prisma           # Database schema (Admin, Report models)
│   └── seed.ts                 # Seed script: creates default admin + sample reports
├── generated/
│   └── prisma/                 # Auto-generated Prisma Client (do not edit manually)
├── public/
│   └── uploads/                # PDF files uploaded by admin (served statically)
├── proxy.ts                    # Route guard (Next.js 16 middleware convention)
├── prisma.config.ts            # Prisma CLI config (schema path, DATABASE_URL)
├── next.config.ts              # Next.js configuration (currently default)
├── tsconfig.json               # TypeScript configuration
├── eslint.config.mjs           # ESLint (flat config, next plugin)
└── postcss.config.mjs          # PostCSS (Tailwind v4)
```

### Entry Points

| URL | Entry file | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Student login; redirects to `/student/report` on success |
| `/admin/login` | `app/admin/login/page.tsx` | Admin login with DB status indicator |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | Protected; redirects to login if no valid JWT |
| `/student/report` | `app/student/report/page.tsx` | Protected; redirects to `/` if no mobile cookie |

---

## 4. Key Design Decisions

### 1. Dual authentication model

- **Admins** use email/password with a JWT (`HS256`, 8-hour expiry) stored in an `httpOnly` cookie. The JWT is verified on every protected request via `proxy.ts`.
- **Students** are identified solely by their mobile number (no password). A cookie stores the mobile for the session (2-hour expiry). The assumption is that mobile numbers are distributed privately by the counsellor.

  *Trade-off:* Simpler UX for students at the cost of weaker authentication — anyone who knows a student's mobile number can view their report.

### 2. Server Actions for auth forms

Login and logout are implemented as Next.js Server Actions rather than API routes. This leverages `useActionState` for progressive-enhancement form handling and avoids extra network round-trips.

### 3. Mock database (`USE_MOCK_DB=true`)

A full in-memory implementation of the Prisma interface (`lib/mock-prisma.ts`) can replace the real database without changing any application code. This enables development and demonstration without a live Neon connection.

  *Trade-off:* The mock is not persisted across server restarts. It does not implement advanced query features (e.g. `where` with operators, `skip`/`take` pagination).

### 4. PDF storage on the local filesystem

Uploaded PDFs are saved to `public/uploads/` and served as static assets. The file is named `{mobile}_{timestamp}.pdf`.

  *Trade-off:* Simple to implement; does not scale to multiple server instances or serverless deployments. A production setup should use object storage (e.g. S3, Neon Blob, Cloudflare R2).

### 5. Prisma with PostgreSQL adapter

Prisma 7 uses the new adapter-based driver model (`@prisma/adapter-pg`). This decouples the Prisma engine from the underlying driver, which is required for edge/serverless environments.

### 6. Score validation (total = 10)

The API enforces that `scoreA + scoreB + scoreC + scoreD === 10`. This reflects an assessment design where students allocate 10 points across four categories.

### 7. `proxy.ts` instead of `middleware.ts`

Next.js 16 introduces `proxy.ts` as the recommended middleware file. The standard `middleware.ts` convention is deprecated in this version.

---

## 5. Core Workflows

### 5.1 Admin Login

```
1. Admin navigates to /admin/login
2. Browser renders AdminLoginPage (client component)
   - Simultaneously calls checkDbConnection to display DB status badge
3. Admin submits email + password via form
4. Server Action adminLogin() runs:
   a. Validates that both fields are present
   b. Queries prisma.admin.findUnique({ where: { email } })
   c. Compares submitted password with bcrypt hash
   d. On success: creates HS256 JWT (8h), sets httpOnly cookie "admin_token"
   e. Redirects to /admin/dashboard
5. proxy.ts verifies "admin_token" on all subsequent /admin/dashboard requests
```

### 5.2 Report Upload (Admin)

```
1. Admin clicks "Upload Report" on dashboard
2. UploadForm renders inline
3. Admin fills: student name, mobile, class, date, scores (A/B/C/D), optional PDF
4. Form submitted via fetch POST /api/reports (multipart/form-data)
5. API route (app/api/reports/route.ts) POST handler:
   a. Re-validates admin JWT (getAdminSession)
   b. Validates required fields + mobile format + total score == 10
   c. Checks for duplicate mobile (409 if exists)
   d. If PDF provided: saves to public/uploads/{mobile}_{timestamp}.pdf
   e. Creates prisma.report record with all fields + pdfPath
   f. Returns { success: true, data: report }
6. AdminDashboardClient prepends new report to its local state list
```

### 5.3 Student Login & Report View

```
1. Student navigates to / (StudentLoginPage)
2. Student enters 10-digit mobile number
3. Server Action studentLogin() runs:
   a. Validates 10-digit format with regex
   b. Queries prisma.report.findUnique({ where: { mobile } })
   c. If no report: returns error "No report found…"
   d. On success: sets httpOnly cookie "student_mobile" (2h expiry)
   e. Redirects to /student/report
4. StudentReportPage (server component):
   a. Reads "student_mobile" cookie via getStudentSession()
   b. Fetches full report from database
   c. Calls buildTraitProfiles(scoreA, scoreB, scoreC, scoreD)
      → Normalises scores to percentages
      → Attaches labels, descriptions, strengths, career lists
   d. Calls getDominantAndSecondary() → top two traits by raw score
   e. Passes all data to ReportView (client component)
5. ReportView renders:
   - Student info header
   - Recharts chart of trait percentages
   - Dominant and secondary trait cards
   - Strengths and career suggestions
   - PDF download link (if pdfPath is set)
```

### 5.4 Report Deletion (Admin)

```
1. Admin clicks delete button on a report row
2. ReportList calls fetch DELETE /api/reports/{id}
3. API route DELETE handler:
   a. Re-validates admin JWT
   b. Fetches report to check existence
   c. If pdfPath exists: attempts fs.unlink() (errors silently if file missing)
   d. Calls prisma.report.delete({ where: { id } })
   e. Returns { success: true }
4. AdminDashboardClient removes the report from local state
```

### 5.5 Error Handling

- **Database connection errors** (network timeout, Neon cold-start, etc.) are caught via `isDatabaseConnectionError()` in `lib/db-errors.ts`. These surface a user-friendly "Service is temporarily unavailable" message rather than an unhandled exception.
- **Invalid JWT / expired token**: `proxy.ts` deletes the cookie and redirects to the login page.
- **Missing session cookie**: Both the proxy layer and individual Server Components independently redirect to the correct login page.
- **Duplicate mobile upload**: Returns HTTP 409 with a clear error message.
- **Score constraint violation**: Returns HTTP 400 before any database write.

---

## 6. Configuration & Environment

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes (production) | PostgreSQL connection string (e.g. Neon `postgresql://...?sslmode=require`) |
| `JWT_SECRET` | Strongly recommended | Secret key for signing admin JWTs. Falls back to `"fallback-dev-secret"` if unset — **do not use the fallback in production** |
| `USE_MOCK_DB` | No | Set to `"true"` to use the in-memory mock database instead of PostgreSQL |
| `ADMIN_EMAIL` | No | Override default seed admin email (`admin@psychtest.com`) |
| `ADMIN_PASSWORD` | No | Override default seed admin password (`Admin@123`) |
| `NODE_ENV` | Automatic | Set by Next.js; affects cookie `secure` flag and Prisma singleton behaviour |

### Local `.env` Example

```env
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-random-256-bit-secret
# USE_MOCK_DB=true   # uncomment to skip database
```

### Build & Run

```bash
npm run dev      # Development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint check
```

### Database Setup

```bash
# Generate Prisma Client (must run after schema changes)
npx prisma generate

# Push schema to database (development — no migration history)
npx prisma db push

# Run seed (creates default admin + 4 sample reports)
npx tsx prisma/seed.ts
```

---

## 7. Development Guide (Internal)

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL database **or** `USE_MOCK_DB=true` for offline development
- `npm` (or compatible package manager)

### Local Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd psych_test

# 2. Install dependencies
npm install

# 3. Create environment file and fill in values (see §6)
touch .env

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema & seed (skip if using mock)
npx prisma db push
npx tsx prisma/seed.ts

# 6. Start dev server
npm run dev
```

For fully offline development (no Postgres needed):

```bash
USE_MOCK_DB=true npm run dev
```

Default mock credentials:
- **Admin**: `admin@psychtest.com` / `Admin@123`
- **Student mobile** (sample): `9876543210`, `9876543211`, `9876543212`, `9876543213`

### Coding Conventions

- **TypeScript strict mode** — all shared types live in `lib/types.ts`.
- **Server vs Client Components** — data fetching and auth checks happen in Server Components; interactive state (forms, toggles, charts) lives in Client Components (`"use client"`).
- **Server Actions** — auth mutations use `useActionState` + Server Actions; non-auth mutations (report CRUD) use `fetch` to API routes.
- **Error propagation** — connection errors are caught and downgraded to user messages; all other errors are re-thrown to Next.js error boundaries.
- **Date serialisation** — `Date` objects are converted to ISO strings before being passed from Server Components to Client Components (Next.js serialisation boundary).

### Adding a New Feature

**Example: Add a new trait "E" (Entrepreneurial)**

1. Add `scoreE Int @default(0)` to `prisma/schema.prisma`.
2. Run `npx prisma generate && npx prisma db push`.
3. Add the trait definition object to `lib/traits.ts` → `traitDefinitions`.
4. Update `lib/types.ts` → `Student` interface with `scoreE: number`.
5. Update the upload form (`components/UploadForm.tsx`) and score validation in `app/api/reports/route.ts` (adjust total constraint from 10 if needed).
6. Update `lib/mock-prisma.ts` sample data to include `scoreE`.

**Example: Add pagination to the admin report list**

1. Add `skip`/`take` query params to `GET /api/reports`.
2. Update `prisma.report.findMany` call with `skip` and `take`.
3. Add pagination state to `AdminDashboardClient.tsx`.
4. Note: the mock `findMany` does not currently support `skip`/`take` — update `lib/mock-prisma.ts` accordingly.

---

## 8. Non-Functional Aspects

### Security

- **Passwords** are hashed with `bcryptjs` (cost factor 12).
- **JWTs** use `HS256` via `jose`. Tokens expire after 8 hours. Invalid tokens delete the cookie immediately.
- **HttpOnly cookies** prevent JavaScript access to session tokens.
- **`secure` cookie flag** is set when `NODE_ENV === "production"`, ensuring cookies are only sent over HTTPS.
- **`sameSite: "lax"`** on all cookies mitigates CSRF for top-level navigations.
- **Route guard** (`proxy.ts`) enforces authentication at the middleware layer, before pages or API handlers execute. API routes also re-verify the session independently (defence in depth).
- **File upload sanitisation**: PDF filenames are derived only from the mobile number (digits only) and a timestamp — user-supplied filenames are ignored.
- **⚠ Open concern**: `JWT_SECRET` falls back to a hardcoded string if the environment variable is absent. Any deployment missing this variable is cryptographically insecure.
- **⚠ Open concern**: Student authentication relies solely on knowing a mobile number. There is no rate limiting on the student login endpoint.

### Performance

- The Prisma client is created as a singleton (`globalForPrisma.prisma`) to avoid exhausting database connections during Next.js hot-reloads in development.
- The dashboard page fetches all reports server-side on initial load; large datasets will increase TTFB. Pagination is not yet implemented.
- Neon's serverless driver adds cold-start latency on the first query after idle periods. The `isDatabaseConnectionError` handler gracefully surfaces this to users.

### Scalability

- **PDF files** are stored on the local filesystem (`public/uploads/`). This does not scale horizontally and is incompatible with serverless deployment platforms (e.g. Vercel).
- The in-memory mock database is reset on every server restart and is not suitable for production.
- No caching layer is present.

### Logging & Monitoring

- No structured logging library is used. Errors are either surfaced to the user or re-thrown to Next.js's default error handler.
- No distributed tracing or APM integration is present.
- The `checkDbConnection` health action can be used as a lightweight liveness probe.

---

## 9. Limitations & Known Gaps

| Area | Gap / Limitation |
|---|---|
| Authentication | Student auth has no rate limiting; enumeration of mobile numbers is possible |
| Authentication | `JWT_SECRET` has an insecure hardcoded fallback |
| File storage | PDFs stored on local filesystem; incompatible with serverless / multi-instance deployments |
| Pagination | Admin dashboard loads all reports in a single query; will degrade at scale |
| Input validation | `zod` is listed as a dependency but not used; validation is manual in API routes |
| Testing | No automated tests (unit, integration, or end-to-end) are present |
| Error boundaries | No custom Next.js `error.tsx` files; unhandled errors fall through to the framework default |
| `.env.example` | No example environment file is committed to the repository |
| Admin management | No UI to create, update, or delete admin accounts after the initial seed |
| PDF security | No file size limit or MIME-type enforcement on the PDF upload endpoint |
| Accessibility | Not audited for WCAG compliance |
| Internationalisation | UI is English-only; no i18n infrastructure |
| Seed idempotency | `seed.ts` skips admin creation if the email exists, but does not skip sample reports — re-running may create duplicates |

---

## 10. Appendix

### Glossary

| Term | Definition |
|---|---|
| **Trait** | One of four personality dimensions: Analytical (A), Reflective (B), Creative (C), Leader/Action-Taker (D) |
| **Score** | An integer (0–10) representing how many of the 10 assessment points a student allocated to a given trait |
| **Dominant trait** | The trait with the highest raw score |
| **Secondary trait** | The trait with the second-highest raw score |
| **Server Action** | A Next.js feature allowing a server-side async function to be called directly from a form in a Client Component |
| **Mock DB** | The in-memory `MockPrisma` implementation used when `USE_MOCK_DB=true` |
| **Neon** | A serverless PostgreSQL provider; the intended production database host |
| **Proxy** | `proxy.ts` — the Next.js 16 middleware file (replaces the deprecated `middleware.ts`) |
| **CUID** | A collision-resistant unique identifier used as the primary key type by Prisma |

### Assumptions Made During Documentation

- The four trait scores always sum to 10 by design (10 assessment questions, one point each), enforced server-side.
- The `+91` country code prefix in the student login UI indicates the application targets Indian phone numbers.
- Neon PostgreSQL is the intended production database, inferred from `prisma.config.ts` comments and the `@neondatabase/serverless` dependency.
- No CI/CD pipeline configuration files (GitHub Actions, Dockerfile, etc.) exist in the repository at the time of writing.

### Open Questions for Maintainers

1. Should student report access be further restricted (e.g. one-time link, OTP verification)?
2. Where should PDF files be stored in production? (S3, Cloudflare R2, and Neon Blob are common choices for Next.js deployments.)
3. Is there a plan to implement pagination or search/filter on the admin dashboard?
4. Should Zod be wired into API route handlers to replace the manual validation checks?
5. Is there a multi-school / multi-admin requirement? The current schema has no tenant concept.
6. What is the intended deployment platform? The local filesystem PDF storage must be addressed before deploying to any serverless host.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
