# Guide — User Profile (Customer Profile)

A practical guide for **AI agents and developers** working on the customer **User Profile** feature in the Rental Company app.

> Project snapshot documented here is accurate as of this file's recent update. The profile feature is **connected to the live Spring Boot backend** (no hardcoded mock data).

---

## 1. What This Feature Is

The customer profile screen at `/profile` lets a logged-in user:

- View their avatar, name, verified badge, and "member since" info
- Upload / change a profile photo (5 MB max, image only, uploaded to backend as multipart)
- Edit their name, email, phone, and address (inline form with validation)
- See their login method
- Navigate to My Bookings (`/bookings`) and Payments History (`/payments`)
- Log out (wired to the live auth service — clears tokens and redirects to `/login`)

Layout is responsive: the sidebar is a top row of 3 tabs on mobile, stacked vertical nav on `lg` screens.

---

## 2. Project Context (how it fits the codebase)

- **Framework:** React 19 + Vite, Tailwind CSS 4 (utility classes only), React Router 7, react-icons (`Lu…` Lucide icons).
- **No TypeScript.** Pure JS/JSX, ES modules.
- **Theme colors** (defined in `src/index.css` as Tailwind theme tokens):
  - Primary: `#2563eb` (`bg-primary`, `text-primary`, `hover:bg-primary-dull`)
  - Light: `#f1f5f9`, Border: `#c4c7d2` (utility token `border-borderColor`)
- **Route wired in** `src/App.jsx`: `<Route path="/profile" element={<UserProfile />} />`. All account routes (`/profile`, `/bookings`, `/bookings/:id`, `/payments`) are wrapped in `<RequireAuth>` — guests are redirected to `/login` (which returns them to the page they requested via `location.state.from`).
- **Currency:** `VITE_CURRENCY` from `.env` (not used by this feature).

### Folder layout used by the profile feature

```
src/
├── App.jsx                                    # /profile route
├── pages/customer/UserProfile.jsx             # Page container / state orchestrator
├── components/profile/
│   ├── ProfileSidebar.jsx                     # Left nav (Profile / Bookings / Payments / Logout)
│   ├── ProfileInfo.jsx                        # Avatar + photo upload + verified badge
│   ├── ProfileForm.jsx                        # Editable name/email/phone form
│   ├── LoginMethodCard.jsx                    # Login method summary (static)
│   ├── BookingCard.jsx                        # Used by My Bookings
│   ├── BookingFilters.jsx                     # Used by My Bookings
│   └── CancelBookingModal.jsx                 # Used by My Bookings
└── services/
    ├── userService.js                         # THE service for this feature
    └── userSrevice.js                         # Legacy empty file (typo) — do not use
```

Related siblings to be aware of:
- `src/pages/customer/Mybooking.jsx` and `BookingDetails.jsx` use `ProfileSidebar` too (they share the layouts).
- `src/services/api.js` is the HTTP client (keeps `fetch` plumbing, auth header, error parsing) for future API calls.

---

## 3. User Data Model

The user object consumed by the UI is produced by the frontend mapper in `userService.js` (`mapUser`) and has this shape:

```js
{
  id: 14,               // backend id (int64)
  name: "Admin",
  email: "manlyhout@gmail.com",
  phone: "+855 12 345 678",
  address: "",          // optional
  verified: true,       // <- backend emailVerified
  role: "ADMIN",        // backend role
  memberSince: "Sep 2026", // <- derived from createdAt "Sep 2026"
  loginMethod: "Email & Password", // static (frontend only)
  image: "",            // <- backend profileImage (data URL / URL string)
}
```

Notes:
- `image` is **optional**. When absent/empty, `ProfileInfo` renders a circle with the first letter of `name`.
- `verified` and `memberSince` drive the badge/text under the name.
- The page is mounted with `getCachedUser()` synchronously, then refreshed asynchronously via `getCurrentUser()` which hits `GET /api/users/me`.

---

## 4. Data Flow (live API + local fallback)

```
[component]  →  userService  →  Spring Boot API (BEARER JWT)
                                ↕ localStorage cache "rental-auth-user"
```

`src/services/userService.js` is the **single source of truth** for profile state. It talks to the live backend via `api.js` (`request` adds `Authorization: Bearer <rental-access-token>` automatically) and keeps a localStorage cache so the page still works offline.

