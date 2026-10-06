# Airbnb-style Stays Marketplace

A responsive Airbnb-inspired stays marketplace built for the Airbnb Web App SDE assignment. It uses Next.js 14 with TypeScript and Tailwind CSS, a FastAPI backend, SQLAlchemy, and SQLite. It includes salted-password demo accounts and optional Stripe Checkout in test mode.

## Run locally

### Backend

From the repository root, create and install a virtual environment, seed the demo database, and start the API:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

To enable Stripe checkout, copy `.env.example` to `.env` in `backend`, then replace the placeholders with your Stripe **test-mode** secret key and webhook signing secret. Keep this file private and never use a live key for the assignment. Without a valid `sk_test_` key, listings and account flows still work and the checkout screen explains how to configure payments.

For local payment status updates, run Stripe CLI in another terminal after installing and authenticating it, then forward events to `http://127.0.0.1:8000/api/payments/webhook`. Set `STRIPE_WEBHOOK_SECRET` to the `whsec_...` value printed by the CLI. The success page also retrieves the Checkout Session from Stripe to confirm paid bookings. Stripe hosts the card-entry page; this app never handles card numbers.

The API is available at `http://127.0.0.1:8000`; interactive API docs are at `http://127.0.0.1:8000/docs`. The SQLite file is `backend/airbnb.db` when commands are run from the backend directory. The seed script resets demo tables and inserts hosts, guests, amenities, ten photo listings, reviews, bookings, and wishlists. Run it only when you want to reset demo data.

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
- Create an account or log in at `/register` and `/login`. Passwords are salted and hashed before storage. Existing assignment guest/host profiles remain available from the profile menu.
- Use responsive Homes, Experiences, and Services navigation; Experiences and Services contain curated demo landing pages, while home search, listing details, maps, and host tools use the assignment API.
- Save and remove listings from a per-user wishlist.
- Switch among seeded guest and host demo personas from the profile menu. Hosts can create, edit, and delete their own listings and inspect reservations.

## Architecture and data model

The Next.js app-router pages and reusable React components live under `frontend/src`. `frontend/src/services/api.ts` owns HTTP requests and adapts API payloads into UI types. The FastAPI app registers feature routers under `/api`; SQLAlchemy models and Pydantic schemas are separated into `backend/app/models` and `backend/app/schemas`.

SQLite tables: `users`, `listings`, `listing_images`, `amenities`, `listing_amenities`, `bookings`, `reviews`, and `wishlists`. Startup adds the nullable password-hash column to an existing users table without erasing the seeded database.

## API overview

- `GET /api/listings/` and `GET /api/listings/{id}`: search and listing details.
- `POST /api/listings/?host_id=...`, `PUT /api/listings/{id}?host_id=...`, `DELETE /api/listings/{id}?host_id=...`: host listing CRUD.
- `GET /api/amenities/`, `GET /api/users/`, `GET /api/hosts/{id}/listings`, `GET /api/hosts/{id}/bookings`.
- `POST /api/bookings/`, `GET /api/bookings/my-trips/{user_id}`, `GET /api/bookings/availability/{listing_id}`, `DELETE /api/bookings/{id}`.
- `GET /api/wishlist/{user_id}`, `POST /api/wishlist/`, `DELETE /api/wishlist/{user_id}/{listing_id}`.
- `GET /api/reviews/listing/{listing_id}`, `POST /api/reviews/`.
- `POST /api/auth/register`, `POST /api/auth/login`.
- `POST /api/payments/checkout`, `GET /api/payments/session/{session_id}`, `POST /api/payments/webhook`.

## Assumptions

- This assignment's profile/ID-based APIs are a local demo and are not a production authentication system. Do not use real personal information or deploy with demo credentials.
- Stripe requires your own test API credentials and a working internet connection. Listing and experience photos use image URLs; broken listing images fall back to a sample stay photo.
- Search, booking, reviews, and persona IDs are backed by the local database; map tiles and user-provided image URLs require internet access.
