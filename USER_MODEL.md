# User Model

This document defines how users are categorized in the nuti app.

## Categories

| Term | Definition |
|------|------------|
| **Admin** | Single person who manages the app (dashboard, feedback, etc.) |
| **Member** | Signed-in users (authenticated via Google) |
| **Non-member** | Visitors who haven't signed in |
| **Users** | Everyone on the site (Members + Non-members) |

## Implementation

### Admin
- Stored in Firestore: `users/{uid}.role === 'admin'`
- Only **one** person should have this role
- To make yourself admin: In Firebase Console → Firestore → `users` → your document → add `role: "admin"`
- Protected routes: `/admin/*` (requires Admin)

### Member
- Anyone with `auth.currentUser` (signed in)
- Stored in Firestore: `users/{uid}` with `role: 'user'` (or `'admin'` for the single admin)
- Member features: saved recipes, My Page, higher rate limits

### Non-member
- `auth.currentUser === null`
- Can browse recipes, use meal planner, calorie finder
- Limited or no access to: saved recipes, My Page

### Users
- General term for all visitors (Members + Non-members)

## Feature access by type

| Feature | Non-member | Member | Admin |
|---------|------------|--------|-------|
| Browse recipes | ✅ | ✅ | ✅ |
| Recipe search | ✅ (limited) | ✅ | ✅ |
| Saved recipes | ❌ | ✅ | ✅ |
| My Page | ❌ | ✅ | ✅ |
| Admin dashboard | ❌ | ❌ | ✅ |

## Code reference

| Purpose | Location |
|---------|----------|
| Role constants | `lib/userModel.js` (`ROLE_ADMIN`, `ROLE_USER`) |
| Member/Non-member hook | `lib/useUserType.js` (`useUserType()` → `{ isMember, isNonMember, user }`) |
| Admin verification | `/api/admin/verify` |
| Admin layout | `src/app/admin/layout.js` |
| User seed (new Members) | `src/app/my/page.js` |