| Function | Behavior | API |
|---|---|---|
| `getCachedUser()` | Sync read of `localStorage["rental-auth-user"]` (real session data only — no mock defaults). | — |
| `getCurrentUser()` | Fetch `/api/users/me`, map + cache the result. **Any failure → local cache** so the page always renders. | `GET /api/users/me` |
| `updateCurrentUser(data)` | `PUT /api/users/{id}` with `{name, email, address, phone}`. Network failure → local-only persist; **server errors (4xx/5xx) are thrown to the UI**. | `PUT /api/users/{id}` |
| `uploadProfileImage(id, file)` | `POST /api/users/{id}/profile-image` as `multipart/form-data` (`file` field) with a Bearer header. Network failure → local data-URL preview. | `POST /api/users/{id}/profile-image` |

Mapping (`mapUser` in `userService.js`):

| Backend | Frontend |
|---|---|
| `id` | `id` |
| `name`, `email`, `phone`, `address` | same |
| `profileImage` | `image` |
| `emailVerified` | `verified` |
| `createdAt` | `memberSince` ("Sep 2026") |
| `role` | `role` |

Rules to follow when editing this feature:
- Always return **copies**, never the internal mutable object.
- Keep localStorage key `rental-auth-user` stable (auth token lives under `rental-access-token`).
- The profile endpoints live in `API_ENDPOINTS` (`currentUser`, `userById`, `userProfileImage`) in `src/services/api.js`. `VITE_API_URL` in `.env` is the API root including the `/api` prefix.

---

## 5. Filing Hierarchy — What Each File Does

### `src/pages/customer/UserProfile.jsx` (container)
- Owns `user` state (initialized from `getCachedUser()`).
- Fetches fresh user on mount with a `mounted` guard (prevents setState after unmount).
- `handleSave(values)` → `updateCurrentUser(values)` → merges result.
- `handlePhotoChange(file)` → `uploadProfileImage(user.id, file)` → merges result.
- `handleLogout` is an **empty placeholder** — wire to auth service when authentication lands.
- Marks each render prop as optional-safe (`ProfileSidebar`/`ProfileInfo`/`ProfileForm`).

### `src/components/profile/ProfileSidebar.jsx`
- `sidebarItems`: `/profile` (My Profile, `end: true`), `/bookings` (My Bookings), `/payments` (Payments History).
- Uses `NavLink` so active styling is automatic (`bg-primary text-white` when active).
- Logout is a plain button (visual only) calling the `onLogout` prop.
- Note: `PaymentsHistory` link uses `end: true` — `/payments/:id` (if added) won't break it.

### `src/components/profile/ProfileInfo.jsx`
- Renders the round avatar (image or initial), camera overlay button, hidden `<input type="file">`.
- Photo validation: must start with `image/`, max **5 MB**; errors shown inline in red.
- Passes the raw **`File`** up via `onPhotoChange(file)` — `userService.uploadProfileImage` handles multipart upload / local fallback.
- Verified badge uses `LuBadgeCheck` with `bg-primary/10 text-primary`.

### `src/components/profile/ProfileForm.jsx`
- Controlled form with fields **disabled until "Edit Profile" is clicked**: name, email, phone, address.
- Local validation (`validate`):
  - `name`: required, min 2 chars.
  - `email`: required + regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
  - `phone`: optional; if present must match `^\+?[\d\s()-]{6,}$`.
  - `address`: optional, no validation.
- On save: runs validation → `await onSave(values)` → green success box (auto-hides after 3s) → exits edit mode. Server/API errors render a red error box instead.
- Cancel resets to the original `user` values.
- Syncs to `user` prop via `useEffect` (so external photo/profile updates reflect).
- `inputClass` constant holds the shared input styling — reuse it for new fields.

### `src/components/profile/LoginMethodCard.jsx`
- Static list of login methods (currently just "Email & Password"). Extend `methods` array when Google login exists.

---

## 6. Live Backend Wiring (implemented)

The profile feature now talks to the **live Spring Boot backend** (`https://spring-rentvehicle.onrender.com`):

- **Endpoints** (in `src/services/api.js` → `API_ENDPOINTS`):
  - `GET /api/users/me` — current user (requires Bearer JWT; `request()` adds it from `rental-access-token`)
  - `PUT /api/users/{id}` — body `{name, email, address, phone}`
  - `POST /api/users/{id}/profile-image` — `multipart/form-data`, field `file`
