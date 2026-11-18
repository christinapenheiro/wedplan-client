<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WedPlan — Agent Instructions

Wedding planning platform with role-based dashboards. Roles are `Customer | Vendor | Admin` (`IAccountRole` in `src/lib/types.ts`); new users default to `Customer`.

**Current state (early stage):** every dashboard page is a `"use client"` component rendering hardcoded mock data. The only backend route is the Better Auth handler. There is no data layer, no middleware, and no per-route authorization yet. Roadmap: replace mock data with real server-fetched data, add JWT middleware and route authorization — prefer server components when adding real data fetching.

## Commands

```bash
npm run dev      # Turbopack dev server
npm run build    # production build (Turbopack)
npm run start    # production server
npm run lint     # eslint (flat config in eslint.config.mjs)
```

- No tests exist (no test framework, no CI). Verification = `npm run lint` + `npx tsc --noEmit` (typecheck is not scripted).

## Framework quirks

- Next.js `16.4.6` with **React Compiler enabled** (`reactCompiler: true` in `next.config.ts`) — do not add manual `useMemo`/`useCallback` memoization. `cacheComponents` / `partialPrefetching` are present but commented out.
- Tailwind v4 is **CSS-first**: the whole theme (palette, dark variant, fonts, radii) lives in `src/app/globals.css`. There is no `tailwind.config` file; Tailwind is loaded via a `turbopack.rules` CSS loader in `next.config.ts`.
- Only path alias is `@/*` → `./src/*` (tsconfig). The shadcn aliases in `components.json` all resolve through it.
- `README.md` is untouched create-next-app boilerplate (wrong font, wrong structure) — don't trust it.

## Architecture

- `src/app/api/auth/[...all]/route.ts` — the only API route (Better Auth wildcard handler).
- `src/app/(auth)/sign-in|sign-up` — auth pages. Sign-up uploads avatars client-side to ImgBB (`NEXT_PUBLIC_IMGBB_API_KEY`) and sends the `role` field (allowed by `user.additionalFields.role.input: true` in `src/lib/auth.ts`).
- `src/app/dashboard/layout.tsx` (server component) calls `auth.api.getSession({ headers })` and redirects to `/sign-in` when unauthenticated, then passes `role` to `DashboardShell` → `AppSidebar` (`src/components/shared/app-sidebar.tsx`), which renders role-specific nav.
- **Role is navigation UI only** — no middleware, no per-route role checks. New privileged routes need their own guard until JWT middleware lands.
- MongoDB (database `wedplan`) is accessed only through the `MongoClient` in `src/lib/auth.ts` via the Better Auth mongo adapter. There is no `db.ts` or shared query layer.

## Auth conventions

- Server side (layouts, route handlers): `auth` from `@/lib/auth` — e.g. `auth.api.getSession({ headers: await headers() })`.
- Client side: `authClient` from `@/lib/auth-client` — `authClient.useSession()`, `signIn`, `signOut`. Its `baseURL` is hardcoded to `http://localhost:3000`.

## Styling & components

- Shadcn UI (`base-nova` style) over `@base-ui/react` + `class-variance-authority`; icons from `lucide-react`; animation via `motion`.
- Brand palette as CSS variables in `globals.css` `:root`: primary `#99616E`, secondary/accent `#C4B6D0`, border/input `#D2D3D0`. Prefer tokens (`bg-primary`, `border-border`) over raw hex; some existing components hardcode hex classes.
- Font is Lato via `next/font/google`, exposed as `--font-lato` and mapped to `--font-sans` in `globals.css`.

## Code style

- Keep components as server components by default; add `"use client"` only for real interactivity, isolated to leaf components.
- Add a short JSDoc comment on non-obvious functions (what + how, 1–3 sentences) — existing code follows this convention.

## Environment

`.env` (never commit) — variables actually referenced by code:

```env
MONGODB_URI=...                # auth.ts MongoDB connection
BETTER_AUTH_URL=...
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=...           # Google OAuth provider in auth.ts
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_IMGBB_API_KEY=...  # client-side avatar upload at sign-up
```

`RESEND_API_KEY` appears only in commented-out code (no email sending yet). `next.config.ts` allowlists `**.ibb.co` / `**.ibb.co.com` as remote image hosts — add patterns there for any new image CDN.
