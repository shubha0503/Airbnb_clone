# Airbnb-style Stays Marketplace

A responsive Airbnb-inspired stays marketplace built for the Airbnb Web App SDE assignment. It uses Next.js 14 with TypeScript and Tailwind CSS, a FastAPI backend, SQLAlchemy, and SQLite. It includes hashed-password accounts, seeded demo accounts, and Stripe Checkout in test mode.

## Run locally

### Backend

From the repository root, create and install a virtual environment, seed an empty demo database, and start the API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

Copy `backend/.env.example` to `backend/.env` and add Stripe **test-mode** credentials. Keep this file private and never use a live key for the assignment:

```text
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

`STRIPE_SECRET_KEY` stays on the backend. Hosted Checkout does not need the publishable key in the browser. Without a valid `sk_test_` key, browsing and account flows work, but checkout returns a configuration error.

For local payment status updates, run Stripe CLI in another terminal after installing and authenticating it, then forward events to `http://127.0.0.1:8000/api/payments/webhook`. Set `STRIPE_WEBHOOK_SECRET` to the `whsec_...` value printed by the CLI. The success page retrieves the Checkout Session and verifies payment, amount, and currency before marking a booking paid. Stripe hosts card entry; this app never handles card numbers. Use Stripe's test card `4242 4242 4242 4242`, any future expiry, any 3 digit CVC, and a valid postal code.

The API is available at `http://127.0.0.1:8000`; interactive API docs are at `http://127.0.0.1:8000/docs`. SQLite always uses `backend/airbnb.db`, regardless of command working directory. The seed script inserts demo data only when the database is empty and refuses to replace existing records. To intentionally reset demo data, set `$env:AIRBNB_RESET_DATABASE='1'` before running `python -m app.seed`; this replaces current database content.

Seeded test accounts (startup adds them if absent and only sets a password when one is missing):

| Role | Email | Password |
|---|---|---|
| Guest | `ashi@example.com` | `Guest1234!` |
| Host | `aarav.host@example.com` | `Host1234!` |

New accounts can register as guests or hosts. The profile menu only shows the signed-in account; there is no persona switcher or automatic login. Guests can enable host tools from `/host`.

### Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. By default, the frontend calls `http://127.0.0.1:8000/api`. To use a different API host, create `frontend/.env.local` with:

```text
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

## Main flows

- Browse image-led stay cards, filter by destination, dates, guests, price, property type, bedrooms, beds, and amenities, and paginate the result list.
- Open a listing for its photo gallery, amenities, reviews, host details, date selection, availability checks, and a fee breakdown.
- Pay for a reservation through Stripe-hosted test checkout. Dates are held while payment is pending, and the API confirms only bookings Stripe reports as paid. Cancelled checkouts release their dates.
- Create an account or log in at `/register` and `/login`. Passwords are salted and hashed before storage. Test accounts are listed above; account details and role are stored in SQLite.
- Use responsive Homes, Experiences, and Services navigation; Experiences and Services contain curated demo landing pages, while home search, listing details, maps, and host tools use the assignment API.
- Save and remove listings from a per-user wishlist.
- Hosts can create, edit, and delete their own listings and inspect confirmed reservations. A listing with reservation history cannot be deleted, preserving those records.

## Architecture and data model

The Next.js app-router pages and reusable React components live under `frontend/src`. `frontend/src/services/api.ts` owns HTTP requests and adapts API payloads into UI types. The FastAPI app registers feature routers under `/api`; SQLAlchemy models and Pydantic schemas are separated into `backend/app/models` and `backend/app/schemas`.

SQLite tables: `users`, `listings`, `listing_images`, `amenities`, `listing_amenities`, `bookings`, `reviews`, and `wishlists`. Startup applies additive password/payment columns and indexes without clearing user data. Foreign keys are enabled; wishlist pairs and Stripe Checkout Session IDs are unique. Stripe-confirmed bookings store `payment_status=paid` plus their session/payment-intent references. Older seeded reservations remain marked as legacy demo records.

## API overview

- `GET /api/listings/` and `GET /api/listings/{id}`: search and listing details.
- `POST /api/listings/?host_id=...`, `PUT /api/listings/{id}?host_id=...`, `DELETE /api/listings/{id}?host_id=...`: host listing CRUD.
- `GET /api/amenities/`, `GET /api/users/{id}`, `GET /api/hosts/{id}/listings`, `GET /api/hosts/{id}/bookings`.
- `GET /api/bookings/my-trips/{user_id}`, `GET /api/bookings/availability/{listing_id}`, `DELETE /api/bookings/{id}`. `POST /api/bookings/` is disabled so unverified requests cannot create confirmed reservations.
- `GET /api/wishlist/{user_id}`, `POST /api/wishlist/toggle/{user_id}/{listing_id}`, `POST /api/wishlist/`, `DELETE /api/wishlist/{user_id}/{listing_id}`.
- `GET /api/reviews/listing/{listing_id}`, `POST /api/reviews/`.
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/become-host/{user_id}`.
- `POST /api/payments/checkout`, `GET /api/payments/session/{session_id}`, `POST /api/payments/webhook`.

## Assumptions

- This assignment's profile/ID-based APIs are a local demo and are not a production authentication system. Do not use real personal information or deploy with demo credentials.
- Stripe requires your own test API credentials and a working internet connection. Listing and experience photos use image URLs; broken listing images fall back to a sample stay photo.
- Search, booking, reviews, and account IDs are backed by the local database; map tiles and user-provided image URLs require internet access.
