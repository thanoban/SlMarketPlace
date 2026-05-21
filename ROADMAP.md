# UniPlaza — Product Roadmap

## Vision

UniPlaza is Sri Lanka's first dedicated student event platform. Built specifically for Sri Lankan students — not an English-only, US-centric platform like Luma or Eventbrite. Every feature decision is made with Sri Lankan student life, culture, and technology habits in mind.

---

## Version 1 (Current — Shipped)

### What's live
- Event feed with interest-based and district-based filtering
- Club registration and event creation
- Admin moderation queue (pending → scheduled → published)
- Event saving/bookmarking
- Verified club fast-track (skips admin queue)
- Cloudinary image hosting for banners and club logos
- External registration URL on event pages
- **Automated event scraping** (runs daily at 2 AM SLT):
  - Devpost — international hackathons
  - Eventbrite — Sri Lanka local events
  - HackerEarth — coding competitions
  - MLH (Major League Hacking) — student hackathons
  - CTFtime — cybersecurity CTF competitions
- WhatsApp + Telegram group links on events (optional, shown to all)
- "Register / Get Tickets" button linking to external signup page

### Tech stack
- Next.js 15 App Router, TypeScript, Tailwind CSS
- MongoDB Atlas (Mongoose ODM)
- NextAuth.js v5 (credentials provider)
- Cloudinary (image uploads)
- Vercel hosting + Vercel Cron

---

## Version 2 — Engagement Layer ("Luma-Beating")

> **Why we beat Luma:** Luma was built for the US/global tech scene. It has no concept of Sri Lankan districts, WhatsApp groups, university clubs (.ac.lk), or the local student community. UniPlaza owns this space permanently.

### Priority order: build these phases in sequence

---

### Phase 1 — Foundation Models
**Files to create:**
- `src/models/RSVP.ts` *(already scaffolded — not yet wired)*
- `src/models/ClubFollow.ts` *(already scaffolded — not yet wired)*
- `src/models/Notification.ts` *(already scaffolded — not yet wired)*

**Files to extend:**
- `src/models/Event.ts` — add `capacity`, `viewCount` *(schema fields added, not yet used in UI)*
- `src/models/User.ts` — add `avatarUrl` *(added, not yet used)*

#### RSVP model schema
```
userId:        ObjectId  ref: User     required
eventId:       ObjectId  ref: Event    required
status:        "going" | "interested" | "waitlist"  default: "going"
checkInToken:  String    UUID v4       unique sparse
checkedIn:     Boolean   default: false
```
Indexes: `{ userId, eventId }` unique · `{ eventId, status }` · `{ checkInToken }` unique sparse

#### ClubFollow model schema
```
userId:  ObjectId  ref: User   required
clubId:  ObjectId  ref: Club   required
```
Indexes: `{ userId, clubId }` unique · `{ clubId }` for follower count

#### Notification model schema
```
userId:   ObjectId  ref: User    required
type:     "new_event" | "waitlist_promoted"
eventId:  ObjectId  ref: Event   optional
clubId:   ObjectId  ref: Club    required
read:     Boolean   default: false
createdAt Date  (auto-expires in 90 days via TTL index)
```
Indexes: `{ userId, read, createdAt: -1 }` · `{ createdAt: 1 }` TTL 90 days

---

### Phase 2 — RSVP System
**Commit message:** `feat: RSVP system — going/interested/waitlist with capacity limits`