- **`VITE_API_URL`** in `.env` is the API root including the `/api` prefix (e.g. `https://spring-rentvehicle.onrender.com/api`). For local proxy-based dev you can set it back to `/api`.
- **Auth note:** `authServices.js` is wired to the same live backend via `API_ENDPOINTS.auth*` — login (`{email,password}` → `AuthResponseDTO`), register (`{name,email,password}`), verify-email (`{email,code}`), resend-otp (`?email=`), refresh, logout (Bearer header), Google (`{idToken}`). **No demo/fallback accounts** — auth relies exclusively on the live backend; real server errors (wrong password, duplicate email) surface to the UI. After email-OTP verification the frontend **auto-logs the new user in** (`login()` with the just-registered credentials) since `/verify-email` returns only a message, not a token — the backend provisions the user, the frontend stores the `AuthResponseDTO` session, and the user lands on the authenticated home page. Google login already returns an `AuthResponseDTO` that is persisted the same way.
- **Behavior:** all user/booking/payment data is fetched live from the backend. The only offline aid is the localStorage cache (`rental-auth-user`) seeded by a real session; there are **no hardcoded mock bookings/profiles**. Fetch failures surface to the UI with a retry state instead of silently rendering fake data.

### Authentication & Logout (implemented)

- **Login:** `authServices.login()` → `storeAuthSession()`. This persists `rental-access-token` / `rental-refresh-token` / `rental-auth-user` (normalized through `mapUser`) and dispatches a `rental-auth-change` custom event so the `Navbar` swaps to the logged-in state on the same tab.
- **Route guard:** `src/components/common/RequireAuth.jsx` checks `localStorage["rental-access-token"]`; absent → `<Navigate to="/login" state={{ from: path }} />`. `Login.jsx` then redirects back to `state.from` (default `/profile`) instead of hard-coding `/profile`.
- **Logout:** `authServices.signOut()` fires `POST /api/auth/logout` (Bearer header, errors ignored), clears the three localStorage keys, dispatches `rental-auth-change`, then the page calls `useNavigate()("/login")`. All three pages (`UserProfile`, `Mybooking`, `Payments`) wire their `ProfileSidebar onLogout` to this.
- **Navbar:** listens for both `storage` (cross-tab) and `rental-auth-change` (same-tab) events to refresh `authUser`.

### My Bookings + Payments (live-wired)

- `src/services/bookingService.js` now calls `GET /api/bookings` + `GET /api/bookings/{id}`, filters to the current user (`userId === getCachedUser().id`), and enriches each row via `loadCatalog` (products, locations, product images, payments per booking). `mapBooking` produces the UI shape: `vehicleName` (brand+model), `image`, `startDate`/`endDate`, `pricePerDay`, `totalPrice`, `rentalFee`/`serviceFee`, `status`, `paymentStatus` (paid when a payment is `PAID`), `paymentMethod`, `pickupLocation`, `pickupDate`/`returnDate`, `latitude`/`longitude`. Degenerate coordinates (e.g. `lat 90 / lng 180`) fall back to Phnom Penh (`11.5564, 104.9282`).
- `src/services/paymentService.js` added `getMyPayments()`: `GET /api/payments` joined to the user's bookings, enriched with vehicle name; each row exposes `id`(= bookingId), `startDate` (`paidAt`, else booking dates), `vehicleName`, `paymentMethod` (`Cash`/`Bakong KHQR`), `totalPrice` (= amount), `paymentStatus`, `transactionId`, `paymentReference`, `currency`.
- `paymentsByBooking(bookingId)` (`GET /api/payments/booking/{bookingId}`, if present) is used to derive paid/unpaid for a booking.
- **Cancel booking:** the backend has **no cancel endpoint yet** (PUT `/api/bookings/{id}` has no status field), so `cancelBooking(id)` applies cancellation locally only.
- `BookingCard.jsx` / `BookingDetails.jsx` `STATUS_CONFIG` gained a `pending` entry (amber); `Mybooking.jsx` "upcoming" filter matches `pending` + `confirmed`.
- **No mock data:** `mockBookings`, the `getCurrentUser` mock fallback, and `authServices` demo account were all removed. All data comes from live API calls; failures surface to the UI (paid error states in `Mybooking.jsx`/`Payments.jsx`, cached-data fallback in `UserProfile.jsx`).

### Response mapping
`{success, message, data}` is unwrapped by `mapUser`; server field names are translated to the UI shape (see §4 table). Response shape (`UserResponseDTO`):

```json
{ "success": true, "data": { "id": 14, "name": "Admin", "email": "...", "address": null, "phone": null, "profileImage": null, "role": "ADMIN", "emailVerified": true, "createdAt": "2026-09-15T15:34:01.713+00:00" } }
```

---

## 7. Conventions & Rules for This Feature

