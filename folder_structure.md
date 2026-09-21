# Folder Structure - Rental Company Project

## Overview
This document provides a complete overview of the `src/` folder structure for AI reference.

---

## Root Level (`src/`)

```
src/
├── main.jsx                    # App entry point
├── App.jsx                     # Root component with route definitions
├── index.css                   # Global styles, Tailwind, theme
├── utils/                      # Utility functions
├── context/                    # React Context providers
├── hooks/                      # Custom React hooks
├── assets/                     # Static assets (images, icons, data)
├── services/                   # API service layer
├── components/                 # Reusable UI components
└── pages/                      # Page-level components
```

---

## Detailed Structure

### `src/utils/`
```
utils/
└── vehicleTypeMap.js           # Vehicle type mapping utilities
```

### `src/context/`
```
context/
├── ToastContext.jsx            # Toast notifications
├── ThemeContext.jsx            # Theme management
├── PreferencesContext.jsx      # User preferences
├── CompareContext.jsx          # Vehicle comparison
└── AuthContext.jsx             # Authentication state
```

### `src/hooks/`
```
hooks/
└── useWishlist.js              # Wishlist management hook
```

### `src/assets/`
```
assets/
├── assets.js                   # Barrel exports + dummy data (cities, cars, users, stats)
├── *.svg                       # Icons (logo, social, UI icons)
├── *.png                       # Images (cars, hero, testimonials, profile)
└── favicon.svg                 # Favicon
```

### `src/services/`
```
services/
├── api.js                      # Base HTTP client
├── authServices.js             # Authentication API
├── authStorage.js              # Token storage utilities
├── bookingService.js           # Booking API
├── vehicleServices.js          # Vehicle API
├── userService.js              # User API
├── paymentService.js           # Payment API
├── jwtUtils.js                 # JWT utilities
├── Client.js                   # API client wrapper
└── adapters.js                 # Data transformation adapters
```

### `src/components/`
```
components/
├── Hero.jsx                    # Landing hero section
├── HeroCarViewer.jsx           # 3D car viewer for hero
├── Banner.jsx                  # CTA banner
├── FeaturedSection.jsx         # Featured vehicles grid
├── Testimonial.jsx             # Customer testimonials
├── WhyChooseUs.jsx             # Value propositions
├── HowItWorks.jsx              # Process steps
├── RecommendedTrips.jsx        # Trip recommendations
├── StatsBanner.jsx             # Statistics display
├── Faq.jsx                     # FAQ section
├── NewsletterBanner.jsx        # Newsletter signup
├── LiveChatButton.jsx          # Live chat widget
├── PriceEstimator.jsx          # Price calculator
├── VehicleQuickViewModal.jsx   # Quick view modal
├── TiltCard.jsx                # Interactive card effect
├── Reveal.jsx                  # Scroll reveal animation
├── Title.jsx                   # Reusable section title (root)
│
├── auth/                       # Authentication components
│   ├── Login.jsx               # Login form
│   ├── Register.jsx            # Registration form
│   ├── GoogleCallBack.jsx      # Google OAuth callback
│   └── AuthModal.jsx           # Auth modal wrapper
│
├── common/                     # Shared/common components
│   ├── Navbar.jsx              # Main navigation bar
│   ├── Footer.jsx              # Site footer
│   ├── Logo.jsx                # Logo component
│   ├── Title.jsx               # Section title (common)
│   ├── CustomDatePicker.jsx    # Date picker wrapper
│   ├── SafeImage.jsx           # Safe image with fallback
│   ├── RequireAuth.jsx         # Auth protection HOC
│   └── AdminRequireAuth.jsx    # Admin auth protection HOC
│
├── vehicles/                   # Vehicle display components
│   ├── CarCard.jsx             # Car display card
│   ├── MotoCard.jsx            # Motorbike display card
│   ├── BikeCard.jsx            # Bicycle display card
│   └── VehiclePricingModal.jsx # Pricing details modal
│
└── profile/                    # User profile components
    ├── BookingCard.jsx         # Booking display card
    ├── CancelBookingModal.jsx  # Cancellation modal
    ├── BookingFilters.jsx      # Booking filter controls
    ├── ProfileForm.jsx         # Profile edit form
    ├── LoginMethodCard.jsx     # Login method display
    ├── ProfileInfo.jsx         # Profile info display
    └── ProfileSidebar.jsx      # Profile navigation sidebar
```

