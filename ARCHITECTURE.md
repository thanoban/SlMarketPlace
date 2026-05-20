# Architecture — SL Events Platform

## System Diagram

```
Browser (mobile-first)
        │
        ▼
   Vercel Edge
        │
   Next.js 15 App Router
   ├── Server Components  ── MongoDB Atlas (Mongoose)
   ├── Server Actions     ── Cloudinary (image upload)
   ├── API Routes         ── NextAuth.js session
   └── Client Components
```

## Authentication Flow

1. User signs up → password hashed with `bcrypt` → stored in MongoDB `users` collection
2. Login → NextAuth `credentials` provider verifies against DB → issues JWT session cookie
3. Middleware (`middleware.ts`) reads session and guards protected routes
4. Server components call `getServerSession()` to get current user
5. Client components use `useSession()` hook

## Image Upload Flow

```
Client selects file
      │
      ▼
POST /api/upload  (multipart/form-data)
      │
      ▼
Cloudinary SDK (server-side)
      │  upload_stream()
      ▼
Returns { secure_url }
      │
      ▼
bannerUrl / logoUrl saved to MongoDB
```

Cloudinary transformations applied at read time via URL params (e.g. `w_800,h_400,c_fill`).

## Event Publishing Logic

### On event creation
```
isVerified(club) == true  →  status = "scheduled"
isVerified(club) == false →  status = "pending"
```

### On feed query (check-on-read — no cron needed for MVP)
```sql
-- Pseudo-query
events WHERE
  status IN ("scheduled", "published")
  AND goLiveAt <= NOW()
  → treat these as published in the response
  → also update status = "published" in DB (async, best-effort)
```

This avoids a separate cron job for MVP. At scale, replace with Vercel Cron or MongoDB Atlas Scheduled Triggers.

### Admin approval
```
Admin clicks Approve  →  status = "scheduled"  (goLiveAt controls when it goes live)
Admin clicks Reject   →  status = "rejected", rejectReason = reason
```

## Feed Filtering Logic

```typescript
// User's feed query
{
  status: "published",
  goLiveAt: { $lte: new Date() },
  endDatetime: { $gte: new Date() },
  interests: { $in: userInterestIds },          // overlap
  ...(mode === "physical" && district
    ? { district: selectedDistrict }
    : {}),                                       // online always passes district filter
  ...(dateFilter === "today"
    ? { startDatetime: { $gte: startOfDay, $lte: endOfDay } }
    : {}),
}
```

## Role-Based Access

| Action | Attendee | Club | Admin |
|--------|----------|------|-------|
| Browse feed | ✓ | ✓ | ✓ |
| Save event | ✓ | — | — |
| Create event | — | ✓ | — |
| Approve event | — | — | ✓ |
| Verify club | — | — | ✓ |
| Manage interests | — | — | ✓ |
| Delete any event | — | — | ✓ |

## MongoDB Collections

```
users
clubs
interests
events
saved_events
reports
```

Indexes to add:
- `events`: `{ status: 1, goLiveAt: 1, endDatetime: 1 }` (feed query)
- `events`: `{ clubId: 1, status: 1 }` (club dashboard)
- `saved_events`: `{ userId: 1 }` (saved list)
- `users`: `{ email: 1 }` unique (auth)

## Deployment

```
GitHub push → Vercel auto-deploy
MongoDB Atlas → connection string in Vercel env vars
Cloudinary → credentials in Vercel env vars
```

### Environment Variables (Vercel)
```
MONGODB_URI            (MongoDB Atlas connection string)
NEXTAUTH_SECRET        (random 32-char string)
NEXTAUTH_URL           (https://your-vercel-domain.vercel.app)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```
