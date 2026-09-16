# AGENTS.md — Rental Company Project

## Project Overview

A **Vehicle Rental Company** web application — a platform where customers browse and rent vehicles (cars, motorbikes, bicycles) and owners/admins manage the fleet via a dashboard.

**Status:** Early-stage / Work-in-Progress. Many components are stubs. No backend is present in this repo.

---

## Tech Stack

| Layer        | Technology                                     |
|--------------|------------------------------------------------|
| Language     | JavaScript (JSX) — no TypeScript source files   |
| UI Framework | React 19.2.8                                   |
| Build Tool   | Vite 8.2.0 (`@vitejs/plugin-react` 6.0.4)    |
| CSS          | Tailwind CSS 4.3.3 (via `@tailwindcss/vite`)  |
| Routing      | React Router DOM 7.18.2 (`BrowserRouter`)      |
| Icons        | react-icons 5.7.0                              |
| Validation   | Zod 4.4.3 (declared, not yet used)             |
| Linter       | Oxlint 1.75.0 (NOT ESLint)                     |
| Module Type  | ES Modules (`"type": "module"`)                |

---

## NPM Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run lint      # Run Oxlint
npm run preview   # Preview production build
```

**Run `npm run lint` before committing any changes.**

---

## Project Structure

```
RentalCompany/
├── index.html                  # Vite HTML entry
├── vite.config.js              # Vite config (React + Tailwind plugins)
├── .env                        # VITE_CURRENCY=$
├── .oxlintrc.json              # Linter config
├── package.json
│
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
└── src/
    ├── main.jsx                # App entry — renders <App /> in BrowserRouter
    ├── App.jsx                 # Root component — route definitions
    ├── index.css               # Global styles, Tailwind, theme (Outfit font, colors)
    │
    ├── assets/
    │   └── assets.js           # Barrel exports + dummy data (cities, cars, users, dashboard stats)
    │
    ├── components/
    │   ├── Hero.jsx            # Landing hero (IMPLEMENTED)
    │   ├── Banner.jsx          # CTA banner (IMPLEMENTED)
    │   ├── FeaturedSection.jsx # Featured vehicles grid (IMPLEMENTED)
    │   ├── Testimonial.jsx     # (STUB)
    │   ├── Title.jsx           # Reusable section title
    │   │
    │   ├── auth/
    │   │   ├── Login.jsx       # (STUB)
    │   │   ├── Register.jsx    # (STUB)
    │   │   └── GoogleCallBack.jsx  # (STUB)
    │   │
    │   ├── common/
    │   │   ├── Navbar.jsx      # Main nav bar (IMPLEMENTED)
    │   │   ├── Footer.jsx      # (STUB)
    │   │   └── Title.jsx       # (STUB)
    │   │
    │   ├── owner/
    │   │   ├── Sidebar.jsx     # (STUB)
    │   │   ├── NavbarOwner.jsx # (STUB)
    │   │   └── Title.jsx       # (STUB)
    │   │
    │   └── vehicles/
    │       ├── CarCard.jsx     # Vehicle card (IMPLEMENTED)
    │       ├── MotoCard.jsx    # (STUB)
    │       └── BikeCard.jsx    # (STUB)
    │
    ├── pages/
    │   ├── customer/
    │   │   ├── Home.jsx        # Landing page (IMPLEMENTED)
    │   │   ├── Mybooking.jsx   # (STUB)
    │   │   └── UserProfile.jsx # (STUB)
    │   │
    │   ├── vehicles/
    │   │   ├── Cars.jsx        # (STUB)
    │   │   ├── MotorBikes.jsx  # (STUB)
    │   │   ├── Bicycles.jsx    # (STUB)
    │   │   └── VehicleDetail.jsx  # (STUB)
    │   │
    │   └── owner/
    │       ├── Dashboard.jsx   # (EMPTY)
    │       ├── Layout.jsx      # (STUB)
    │       ├── AddVehicle.jsx  # (STUB)
    │       ├── ManageVehicle.jsx   # (STUB)
    │       ├── Managebooking.jsx   # (STUB)
    │       └── ManageUser.jsx      # (STUB)
    │
    └── services/               # API service layer (ALL EMPTY)
        ├── api.js
        ├── authServices.js
        ├── bookingService.js
        ├── userService.js
        └── vehicleServices.js
```

---

## Routing

Currently wired in `App.jsx`:

| Route         | Component  | Status   |
|---------------|------------|----------|
| `/`           | Home       | Done     |
| `/cars`       | Cars       | Stub     |
| `/motorbikes` | MotorBikes | Stub     |
| `/bicycles`   | Bicycles   | Stub     |
| `/login`      | Login      | Stub     |
| `/register`   | Register   | Stub     |

**NOT yet wired:** Owner routes (`/owner/*`), VehicleDetail, MyBookings, UserProfile.

---

## Two User Roles

1. **Customer** — Browse vehicles, make bookings, manage bookings, view profile.
   - Pages: `pages/customer/`, `pages/vehicles/`
   - Components: `components/common/`, `components/vehicles/`, `components/auth/`

2. **Owner/Admin** — Manage fleet, bookings, users; view dashboard stats.
   - Pages: `pages/owner/`
   - Components: `components/owner/`

---

## Styling & Theme

- **Font:** Outfit (Google Fonts, loaded in `index.css`)
- **Colors:** Primary `#2563eb`, Light `#f1f5f9`, Border `#c4c7d2`
- **Framework:** Tailwind CSS 4 — use utility classes directly in JSX
- **Currency symbol:** Controlled via `VITE_CURRENCY` in `.env` (currently `$`)

---

## Dummy Data

Hardcoded in `src/assets/assets.js`:
- City list: New York, Los Angeles, Houston, Chicago, Phnom Penh, Seam Reap
- Car data: BMW X5, Toyota Corolla, Jeep Wrangler, Ford Neo 6 (with prices per day)
- User data, dashboard statistics
- Menu links for customer and owner navigation

---

## What Is NOT Implemented Yet

- All API service files (`src/services/`) — empty, awaiting backend integration
- Authentication (Login, Register, GoogleCallBack) — stubs only
- Owner dashboard and all management pages — empty/stubs
- Vehicle listing pages (Cars, MotorBikes, Bicycles) — stubs only
- VehicleDetail page — stub
- MyBookings, UserProfile — stubs
- Footer, Testimonial, MotoCard, BikeCard — stubs
- No backend API exists in this repository
- No tests — no test framework is installed

---

## Known Issues

- **Duplicate component names:** `Title.jsx` exists in 3 locations (`components/`, `components/common/`, `components/owner/`)
- **Owner routes** are not registered in `App.jsx` yet

---

## Guidelines for Development

1. **Linting:** Always run `npm run lint` before committing
2. **Styling:** Use Tailwind utility classes. Follow existing theme colors in `index.css`
3. **Components:** Follow the existing folder structure (`components/{role}/`, `pages/{role}/`)
4. **Routing:** Add new routes in `src/App.jsx`
5. **Services:** Place API logic in `src/services/`. Use `api.js` as the base HTTP client
6. **Assets:** Import from `src/assets/assets.js` — do not add images directly without updating the barrel export
7. **No TypeScript:** Project is pure JavaScript/JSX
8. **Module imports:** Use ES Module syntax (`import`/`export`)
