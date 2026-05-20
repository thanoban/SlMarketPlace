# Development Plan — SL Events Platform

## Build Order (MVP Only)

### Phase 0 — Project Setup
- [x] Initialize Next.js 15 + TypeScript + Tailwind CSS
- [x] Create directory structure
- [x] Write documentation (README, CLAUDE.md, ARCHITECTURE.md)
- [ ] Install all dependencies (`npm install`)
- [ ] Configure `next.config.ts`
- [ ] Configure `tailwind.config.ts`
- [ ] Configure `postcss.config.js`
- [ ] Configure `tsconfig.json`
- [ ] Create `.env.local.example`
- [ ] Create `.gitignore`

### Phase 1 — Database & Models
- [ ] `src/lib/mongodb.ts` — MongoDB connection singleton
- [ ] `src/lib/constants.ts` — Districts array, default interest seeds, status enums
- [ ] `src/models/User.ts` — Mongoose User schema + model
- [ ] `src/models/Club.ts` — Mongoose Club schema + model
- [ ] `src/models/Interest.ts` — Mongoose Interest schema + model
- [ ] `src/models/Event.ts` — Mongoose Event schema + model
- [ ] `src/models/SavedEvent.ts` — Mongoose SavedEvent schema + model
- [ ] `src/models/Report.ts` — Mongoose Report schema + model
- [ ] `scripts/seed.ts` — Seed admin user + 16 interest categories + sample events

### Phase 2 — Authentication
- [ ] Install `next-auth@beta`, `bcryptjs`, `@auth/mongodb-adapter`
- [ ] `src/app/api/auth/[...nextauth]/route.ts` — NextAuth credentials provider
- [ ] `src/lib/auth.ts` — Auth config export (used by server components + middleware)
- [ ] `src/middleware.ts` — Route protection (redirect unauthenticated users)
- [ ] `src/app/(auth)/login/page.tsx` — Login form
- [ ] `src/app/(auth)/signup/page.tsx` — Signup form (role selection: attendee | club)
- [ ] `src/app/api/auth/signup/route.ts` — POST /api/auth/signup (create user)

### Phase 3 — Onboarding
- [ ] `src/app/onboarding/page.tsx` — Interest multi-select + district picker (attendees only)
- [ ] `src/app/api/onboarding/route.ts` — Save interests + district to user doc
- [ ] Redirect logic: after login/signup check onboardingComplete flag

### Phase 4 — Club Features
- [ ] `src/app/club/register/page.tsx` — Register organization form
- [ ] `src/app/api/clubs/route.ts` — POST create club
- [ ] `src/app/club/dashboard/page.tsx` — My events list with status badges
- [ ] `src/app/club/events/new/page.tsx` — Create event form (all fields)
- [ ] `src/app/api/events/route.ts` — POST create event (applies verified → scheduled logic)
- [ ] `src/app/api/upload/route.ts` — POST image upload to Cloudinary, returns URL

### Phase 5 — Admin Features
- [ ] `src/app/admin/page.tsx` — Admin dashboard layout
- [ ] `src/app/admin/queue/page.tsx` — Pending events moderation queue
- [ ] `src/app/admin/clubs/page.tsx` — Club list + verify/unverify toggle
- [ ] `src/app/admin/interests/page.tsx` — Add/edit/remove interest categories
- [ ] `src/app/api/admin/events/[id]/approve/route.ts` — PATCH approve event
- [ ] `src/app/api/admin/events/[id]/reject/route.ts` — PATCH reject event
- [ ] `src/app/api/admin/clubs/[id]/verify/route.ts` — PATCH verify club
- [ ] `src/app/api/admin/events/[id]/takedown/route.ts` — DELETE takedown event
- [ ] `src/app/api/admin/interests/route.ts` — GET/POST/DELETE interests

### Phase 6 — Attendee Feed & Discovery
- [ ] `src/app/(main)/page.tsx` — Feed page (personalized + filters)
- [ ] `src/app/api/events/feed/route.ts` — GET feed with filter params + publish-on-read logic
- [ ] `src/app/events/[id]/page.tsx` — Event detail page (SSR)
- [ ] `src/app/saved/page.tsx` — Saved events list
- [ ] `src/app/api/saved/route.ts` — GET saved events list
- [ ] `src/app/api/saved/[eventId]/route.ts` — POST save / DELETE unsave