#### New API routes
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/events/[id]/rsvp` | POST | attendee | Create/update RSVP. If event at capacity → status="waitlist". Generates `checkInToken` UUID on first "going". |
| `/api/events/[id]/rsvp` | DELETE | attendee | Cancel RSVP. Auto-promotes oldest waitlist entry + sends notification. |
| `/api/events/[id]/rsvp` | GET | attendee | Returns `{ rsvp: { status, checkedIn, checkInToken } \| null }` |
| `/api/events/[id]/attendees` | GET | club (own event) | Paginated attendee list with name, status, checkedIn |
| `/api/events/[id]/view` | POST | public | Increments `Event.viewCount` (fire-and-forget) |
| `/api/events/feed` | GET | public | **Extend:** add `rsvpCount` + `goingAvatars[]` to each event in response |

#### New UI components
- `src/app/events/[id]/RSVPButton.tsx` — Going / Interested / Waitlist toggle (large, full-width)
- `src/app/events/[id]/AttendeeAvatarRow.tsx` — "X people going" + avatar stack
- `src/app/events/[id]/ViewTracker.tsx` — fires `POST /api/events/[id]/view` on mount
- `src/components/AvatarCircle.tsx` — initials-based avatar with deterministic color from name hash

#### Event card changes (`src/components/EventCard.tsx`)
- Add bottom row: `[A][B][C] 23 going` avatar stack + count
- Add capacity progress bar: `████████░░ 23/50 spots` (thin `h-1` bar, only if `capacity` is set)

#### Event creation form changes
- Add optional "Capacity" number input (blank = unlimited)
- Add to `eventSchema` in `src/lib/validations.ts`: `capacity: z.number().int().positive().optional()`

#### Event detail page layout (redesign)
```
[Banner Image]
Title
[Club Logo] Club Name ✓  [Follow button — Phase 4]

📅 Mon Jun 2 · 7:00–9:00 PM (SLT)
📍 BMICH, Colombo  or  🌐 Online [Join link]

[ ✓ Going ]  [ ★ Interested ]   ← full-width RSVP row
  or [ Join Waitlist ] if full
████████░░░░ 23 / 50 spots       ← capacity bar

👥 [A][B][C] + 20 others going   ← avatar row

[📅 Add to Calendar]  [📤 Share]  ← Phase 3

[Tech] [AI] [Workshop]            ← interest tags

About this event
Description...

── Your ticket ──────────────   ← only if RSVP = going
[QR Code]
Show this at the door           ← Phase 5

[WhatsApp Group] [Telegram]     ← only if RSVP = going + club set link

[♡ Save event]
```

---

### Phase 3 — Calendar + WhatsApp/Telegram Sharing + OG Meta Tags
**Commit message:** `feat: add to calendar, WhatsApp/Telegram sharing, OG meta tags`

#### New dependency
```
ical-generator  ^8.0.0   .ics calendar file generation
```

#### New API route
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/events/[id]/calendar` | GET | public | `?format=ics` → `.ics` download with `Content-Disposition: attachment`. Default → `{ googleCalUrl }` JSON |

#### Google Calendar URL format
```
https://calendar.google.com/calendar/render?action=TEMPLATE
  &text=EVENT_TITLE
  &dates=START_UTC/END_UTC   (format: 20260602T070000Z)
  &details=DESCRIPTION_URL_ENCODED
  &location=VENUE_OR_ONLINE
```

#### New UI components
- `src/app/events/[id]/CalendarButtons.tsx`
  - "Add to Google Calendar" button (opens URL in new tab)
  - "Download .ics" button (navigates to `/api/events/[id]/calendar?format=ics`)
- `src/app/events/[id]/ShareDropdown.tsx`
  - Copy link (`navigator.clipboard.writeText(window.location.href)`)
  - **WhatsApp** (first option — most important for SL): `https://wa.me/?text=Check this out: {title} {url}`
  - **Telegram**: `https://t.me/share/url?url={url}&text={title}`

#### OG meta tags (`src/app/events/[id]/page.tsx`)
Add `generateMetadata()` export:
```ts
export async function generateMetadata({ params }) {
  const event = await Event.findById(id).lean();
  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.bannerUrl ? [{ url: event.bannerUrl }] : [],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
}
```
When shared on WhatsApp, a rich preview card appears with the event banner image.

---

### Phase 4 — Club Following + In-App Notifications
**Commit message:** `feat: club following and in-app notifications`