### `src/pages/`
```
pages/
├── customer/                   # Customer-facing pages
│   ├── Home.jsx                # Landing page
│   ├── About.jsx               # About page
│   ├── Mybooking.jsx           # User bookings list
│   ├── BookingDetails.jsx      # Booking detail view
│   ├── Checkout.jsx            # Checkout flow
│   ├── Payment.jsx             # Payment selection
│   ├── PaymentVisa.jsx         # Visa payment
│   ├── PaymentKHQR.jsx         # KHQR payment
│   ├── Payments.jsx            # Payment history
│   └── UserProfile.jsx         # User profile page
│
├── vehicles/                   # Vehicle browsing pages
│   ├── Cars.jsx                # Cars listing
│   ├── MotorBikes.jsx          # Motorbikes listing
│   ├── Bicycles.jsx            # Bicycles listing
│   └── VehicleDetail.jsx       # Vehicle detail page
│
└── admin/                      # Admin/owner dashboard pages
    ├── Layout.jsx              # Admin layout wrapper
    ├── Dashboard.jsx           # Dashboard overview
    ├── Analytics.jsx           # Analytics reports
    ├── ManageVehicle.jsx       # Vehicle management
    ├── AddVehicle.jsx          # Add new vehicle
    ├── Managebooking.jsx       # Booking management
    ├── ManageUser.jsx          # User management (singular)
    ├── ManageUsers.jsx         # User management (plural)
    ├── ManageLocations.jsx     # Location management
    ├── AddLocation.jsx         # Add new location
    ├── ManageCategories.jsx    # Category management
    └── AddCategory.jsx         # Add new category
```

---

## Key Patterns

| Pattern | Description |
|---------|-------------|
| **Role-based folders** | `components/auth/`, `components/common/`, `components/vehicles/`, `components/profile/`, `pages/customer/`, `pages/vehicles/`, `pages/admin/` |
| **Barrel exports** | `assets/assets.js` exports all dummy data and asset references |
| **Context providers** | All global state in `context/` (Auth, Theme, Toast, etc.) |
| **Service layer** | All API logic in `services/` with base client in `api.js` |
| **Custom hooks** | Reusable logic in `hooks/` (e.g., `useWishlist`) |
| **Utility functions** | Pure helpers in `utils/` |

---

## Routing Reference (from `App.jsx`)

| Route | Page Component | Role |
|-------|---------------|------|
| `/` | Home | Customer |
| `/about` | About | Customer |
| `/cars` | Cars | Customer |
| `/motorbikes` | MotorBikes | Customer |
| `/bicycles` | Bicycles | Customer |
| `/vehicle/:id` | VehicleDetail | Customer |
| `/my-bookings` | Mybooking | Customer (auth) |
| `/booking/:id` | BookingDetails | Customer (auth) |
| `/checkout` | Checkout | Customer (auth) |
| `/payment` | Payment | Customer (auth) |
| `/payments` | Payments | Customer (auth) |
| `/profile` | UserProfile | Customer (auth) |
| `/admin/*` | Admin pages | Admin (auth) |
| `/login` | Login (AuthModal) | Public |
| `/register` | Register (AuthModal) | Public |

---

## Notes for AI

1. **Duplicate names exist**: `Title.jsx` appears in `components/`, `components/common/` - check import paths carefully
2. **Admin vs Owner**: Codebase uses `admin/` folder but AGENTS.md refers to "Owner" role - they are the same
3. **Auth flows**: Login/Register are in `components/auth/` but also accessible via `AuthModal.jsx`
4. **Payment variants**: Multiple payment pages (Visa, KHQR, generic) - check which is active
5. **No TypeScript**: Pure JavaScript/JSX project
6. **ES Modules**: Use `import`/`export` syntax throughout