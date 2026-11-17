<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# WedPlan — Wedding Planning Web Application

Welcome to **WedPlan**. This document serves as the primary technical specification, architectural guideline, and coding standard for all AI agents and developers working on this codebase.

---

## 1. Project Overview & Domain

**WedPlan** is a modern, responsive wedding planning web application designed to help couples, wedding planners, and guests streamline the wedding lifecycle.

### Core Feature Domains
- **Guest Management & RSVP**: Guest lists, meal preferences, dietary restrictions, attendance tracking, and invitation management.
- **Budget & Expense Tracking**: Categorized budgeting, payment milestones, deposits, and vendor quotes.
- **Vendor Management**: Directory and management of venues, caterers, photographers, florists, music/DJs, decorators, etc.
- **Checklist & Timeline**: Countdown checklists, tasks assignment, and day-of-event schedule runsheets.
- **Seating & Floor Plans**: Table allocations, guest pairings, and venue floor layout visualization.
- **Registry & Wishes**: Gift registry links, honeymoon funds, and personalized messages.

---

## 2. Tech Stack & Dependencies

| Area | Technology / Library | Version / Details |
|---|---|---|
| **Framework** | Next.js (App Router, Turbopack) | `16.4.6` (React Compiler, `cacheComponents`, `partialPrefetching`) |
| **Core UI** | React / React DOM | `19.3.0` |
| **Language** | TypeScript | `^5` (Strict mode enabled) |
| **Database** | MongoDB Native Driver | `^7.9.0` (Database name: `wedplan`) |
| **Authentication** | Better Auth + Mongo Adapter | `^1.7.25` (Email/Password, Google OAuth, JWT plugin, session cookies) |
| **Styling** | Tailwind CSS v4 + Turbopack | `4.3.3` (`@tailwindcss/turbopack`, `tw-animate-css`, CSS variables with `oklch`) |
| **Component Primitives** | Base UI + Shadcn UI (`base-nova`) | `@base-ui/react` (`^1.9.0`), `class-variance-authority` (`^0.7.1`), `cn` |
| **Icons** | Lucide React | `^1.74.0` |
| **Animations** | Motion (Framer Motion) | `^14.14.0` |

---

## 3. Brand Theme & Color Palette

WedPlan utilizes an elegant, romantic wedding-inspired palette defined by three core colors:

| Color Role | Hex Code | Purpose & Application |
|---|---|---|
| **Primary / Deep Accent** | `#99616E` | Main interactive brand color (CTA buttons, active ring highlights, key icons, focused states) |
| **Secondary / Pastel Lilac** | `#C4B6D0` | Soft romantic accent (active cards, selection borders, badges, tint overlays) |
| **Neutral / Warm Mist** | `#D2D3D0` | Structural neutral (subtle borders, divider lines, inputs, surface boundaries) |

---

## 4. Architecture & File Structure

```
wedplan_client/
├── public/                 # Static assets (SVGs, logos, icons)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # Route handlers
│   │   │   └── auth/       # Better Auth wildcard handler ([...all]/route.ts)
│   │   ├── globals.css     # Tailwind v4 theme definitions and CSS variables
│   │   ├── layout.tsx      # Root layout with Lato font and base styles
│   │   └── page.tsx        # Application landing / home page
│   ├── components/
│   │   └── ui/             # Reusable UI primitives based on @base-ui/react & CVA
│   │       └── button.tsx  # Example Base UI button with variants
│   ├── hooks/              # Custom React client hooks
│   └── lib/
│       ├── auth.ts         # Better Auth server configuration & MongoDB adapter
│       ├── auth-client.ts  # Better Auth client instance (createAuthClient)
│       └── utils.ts        # Helper utilities (e.g., `cn` class merging)
├── components.json         # Shadcn configuration (base-nova, Base UI)
├── next.config.ts          # Next.js configuration (Turbopack, compiler flags)
├── package.json            # Dependencies and scripts
└── tsconfig.json           # Path aliases (@/* -> ./src/*)
```

### Path Aliases
Import using standard path aliases defined in `tsconfig.json` and `components.json`:
- `@/components/*` -> `src/components/*`
- `@/components/ui/*` -> `src/components/ui/*`
- `@/lib/*` -> `src/lib/*`
- `@/hooks/*` -> `src/hooks/*`
- `@/*` -> `src/*`

---

## 5. Coding Standards & Agent Principles

All agents must adhere to the following coding principles:

### A. Simplicity & Readability First
- Write **clean, easy-to-read, standard TypeScript/React code**. Avoid premature optimizations, convoluted abstractions, or deeply nested utility chains.
- Prefer self-explanatory naming conventions (e.g., `calculateRemainingBudget`, `updateGuestRsvpStatus`) over abbreviated names.

### B. Short Explanatory Comments on Difficult Functions
- Always add **short, concise comments** above complex or non-obvious algorithms, data transformations, calculation engines, or security checks.
- State **what** the function does and **how** it works in 1–3 clear sentences.
- Example:
  ```typescript
  /**
   * Distributes guests across available table capacities while respecting
   * dietary grouping constraints and avoiding conflicting guest pairs.
   * Uses a greedy assignment algorithm prioritized by party size.
   */
  export function arrangeTableSeating(guests: Guest[], tables: Table[]): SeatingResult {
    // ...
  }
  ```

### C. Server Components by Default (Next.js 16)
- Keep components as React Server Components (RSC) by default for performance and SEO.
- Add `"use client"` only when interactive state (`useState`, `useEffect`, event listeners), browser APIs, or custom hooks are strictly required.
- Isolate client-side state into leaf components to maximize server-rendered coverage.

### D. Authentication Usage
- **Server-side**: Use `auth` from `@/lib/auth` (e.g. `auth.api.getSession({ headers })` inside route handlers or server actions).
- **Client-side**: Use `authClient` from `@/lib/auth-client` (e.g., `authClient.useSession()`, `authClient.signIn`, `authClient.signOut`).

### E. Database Access (MongoDB)
- Connect through the established MongoDB client or shared client instance in `@/lib/auth.ts` / `@/lib/db.ts`.
- Ensure indexes are defined for frequently queried fields (e.g., `weddingId`, `userId`, `email`).
- Structure collections logically around the wedding domain (e.g., `weddings`, `guests`, `budget_items`, `vendors`, `tasks`).

### F. Styling & Component Design
- Use Tailwind CSS v4 classes mapped with CSS variables (`primary`, `secondary`, `muted`, `accent`, `card`, `destructive`).
- Use Base UI (`@base-ui/react`) primitives wrapped with `class-variance-authority` (`cva`) for consistent accessibility and custom styling.
- Use `motion` for smooth, purposeful animations (modal transitions, step wizards, drawer slides).

---

## 6. Environment Variables Reference

Ensure the following environment variables are configured in `.env` (never commit secrets):

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Better Auth Configuration
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secure-random-auth-secret

# Google OAuth (Optional / Configured in auth.ts)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ImgBB API Key (For Profile Image uploads)
NEXT_PUBLIC_IMGBB_API_KEY=your_imgbb_api_key

# Email Service (e.g., Resend for RSVP invites & password resets)
# RESEND_API_KEY=re_your_api_key
```

---

## 7. Common Development Commands

```bash
# Start local development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint validation
npm run lint
```