#### New API routes
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/clubs/[id]/follow` | POST | attendee | Follow club. Upsert ClubFollow. Returns `{ following: true, followerCount }` |
| `/api/clubs/[id]/follow` | DELETE | attendee | Unfollow. Returns `{ following: false, followerCount }` |
| `/api/clubs/[id]/follow` | GET | attendee | Returns `{ following: bool, followerCount }` |
| `/api/notifications` | GET | logged-in | `{ notifications[], unreadCount }`. `?unreadOnly=true` for badge only. |
| `/api/notifications/[id]/read` | PATCH | owner | Mark single notification read |
| `/api/notifications/read-all` | PATCH | logged-in | Mark all as read |

#### Notification fan-out on event creation
Modify `POST /api/events` — after inserting event, fire async fan-out:
```ts
// Non-blocking: does not delay the HTTP response
Promise.resolve().then(async () => {
  const followers = await ClubFollow.find({ clubId: club._id }, "userId").lean();
  if (followers.length === 0) return;
  await Notification.insertMany(
    followers.map((f) => ({
      userId: f.userId,
      type: "new_event",
      eventId: event._id,
      clubId: club._id,
    }))
  );
});
```

#### New UI components
- `src/app/events/[id]/FollowClubButton.tsx` — Follow / ✓ Following toggle button (shown next to club name)
- `src/components/NotificationBell.tsx`
  - Bell icon with red badge showing unread count
  - Dropdown list of notifications (up to 20, newest first)
  - Each row: club initials + "New event: [title]" + relative time
  - "Mark all read" link at top
  - Click notification → `PATCH read` → navigate to event
- `src/hooks/useNotifications.ts`
  - Polls `GET /api/notifications?unreadOnly=true` every 30 seconds
  - Only polls when `document.visibilityState === "visible"`
  - Clears interval on unmount

#### Navbar change
Add `<NotificationBell />` for logged-in attendees (between nav links and Sign out).

---

### Phase 5 — QR Code Check-In (Physical Events)
**Commit message:** `feat: QR code check-in for physical events`

#### New dependencies
```
qrcode     ^1.5.4   server-side QR SVG generation
uuid       ^11.0.0  checkInToken generation

@types/qrcode   ^1.5.5   (dev)
@types/uuid     ^10.0.0  (dev)
```

#### How it works
1. When attendee RSVPs as "going" → `checkInToken` (UUID v4) is stored in RSVP record
2. Attendee sees their QR code on the event detail page (contains the token)
3. Club opens `/club/events/[id]/checkin` on their phone
4. Camera scans attendee's QR → decodes token → `POST /api/events/[id]/checkin`
5. Server marks `RSVP.checkedIn = true` → returns attendee name
6. Scanner shows: green banner "✓ Checked in: [Name]"

#### New API routes
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/events/[id]/qrcode` | GET | attendee (own RSVP) | Returns SVG QR code for the attendee's checkInToken |
| `/api/events/[id]/checkin` | POST | club (own event) | `{ token }` → marks checkedIn=true, returns `{ name, email }` |

#### New UI components
- `src/app/events/[id]/UserQRCode.tsx`
  - Shown on event detail page only if `rsvp.status === "going"`
  - Fetches `/api/events/[id]/qrcode` and renders the SVG
  - Label: "Your ticket — show this at the door"
- `src/app/club/events/[id]/checkin/page.tsx` + `CheckInScanner.tsx`
  - Uses native `BarcodeDetector` Web API (no library needed, 92% browser support)
  - Video stream from rear camera (`facingMode: "environment"`)
  - `requestAnimationFrame` scanning loop
  - On success: `POST /api/events/[id]/checkin` → show green toast with name
  - Fallback: text input for manual token entry (for older devices)
  - Running list of checked-in attendees shown below scanner

---

### Phase 6 — Club Analytics + Public Club Profile + My Events Page
**Commit message:** `feat: club analytics dashboard and public club profile pages`

#### New API routes
| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/clubs/[id]/analytics` | GET | club (own) | Per-event: rsvpCount, viewCount, checkInRate (%). Total followerCount, total RSVPs across all events. |
| `/api/clubs/[id]` | GET | public | Club profile data: name, description, district, isVerified, followerCount, upcomingEvents[] |

#### New pages
- `src/app/my-events/page.tsx` — attendee's RSVPs organized in tabs: **Going** | **Interested** | **Saved**
- `src/app/clubs/[id]/page.tsx` — public club profile with follow button + upcoming events

#### Club dashboard enhancements (`src/app/club/dashboard/page.tsx`)
```
[Club Logo]  Club Name  ✓ Verified / 🎓 University Club
142 followers

[Total RSVPs]  [Total Views]  [Avg Check-in Rate]   ← stat cards