### Phase 7 — Components & UI
- [ ] `src/components/ui/Button.tsx`
- [ ] `src/components/ui/Input.tsx`
- [ ] `src/components/ui/Label.tsx`
- [ ] `src/components/ui/Badge.tsx`
- [ ] `src/components/ui/Card.tsx`
- [ ] `src/components/ui/Select.tsx`
- [ ] `src/components/ui/Textarea.tsx`
- [ ] `src/components/ui/Modal.tsx`
- [ ] `src/components/ui/Spinner.tsx`
- [ ] `src/components/ui/Toast.tsx`
- [ ] `src/components/Navbar.tsx` — Top nav with role-aware links
- [ ] `src/components/EventCard.tsx` — Card used in feed + saved list
- [ ] `src/components/FeedFilters.tsx` — District / mode / date filter bar
- [ ] `src/components/InterestPicker.tsx` — Multi-select grid for onboarding
- [ ] `src/components/ImageUpload.tsx` — Drag-drop / click-to-upload with preview
- [ ] `src/components/StatusBadge.tsx` — Color-coded event status pill
- [ ] `src/components/VerifiedBadge.tsx` — Blue checkmark for verified clubs
- [ ] `src/app/layout.tsx` — Root layout (SessionProvider, fonts)
- [ ] `src/app/globals.css` — Global styles + Tailwind directives

### Phase 8 — Hooks & Utilities
- [ ] `src/hooks/useDebounce.ts`
- [ ] `src/hooks/useSavedEvents.ts`
- [ ] `src/lib/cloudinary.ts` — Cloudinary upload helper (server-side)
- [ ] `src/lib/utils.ts` — `cn()` classnames helper, date formatters
- [ ] `src/lib/validations.ts` — Zod schemas for form validation
- [ ] `src/types/index.ts` — Shared TypeScript types

### Phase 9 — Polish & Testing
- [ ] Mobile responsiveness audit (all pages)
- [ ] Loading skeletons for feed
- [ ] Empty states (no events, no saved events)
- [ ] Error pages (`not-found.tsx`, `error.tsx`)
- [ ] Form validation messages
- [ ] Image optimization (Next.js `<Image>` with Cloudinary URL)
- [ ] Test with one real club + handful of real students

---

## Complete File Structure

