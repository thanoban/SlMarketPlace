# CLAUDE.md — SL Events Platform

## Project Overview

Mobile-first web platform for Sri Lanka interest-based event discovery.
Clubs post events; attendees see a personalized feed based on their interests and district.

## Tech Stack

- **Next.js 15** App Router, TypeScript, Tailwind CSS
- **MongoDB Atlas** via Mongoose ODM
- **NextAuth.js v5** (credentials provider — email + bcrypt password)
- **Cloudinary** for image uploads (event banners, club logos)
- **Vercel** for hosting

## Core Business Rules (never break these)

1. **Verified clubs publish instantly** — their events skip the admin queue and go straight to `scheduled` status. This is critical: verified clubs must never be slower than posting on Facebook.
2. **Unverified clubs always need approval** — status starts as `pending`, admin approves → `scheduled`.
3. **Status machine is strict:**
   - `pending` → `scheduled` (admin approve) or `rejected` (admin reject)
   - `scheduled` → `published` (when `go_live_at <= now`)
   - Verified clubs skip `pending`, start at `scheduled`
4. **Feed filtering is exact** — only show events where `status=published`, `go_live_at <= now`, `end_datetime >= now`, and interest tags overlap the user's interests (unless "show all" is active).
5. **Online events show to all districts** — never filter online events by district.
6. **Interest categories are admin-managed** — never hardcode interest IDs in UI logic.

## Data Models

### User
```
id, name, email, passwordHash, role (attendee|club|admin),
homeDistrict?, onboardingComplete (bool), createdAt
```

### Club
```
id, userId, name, logoUrl?, description, contact,
district, isVerified (bool, default false), createdAt
```

### Interest
```
id, name
```

### Event
```
id, clubId, title, description, bannerUrl?,
mode (online|physical), district?, venue?, onlineLink?,
startDatetime, endDatetime, goLiveAt,
status (pending|approved|scheduled|published|rejected),
rejectReason?, isPromoted (bool, default false),
interests [Interest ids], createdAt
```

### SavedEvent
```
userId, eventId, createdAt
```

### Report
```
id, eventId, userId, reason, createdAt
```

## Routes

| Route | Auth required | Role |
|-------|--------------|------|
| `/` | No (but personalized if logged in) | Any |
| `/signup` `/login` | No | — |
| `/onboarding` | Yes | attendee |
| `/events/[id]` | No | Any |
| `/saved` | Yes | attendee |
| `/club/register` | Yes | club (no club yet) |
| `/club/dashboard` | Yes | club |
| `/club/events/new` | Yes | club |
| `/admin` | Yes | admin |

## File Conventions

- All DB queries in `src/lib/actions/` as server actions (use `'use server'`)
- Mongoose models in `src/models/`
- Reusable UI primitives in `src/components/ui/`
- Feature components in `src/components/`
- Constants (districts, seed interests, status enums) in `src/lib/constants.ts`

## Environment Variables Needed

```
MONGODB_URI
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

## Phase 2 Flags (already in schema, DO NOT build UI for these yet)

- `isPromoted` on Event — for paid boost feature
- `reports` collection — for takedown flow (admin can delete directly for now)

## Common Pitfalls

- Always use `lean()` on read-heavy queries (feed) to avoid Mongoose overhead
- The scheduler that flips `scheduled → published` can be a simple check-on-read in the feed query (compare `goLiveAt <= now`). No cron job needed for MVP.
- Image uploads go through `/api/upload` which calls Cloudinary server-side. Never expose Cloudinary secret to client.
- Tailwind purge is configured for `src/**/*.{ts,tsx}` — don't add styles outside this path without updating `tailwind.config.ts`.
