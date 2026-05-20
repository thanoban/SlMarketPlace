# SL Events — Sri Lanka Interest-Based Events & Workshops Platform

A mobile-first web platform where clubs, communities, and organizations across Sri Lanka post events and workshops, and users discover events matched to the interests they choose.

## Live Demo
> Coming soon after deployment

## What It Does

- **Clubs & organizers** register a profile and post events/workshops
- **Users** pick their interests (e.g. DevOps, Medicine, Business) and home district
- **Feed** shows matching events from any organizer in their district or online — not just pages they follow
- **Admins** review new clubs, verify trusted organizers, and moderate content

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS |
| Database | MongoDB Atlas (Mongoose ODM) |
| Auth | NextAuth.js v5 (credentials provider) |
| Image Storage | Cloudinary (free tier) |
| Hosting | Vercel (frontend) + MongoDB Atlas (managed DB) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free M0 tier works)
- Cloudinary account (free tier works)

### Environment Variables

Create a `.env.local` file in the root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/slevents

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Installation

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Database Seed

```bash
npm run seed
```

Seeds admin user, interest categories, and sample events.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login & signup pages
│   ├── (main)/            # Attendee-facing pages (feed, event detail, saved)
│   ├── onboarding/        # Interest + district selection after signup
│   ├── club/              # Club registration, dashboard, event creation
│   └── admin/             # Admin moderation queue, club verification
├── components/
│   ├── ui/                # Reusable base components (Button, Input, Badge, etc.)
│   ├── EventCard.tsx      # Event card for the feed
│   ├── FeedFilters.tsx    # District / mode / date filters
│   └── Navbar.tsx
├── lib/
│   ├── mongodb.ts         # MongoDB connection helper
│   ├── cloudinary.ts      # Cloudinary upload helper
│   └── constants.ts       # Districts, interest seeds, status enums
├── models/                # Mongoose schemas
│   ├── User.ts
│   ├── Club.ts
│   ├── Event.ts
│   ├── Interest.ts
│   └── SavedEvent.ts
├── hooks/                 # Custom React hooks
└── middleware.ts          # Route protection (auth guards)
supabase/                  # (unused — replaced by MongoDB)
scripts/
└── seed.ts                # DB seed script
```

## User Roles

| Role | Can Do |
|------|--------|
| **Attendee** | Browse feed, filter by interest/district/date, save events |
| **Club** | Register org, post events, track submission status |
| **Admin** | Approve/reject events from new clubs, verify trusted clubs, manage interests |

## Event Status Flow

```
Unverified club → pending → [Admin Approve] → scheduled → [go_live_at reached] → published
                          → [Admin Reject]  → rejected

Verified club   → scheduled (skips queue) → [go_live_at reached] → published
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Interest-based event feed (attendee home) |
| `/signup` | Register as attendee or club |
| `/login` | Sign in |
| `/onboarding` | Pick interests + home district (post-signup) |
| `/events/[id]` | Event detail page |
| `/saved` | Saved events list |
| `/club/register` | Register a new organization |
| `/club/dashboard` | Club's events with status |
| `/club/events/new` | Create a new event |
| `/admin` | Admin: event queue, club verification, interests |

## Interest Categories (seed data)

Technology/IT · Software Development · DevOps · Cybersecurity · Data Science & AI · Design/UX · Engineering · Medicine & Health · Science & Research · Business & Entrepreneurship · Marketing · Finance · Law · Education/Academic · Arts & Culture · Environment

## Districts (all 25 Sri Lanka districts)

Ampara · Anuradhapura · Badulla · Batticaloa · Colombo · Galle · Gampaha · Hambantota · Jaffna · Kalutara · Kandy · Kegalle · Kilinochchi · Kurunegala · Mannar · Matale · Matara · Mullaitivu · Nuwara Eliya · Polonnaruwa · Puttalam · Ratnapura · Trincomalee · Vavuniya · Monaragala

## Build Order (MVP)

1. ✅ Auth (email/password) + roles
2. ✅ Attendee onboarding (interests + district)
3. ✅ Club registration + create event form
4. ✅ Approval state machine + admin queue + club verification
5. ✅ Attendee feed + filters + event detail + save
6. ✅ Scheduling (go-live auto-publish)

## Phase 2 (not built yet)

- Promoted/featured events (paid boost — `isPromoted` flag already in schema)
- Company sponsorship targeting
- Ticketing / payments
- Push notifications & email reminders for saved events
- RSVP / attendance counts
- Native mobile app
- Analytics dashboard for clubs

## Contributing

This is an early-stage product. Reach out before opening large PRs.

## License

Private — all rights reserved.