```
d:\PROJECTS\Startup\UniPlaza\
│
├── .env.local.example          # env var template (never commit .env.local)
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── package.json
│
├── README.md                   # Project overview + setup guide
├── CLAUDE.md                   # AI assistant context + business rules
├── ARCHITECTURE.md             # System design + flows
├── DEVELOPMENT_PLAN.md         # This file — full build checklist
│
├── public/
│   └── logo.svg                # Platform logo
│
├── scripts/
│   └── seed.ts                 # DB seed: admin + interests + sample data
│
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (SessionProvider, metadata)
│   │   ├── globals.css             # Tailwind base + custom CSS
│   │   ├── not-found.tsx           # 404 page
│   │   ├── error.tsx               # Error boundary page
│   │   │
│   │   ├── (auth)/                 # Auth pages (no navbar)
│   │   │   ├── layout.tsx          # Centered card layout
│   │   │   ├── login/
│   │   │   │   └── page.tsx        # Login form
│   │   │   └── signup/
│   │   │       └── page.tsx        # Signup form (choose role)
│   │   │
│   │   ├── onboarding/
│   │   │   └── page.tsx            # Interest + district picker
│   │   │
│   │   ├── (main)/                 # Main attendee-facing pages (with navbar)
│   │   │   ├── layout.tsx          # Layout with Navbar
│   │   │   ├── page.tsx            # Feed (personalized event discovery)
│   │   │   └── saved/
│   │   │       └── page.tsx        # Saved events
│   │   │
│   │   ├── events/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Event detail page (SSR)
│   │   │
│   │   ├── club/
│   │   │   ├── layout.tsx          # Club layout (check club role)
│   │   │   ├── register/
│   │   │   │   └── page.tsx        # Register organization
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # My events with status
│   │   │   └── events/
│   │   │       └── new/
│   │   │           └── page.tsx    # Create event form
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin layout (check admin role)
│   │   │   ├── page.tsx            # Admin home / quick stats
│   │   │   ├── queue/
│   │   │   │   └── page.tsx        # Pending events queue
│   │   │   ├── clubs/
│   │   │   │   └── page.tsx        # All clubs + verify toggle
│   │   │   └── interests/
│   │   │       └── page.tsx        # Manage interest categories
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/
│   │       │   │   └── route.ts    # NextAuth handler
│   │       │   └── signup/
│   │       │       └── route.ts    # POST create new user
│   │       ├── upload/
│   │       │   └── route.ts        # POST image → Cloudinary
│   │       ├── onboarding/
│   │       │   └── route.ts        # POST save interests + district
│   │       ├── clubs/
│   │       │   └── route.ts        # POST create club
│   │       ├── events/
│   │       │   ├── route.ts        # POST create event
│   │       │   └── feed/
│   │       │       └── route.ts    # GET personalized feed
│   │       ├── saved/
│   │       │   ├── route.ts        # GET saved events
│   │       │   └── [eventId]/
│   │       │       └── route.ts    # POST save / DELETE unsave
│   │       └── admin/
│   │           ├── events/
│   │           │   └── [id]/
│   │           │       ├── approve/
│   │           │       │   └── route.ts   # PATCH approve
│   │           │       ├── reject/
│   │           │       │   └── route.ts   # PATCH reject
│   │           │       └── takedown/
│   │           │           └── route.ts   # DELETE takedown
│   │           ├── clubs/
│   │           │   └── [id]/
│   │           │       └── verify/
│   │           │           └── route.ts   # PATCH verify club
│   │           └── interests/
│   │               └── route.ts    # GET/POST/DELETE interests
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Label.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Toast.tsx
│   │   ├── Navbar.tsx
│   │   ├── EventCard.tsx
│   │   ├── FeedFilters.tsx
│   │   ├── InterestPicker.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── StatusBadge.tsx
│   │   └── VerifiedBadge.tsx
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Club.ts
│   │   ├── Interest.ts
│   │   ├── Event.ts
│   │   ├── SavedEvent.ts
│   │   └── Report.ts
│   │
│   ├── lib/
│   │   ├── mongodb.ts          # Connection singleton
│   │   ├── auth.ts             # NextAuth config
│   │   ├── cloudinary.ts       # Cloudinary upload helper
│   │   ├── constants.ts        # Districts, interest seeds, enums
│   │   ├── utils.ts            # cn(), formatDate(), etc.
│   │   └── validations.ts      # Zod schemas
│   │
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── useSavedEvents.ts
│   │
│   ├── types/
│   │   └── index.ts            # Shared TS types / interfaces
│   │
│   └── middleware.ts           # Route guard (NextAuth middleware)
```

---

## Key Design Decisions

### Why check-on-read for scheduling?
For MVP, checking `goLiveAt <= now` at query time is simpler than a cron job.
When an event's `goLiveAt` passes, the next feed request will auto-update its status.
Upgrade to Vercel Cron at Phase 2.

### Why NextAuth credentials?
Simplest to self-host. No external auth service cost. Can add OAuth (Google) in Phase 2.

### Why Cloudinary?
Free tier (25GB storage + 25GB bandwidth/month) is plenty for MVP.
Built-in CDN and on-the-fly image transforms (resize, crop, compress) from URL params.
No custom storage server needed.

### Why check `onboardingComplete` flag?
After signup, attendees must pick interests before seeing the feed.
The flag is set to `true` after onboarding completes.
Middleware redirects `/` → `/onboarding` if flag is false.

---

## Environment Setup Checklist

- [ ] Create MongoDB Atlas cluster (free M0 tier)
- [ ] Whitelist all IPs (0.0.0.0/0) for Vercel deploys
- [ ] Create DB user and get connection string
- [ ] Create Cloudinary account → get cloud name, API key, API secret
- [ ] Run `npm run seed` to populate interests
- [ ] Set all env vars in `.env.local` locally
- [ ] Set all env vars in Vercel dashboard for production

---

## Deployment Checklist

- [ ] Push to GitHub main branch
- [ ] Connect Vercel to GitHub repo
- [ ] Set environment variables in Vercel
- [ ] Set `NEXTAUTH_URL` to production Vercel URL
- [ ] Verify seed data is in Atlas
- [ ] Test signup → onboarding → feed flow
- [ ] Test club register → create event → admin approve flow
- [ ] Test verified club → instant scheduling flow
