# 15 Learning Project Setups

Built around the templates in this repo. Each project is scoped for a few focused days — enough to hit real backend/frontend problems, short enough to avoid burnout.

> **Rule of thumb:** copy the listed templates into a fresh folder per project. Don't modify the templates themselves.

---

## Suggested Order

1. Start with **monolith + no auth** to warm up.
2. Add **auth + booking/scheduling** to practice real-world guardrails.
3. Try **microservices** once monolith patterns feel comfortable.
4. Mix in **React Native** projects to break up web-only fatigue.

---

## 1. Group Bill Splitter
- **Stack:** `fastapi-template-monolith` + `astro-template-fullstack`
- **Auth:** No (shareable group link or local group token)
- **Domain:** Groups → Expenses → Balances → Settlements
- **MVP:**
  - Create a group and invite others via link.
  - Add expenses split equally or by percentage.
  - Compute "who owes whom" with minimal transactions.
  - Mark settlements as paid.
- **Backend practice:** Many-to-many relationships, aggregation queries, debt simplification algorithm.
- **Frontend practice:** Astro static-ish forms, TanStack Query for server state.
- **Stretch:** Receipt image upload, basic OCR for amount/title.

---

## 2. Bookable Meeting Rooms
- **Stack:** `nest-template-monolith` + `next-template-fullstack`
- **Auth:** Yes (JWT or magic link)
- **Domain:** Rooms → Time Slots → Bookings → Cancellations
- **MVP:**
  - List rooms with capacity/equipment.
  - Book a 30/60-minute slot with conflict prevention.
  - View and cancel my bookings.
  - Admin can add/edit rooms.
- **Backend practice:** Prisma relations, unique overlapping-slot constraints, Nest guards.
- **Frontend practice:** Next.js App Router, server actions, optimistic UI.
- **Stretch:** Recurring bookings, .ics calendar export.

---

## 3. Neighborhood Tool Library
- **Stack:** `django-template-monolith` + `react-router-template-fullstack`
- **Auth:** Yes (Django session/auth)
- **Domain:** Tools → Loans → Reservations → Returns
- **MVP:**
  - Catalog tools with availability calendar.
  - Reserve a tool for a date range.
  - Mark picked up and returned.
  - Django admin for tool management.
- **Backend practice:** Django ORM, admin customization, availability windows.
- **Frontend practice:** React Router SPA, date-range picker, optimistic updates.
- **Stretch:** QR code check-in/out flow.

---

## 4. Parking Spot Marketplace
- **Stack:** `nest-template-microservice` + `tanstack-template-fullstack`
- **Auth:** Yes (OAuth2 mock or JWT)
- **Domain:** Listings → Pricing → Bookings → Payouts
- **MVP:**
  - Host lists a spot with hourly/daily rate and availability.
  - Guest searches by location and date range.
  - Booking request → host confirmation.
  - Mock payout per booking.
- **Backend practice:** Microservice boundaries (listings, bookings, payments), inter-service HTTP/events, Nest microservices patterns.
- **Frontend practice:** TanStack Start server functions, forms, search params state.
- **Stretch:** Map view with pins, instant booking.

---

## 5. Meal Plan & Pantry
- **Stack:** `fastapi-template-monolith` + `astro-template-fullstack`
- **Auth:** No
- **Domain:** Recipes → Meal Calendar → Shopping List
- **MVP:**
  - Add recipes with ingredients.
  - Plan meals on a weekly calendar.
  - Generate a shopping list aggregated by category/aisle.
  - Mark pantry items as already owned.
- **Backend practice:** Aggregation, many-to-many recipe/ingredient model, FastAPI dependency injection.
- **Frontend practice:** Astro islands, lightweight interactivity.
- **Stretch:** Nutrition API integration, dietary filters.

---

## 6. Freelance Gig Board
- **Stack:** `django-template-monolith` + `next-template-fullstack`
- **Auth:** Partial (public browsing, auth required to post/apply)
- **Domain:** Gigs → Proposals → Categories → Status
- **MVP:**
  - Public list of gigs by category.
  - Authenticated clients post gigs.
  - Authenticated freelancers submit proposals.
  - Client accepts/rejects proposals.
- **Backend practice:** Django permissions, public vs authenticated routes, model status machine.
- **Frontend practice:** Next.js auth-gated pages, public SSR, proposal forms.
- **Stretch:** Escrow/payment mock, review after completion.

---

## 7. Event Ticketing
- **Stack:** `nest-template-monolith` + `next-template-fullstack`
- **Auth:** Yes
- **Domain:** Events → Ticket Types → Inventory → Orders
- **MVP:**
  - Organizers create events and ticket types with quotas.
  - Attendees purchase tickets (mock payment).
  - Generate QR ticket per order.
  - Check-in scanner page validates QR.
- **Backend practice:** Inventory concurrency, atomic decrement, QR generation, Prisma transactions.
- **Frontend practice:** Checkout flow, ticket viewer, QR reader.
- **Stretch:** Waiting list, dynamic pricing.

---

## 8. Desk Booking (Mobile-First)
- **Stack:** `fastapi-template-microservice` + `expo-template-mobile`
- **Auth:** Yes
- **Domain:** Locations → Desks → Bookings
- **MVP:**
  - List offices and desks.
  - Book a desk for a specific day.
  - View my upcoming bookings.
  - Cancel a booking.
- **Backend practice:** FastAPI microservice structure, async SQLAlchemy, booking conflicts.
- **Mobile practice:** Expo Router, forms, TanStack Query, date pickers.
- **Stretch:** Push reminders, floor plan image.