1. **Styling:** Tailwind utilities only — never inline `<style>` or CSS files. Reuse tokens: `primary`, `primary-dull`, `borderColor`, `slate-*`.
2. **Icons:** Use `react-icons/lu` (`Lu…`) like the rest of the profile feature.
3. **No comments** in JSX unless asked; code should be self-explanatory.
4. **Pure JS/JSX**, ES `import`/`export` — no TypeScript.
5. **Persistence:** use the `rental-auth-user` localStorage key for the cached user profile; `rental-access-token` for auth.
6. **Components:** keep presentational pieces in `src/components/profile/`, page orchestration in `src/pages/`, API in `src/services/`.
7. **Lint:** run `npm run lint` (Oxlint) before committing; `npm run build` to verify.
8. **Null-safety:** components must tolerate a partially-populated `user` object (graceful fallbacks are already in place).

---

## 8. Verification Checklist (manual / after any change)

- [ ] `/profile` loads with the logged-in user from `GET /api/users/me`; no console errors.
- [ ] With no token / backend down, page still renders from localStorage cache.
- [ ] Swapping device width: sidebar is 3-tab row on mobile, vertical nav on `lg+`.
- [ ] Upload photo under 5 MB succeeds against the backend and persists after refresh (server `profileImage`).
- [ ] Uploading a non-image or >5 MB file shows inline error, no crash.
- [ ] Edit → change name/email/phone/address → Save updates the server (`PUT /api/users/{id}`), shows green success, fields lock again.
- [ ] Invalid email / short name / malformed phone blocked with inline messages.
- [ ] Cancel restores original values.
- [ ] Server rejection (e.g. bad token) shows the red error box instead of a false success.
- [ ] Sidebar links: `/profile`, `/bookings`, `/payments` active states highlight correctly.
- [ ] `npm run lint` clean.

---

## 9. Known Gaps / TODOs

- `handleLogout` is wired end-to-end: `signOut()` → clear `rental-access-token` / `rental-refresh-token` / `rental-auth-user` → dispatch `rental-auth-change` → navigate `/login`.
- Google login (`Continue with Google`) is implemented with Google Identity Services (lazy-loaded `gsi/client` helper) — it opens the One Tap/popup and posts the credential as `{ idToken }` to `POST /api/auth/google`. It is gated by a feature flag so unconfigured deployments never error:

### Google login configuration checklist
| Where | Variable | Required value |
|---|---|---|
| Frontend `.env` / host | `VITE_ENABLE_GOOGLE_LOGIN` | `true` (feature flag; otherwise the button shows "Google sign-in coming soon") |
| Frontend `.env` / host | `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 **Web client** ID, e.g. `xxxxx.apps.googleusercontent.com` |
| Google Cloud Console | Authorized JavaScript origins | The app origin (e.g. `http://localhost:5173`, production URL) |
| Google Cloud Console | Authorized redirect URIs | Backend's google callback URI if your flow redirects (this app uses popup, so origin-only often suffices) |
| Backend host (Render/cloud env vars) | `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | The same Web client's credentials that the backend verifies the ID token against |

Enabling checklist: create a Web OAuth client in Google Cloud → add this app's origin → set `VITE_ENABLE_GOOGLE_LOGIN=true` + `VITE_GOOGLE_CLIENT_ID` in the frontend env → add `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` to the backend deployment env. When disabled, the UI shows a disabled "Google sign-in coming soon" button — no unhandled errors.
- Booking cancellation is **local-only** (no `PUT /api/bookings/{id}/cancel` or status field on the backend yet) — needs a backend endpoint to persist.
- `Payments.jsx` "payment" rows are derived from the payments API; the checkout flow (`PaymentVisa`/`PaymentKHQR` modals) still needs a create-payment endpoint.
- Password / security management is **not** part of this screen yet.
- Legacy empty file `src/services/userSrevice.js` (typo) still exists — everything imports the correctly-named `userService.js`.

---

## 10. Quick Reference (files touched for common tasks)

| Task | Files |
|---|---|
| Add a profile field (e.g. address) | `ProfileForm.jsx` (+ `userService.js` payload) |
| Add a sidebar destination | `ProfileSidebar.jsx` (`sidebarItems`) + `App.jsx` route |
| Change photo rules | `ProfileInfo.jsx` (`handlePhotoSelect`) |
| Real backend wiring | `userService.js` + `api.js` (+ `UserProfile.jsx` logout) |
| Smooth animations/Sort of the form | `ProfileForm.jsx` |