Events:
Title | Status | RSVPs | Views | Check-in% | [Attendees] [Scan QR]
```

---

### Phase 7 — Navigation Restructure (Mobile-First UX)
**Commit message:** `refactor: restructure navigation for mobile-first UX`

#### New navigation structure

**Attendees — mobile bottom navigation**
```
[ 🏠 Discover ]  [ 📅 My Events ]  [ 🔔 Notifications ]  [ 👤 Profile ]
```

**Clubs — top navigation (kept as top bar)**
```
[ 📋 Dashboard ]  [ + Create ]  [ 📊 Analytics ]  [ 👤 Club Profile ]
```

#### Files to change
- `src/components/Navbar.tsx` — full redesign with role-aware bottom nav for mobile
- `src/app/layout.tsx` — add bottom nav container for mobile viewports
- `src/middleware.ts` — add `/my-events`, `/clubs/[id]` to route protection rules

---

## Sri Lanka–Specific Features (Phase 8)

> These are permanently unique to UniPlaza. Luma can never build these because they don't know what Sri Lanka is.

### 8a. University Club Badge
- Clubs with `.ac.lk` contact email → auto-tagged as `clubType: "university"` (already in schema)
- Display a 🎓 **"University Club"** badge (blue, different from verified ✓ which is green)
- Feed filter: "Show university events only" toggle
- `src/app/api/clubs/route.ts`: auto-detect `.ac.lk` on registration

### 8b. "Going from your district" social proof
- On physical event detail page (when user is logged in):
  - Show: "**X people from [YourDistrict]** are going" — uses `homeDistrict` on User
  - This is hyper-local social proof that no global platform can replicate

### 8c. WA/Telegram group shown post-RSVP
- If club added `whatsappGroupUrl` or `telegramGroupUrl` to the event:
  - Show them **only** to attendees who RSVP'd as "going"
  - Format: "Join the event WhatsApp group 👉 [link]" shown below QR code
  - This keeps the group link private (not public spam)

### 8d. Sri Lanka timezone explicit display
- All event times shown as `7:00 PM SLT (UTC+5:30)`
- Event creation form uses SLT as the display timezone, stores UTC in DB
- Prevents confusion for international scraped events

### 8e. Sri Lanka–specific scrapers (Phase 2 scraping)
New sources to add to `src/lib/scrapers/`:
- `mora.ts` — University of Moratuwa events (mora.ac.lk/news/events)
- `cmb.ts` — University of Colombo events (cmb.ac.lk/events)
- `slasscom.ts` — SLASSCOM industry events (slasscom.org)
- `ieee-sl.ts` — IEEE Sri Lanka Section (ieeesl.org/events)

These are sources Luma will never aggregate.

---

## What Beats Luma — Feature Comparison

| Feature | Luma | UniPlaza |
|---------|------|---------|
| RSVP | ✅ (waitlist = paid) | ✅ free, auto-promotes waitlist |
| Discovery | Follow-based only | Interest + district + follow + scraped |
| WhatsApp sharing | ❌ | ✅ first-class button |
| Guest list visibility | Paid tier only | ✅ free for all clubs |
| Check-in | Requires their mobile app | ✅ any phone browser, no app |
| Calendar export | ✅ | ✅ Google Cal + .ics |
| Club analytics | Basic RSVP count | ✅ views, RSVPs, check-in rate |
| External event sources | ❌ | ✅ Devpost / Eventbrite / HackerEarth / MLH / CTFtime |
| District filtering | ❌ | ✅ all 25 SL districts |
| University club badge | ❌ | ✅ auto-detected from .ac.lk email |
| WhatsApp group link | ❌ | ✅ shown privately after RSVP |
| Telegram group link | ❌ | ✅ |
| District-based social proof | ❌ | ✅ "X from Colombo going" |
| SL university event scraping | ❌ | ✅ Mora / UoC / SLASSCOM / IEEE SL |
| Free (no fees) | 5% on tickets | 100% free |
| Built for Sri Lanka | ❌ | ✅ |

---

## Dependency Summary for V2

```
# New dependencies to install when building V2
npm install qrcode ical-generator uuid
npm install --save-dev @types/qrcode @types/uuid
```

---

## Notes for Developer

- All commits should be under `thanoban` identity — no co-author lines
- One commit per phase, push immediately after each commit
- TypeScript check (`npx tsc --noEmit`) must pass before each commit
- Foundation model files (`RSVP.ts`, `ClubFollow.ts`, `Notification.ts`) and Event/User extensions are already in the codebase — wiring them into the app is what V2 builds