---

## 9. Local Classifieds Board
- **Stack:** `adonis-template-monolith` + `react-router-template-fullstack`
- **Auth:** Partial (public browse, auth to post/message)
- **Domain:** Listings → Categories → Favorites → Messages
- **MVP:**
  - Browse listings by category with search.
  - Authenticated users post listings with images.
  - Favorite listings.
  - Contact seller via in-app thread.
- **Backend practice:** Adonis Lucid ORM, file uploads, auth, messaging model.
- **Frontend practice:** React Router loaders/actions, image gallery, filters.
- **Stretch:** Price alerts, infinite scroll.

---

## 10. Habit Tracker with Stats
- **Stack:** `nest-template-monolith` + `next-template-fullstack`
- **Auth:** Yes
- **Domain:** Habits → Completions → Streaks → Analytics
- **MVP:**
  - CRUD habits with frequency (daily/weekly).
  - Mark complete per day.
  - Show current streak and heatmap.
  - Weekly/monthly completion stats.
- **Backend practice:** Time-series aggregation, streak calculation, Prisma grouping.
- **Frontend practice:** Dashboard UI, calendar heatmap, stats charts.
- **Stretch:** Reminders, habit categories.

---

## 11. Service Appointment Scheduler
- **Stack:** `fastapi-template-monolith` + `astro-template-fullstack`
- **Auth:** Yes
- **Domain:** Services → Staff → Availability → Appointments
- **MVP:**
  - Define services and staff members.
  - Set staff weekly availability.
  - Customers book available slots.
  - Staff dashboard to see/cancel appointments.
- **Backend practice:** Availability rules, slot generation, conflict detection, Pydantic validators.
- **Frontend practice:** Astro with client islands for booking calendar.
- **Stretch:** Email/SMS reminders, recurring availability exceptions.

---

## 12. Subscription Box Curator
- **Stack:** `django-template-monolith` + `tanstack-template-fullstack`
- **Auth:** Yes
- **Domain:** Boxes → Products → Subscriptions → Billing Cycle
- **MVP:**
  - Curator creates themed boxes with products.
  - Customer subscribes monthly to a box.
  - View upcoming box and history.
  - Cancel or skip a month.
- **Backend practice:** Subscription lifecycle, date arithmetic, Django signals for renewal mock.
- **Frontend practice:** TanStack Start mutations, subscription management UI.
- **Stretch:** Payment provider mock, referral discount.

---

## 13. Carpool Rides Board
- **Stack:** `nest-template-microservice` + `react-router-template-fullstack`
- **Auth:** Partial (public search, auth to offer/request a seat)
- **Domain:** Rides → Seats → Requests → Approvals
- **MVP:**
  - Driver offers ride with origin/destination/date and seat count.
  - Passenger searches by route/date.
  - Request a seat; driver approves/declines.
  - Seat inventory decrements on approval.
- **Backend practice:** Microservice split (rides, requests, notifications), route matching, inventory.
- **Frontend practice:** React Router search, request flow, approval UI.
- **Stretch:** Map route display, in-app chat.

---

## 14. Home Inventory & Loan Manager
- **Stack:** `fastapi-template-monolith` + `expo-template-mobile`
- **Auth:** Yes
- **Domain:** Items → Locations → Loans → Borrowers
- **MVP:**
  - Add home items with photos and location.
  - Lend an item to a contact with due date.
  - Track borrowed/returned status.
  - View overdue loans.
- **Backend practice:** File upload/storage, date filtering, contact association.
- **Mobile practice:** Camera roll, Expo image picker, list/detail screens.
- **Stretch:** Barcode scanning, reminder notifications.

---

## 15. Campground / Cabin Rental
- **Stack:** `nest-template-monolith` + `next-template-fullstack`
- **Auth:** Yes
- **Domain:** Properties → Seasonal Pricing → Bookings → Reviews
- **MVP:**
  - Host lists property with nightly rates per season.
  - Guest searches by date range and location.
  - Enforce minimum stay and availability.
  - Host/guest dashboard for bookings.
- **Backend practice:** Date-range pricing, availability calendar, booking rules engine.
- **Frontend practice:** Calendar UI, date-range search, dashboard.
- **Stretch:** Review system, cleaning fee add-ons.

---

## Template Usage Map

| Template | Projects Used In |
| --- | --- |
| `fastapi-template-monolith` | 1, 5, 11, 14 |
| `fastapi-template-microservice` | 8 |
| `nest-template-monolith` | 2, 7, 10, 15 |
| `nest-template-microservice` | 4, 13 |
| `django-template-monolith` | 3, 6, 12 |
| `adonis-template-monolith` | 9 |
| `next-template-fullstack` | 2, 6, 7, 10, 15 |
| `astro-template-fullstack` | 1, 5, 11 |
| `react-router-template-fullstack` | 3, 9, 13 |
| `tanstack-template-fullstack` | 4, 12 |
| `expo-template-mobile` | 8, 14 |

---

## Recommended Two-Project Rotations

If you want to alternate focus areas:

- **Backend-heavy week:** Projects 4 (microservices marketplace) + 13 (microservices carpool).
- **Frontend-heavy week:** Projects 2 (Next.js booking) + 15 (Next.js rental).
- **Mobile week:** Projects 8 (desk booking) + 14 (inventory loans).
- **No-auth/util week:** Projects 1 (bill splitter) + 5 (meal planner).
- **Auth/classical week:** Projects 7 (ticketing) + 10 (habits).
