# Airbnb Clone — Fullstack Assignment

A functional clone of the Airbnb web application that replicates Airbnb's design, user experience, and core booking workflows. The platform allows users to browse and search property listings, view listing details, filter by criteria, book stays for a date range, and (as a host) create and manage their own listings.

## Tech Stack

- **Frontend:** Next.js (TypeScript)
- **Backend:** Python with FastAPI
- **Database:** SQLite

## Features

### Core Features

1. **Home & Search**
   - Grid of listing cards with photo, title, location, price/night, and rating
   - Search bar (location + date range + guests)
   - Category / filter row (price range, property type, amenities, etc.)
   - Pagination

2. **Listing Detail Page**
   - Photo gallery
   - Title, description, location, amenities, host info
   - Availability calendar / date-range picker
   - Price breakdown (nightly rate × nights + fees)
   - Reviews section

3. **Booking Flow**
   - Select date range and guest count with validation (no overlapping/unavailable dates)
   - Booking summary and mocked checkout/confirmation
   - "My Trips" view listing the user's bookings
   - All bookings persist and block those dates on the listing

4. **Host Experience (CRUD)**
   - Create a listing (title, description, photos via URL/upload, price, location, amenities)
   - Edit and delete listings
   - A host dashboard of owned listings and their bookings
   - All listing data persists

5. **Airbnb Experience**
   - Navigation and layout (explore grid + detail view)
   - Cards, galleries, date pickers, and modals
   - Search, filters, and pagination
   - Notifications / toasts
   - Wishlist / favorites

### Bonus Features

- **Dark Mode**: Toggle between light and dark themes
- **Interactive Map**: Leaflet-based map with listing price pins
- **Image Upload**: Local file upload for listing photos
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Reviews After Stay**: Leave reviews for completed bookings

## Database Schema

- **users** — guests and hosts (`is_host`, `is_superhost`)
- **listings** — home, location, price, category, amenities (CSV), capacity
- **listing_photos** — gallery URLs
- **bookings** — check-in/out, guest count, fee breakdown, status; overlapping confirmed bookings are rejected
- **reviews** — rating + comment per listing
- **wishlists** — unique (user, listing)

Relationships: user 1—N listings, bookings, reviews; listing 1—N photos/bookings/reviews.

## API Overview

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/listings` | Search: `location`, dates, `guests`, price, `property_type`, `category`, `amenities`, `page` |
| GET | `/listings/{id}` | Detail + photos, host, reviews, booked ranges |
| POST/PUT/DELETE | `/listings` | Host CRUD (`X-User-Id`) |
| POST | `/bookings` | Validates dates, guests, availability |
| GET | `/trips` | Current user's bookings |
| GET | `/host/listings`, `/host/bookings` | Host dashboard |
| POST | `/wishlists/{id}` | Toggle favorite |
| POST | `/auth/login` | Demo login by email |
| GET | `/users` | Demo accounts |

## Setup

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API creates SQLite tables and seeds data on first start. To reseed:

```bash
cd backend
PYTHONPATH=. python -m app.seed
```

### Frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Optional: `NEXT_PUBLIC_API_URL` if the API is not on port 8000.

## Demo Accounts

| Role | Email |
| --- | --- |
| Guest (has trips) | `maya@stay.com` |
| Superhost | `jordan@stay.com` |
| Superhost | `alex@stay.com` |
| Host | `sam@stay.com` |

Pick one from **Log in** in the header menu. Maya already has upcoming and past bookings so Trips is populated.

## Assumptions

- Real payments are out of scope; checkout shows a confirmation and persists the booking.
- Auth is mocked (no passwords/JWT). Switching demo users is enough to show guest vs host.
- Photos are Unsplash / pravatar URLs, not cloud uploads.
- Maps use an OpenStreetMap embed, not live pricing pins.
- Messaging and identity verification are placeholder pages.

## Live Demo

- **Frontend:** https://airbnb-clone-assessment-rho.vercel.app
- **Backend API:** https://airbnb-backend-6ewv.onrender.com
- **API Docs:** https://airbnb-backend-6ewv.onrender.com/docs

## Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com) and click "New Project"
3. Import your GitHub repository
4. Select the `frontend` folder as root directory
5. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
6. Click "Deploy"

### Backend (Render)

1. Push code to GitHub
2. Go to [Render](https://render.com) and click "New +"
3. Select "Web Service"
4. Connect your GitHub repository
5. Root directory: `backend`
6. Build command: `pip install -r requirements.txt`
7. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. Click "Deploy Web Service"

## Environment Variables

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend (Render):**
- No additional environment variables needed for this demo
