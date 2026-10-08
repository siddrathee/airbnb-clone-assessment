from datetime import date

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .database import Base, SessionLocal, engine, get_db
from .deps import get_current_user, get_optional_user
from .models import Booking, Listing, ListingPhoto, Review, User, Wishlist
from .schemas import (
    BookingCreate,
    BookingOut,
    ListingCardOut,
    ListingCreate,
    ListingDetailOut,
    ListingUpdate,
    LoginIn,
    PageOut,
    ReviewCreate,
    ReviewOut,
    UserOut,
)
from .seed import seed
from .services import (
    booked_ranges,
    filter_listings,
    listing_is_available,
    load_listing,
    service_fee_for,
    to_card,
)

Base.metadata.create_all(bind=engine)
_db = SessionLocal()
try:
    seed(_db)
finally:
    _db.close()

app = FastAPI(title="Stay API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATEGORIES = [
    "Beach",
    "Cabins",
    "Amazing views",
    "Tiny homes",
    "Countryside",
    "Tropical",
    "Design",
    "Lakes",
    "Skiing",
    "Cities",
]


@app.get("/health")
def health():
    return {"ok": True}


@app.get("/meta/categories")
def categories():
    return CATEGORIES


@app.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.scalars(select(User).order_by(User.id)).all()


@app.post("/auth/login", response_model=UserOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user:
        raise HTTPException(status_code=404, detail="No demo account with that email")
    return user


@app.get("/auth/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@app.get("/listings", response_model=PageOut)
def list_listings(
    location: str | None = None,
    check_in: date | None = None,
    check_out: date | None = None,
    guests: int | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    property_type: str | None = None,
    category: str | None = None,
    amenities: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=48),
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    return filter_listings(
        db,
        location=location,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        min_price=min_price,
        max_price=max_price,
        property_type=property_type,
        category=category,
        amenities=amenities,
        page=page,
        page_size=page_size,
        user=user,
    )


@app.get("/listings/{listing_id}", response_model=ListingDetailOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_optional_user),
):
    listing = load_listing(db, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    card = to_card(db, listing, user)
    return {
        **card,
        "description": listing.description,
        "address": listing.address,
        "cleaning_fee": listing.cleaning_fee,
        "service_fee": listing.service_fee,
        "bedrooms": listing.bedrooms,
        "beds": listing.beds,
        "bathrooms": listing.bathrooms,
        "amenities": [a for a in listing.amenities.split(",") if a],
        "photos": listing.photos,
        "host": listing.host,
        "reviews": listing.reviews,
        "booked_ranges": booked_ranges(db, listing.id),
    }


@app.post("/listings", response_model=ListingCardOut)
def create_listing(
    payload: ListingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not user.is_host:
        user.is_host = True
    photos = payload.photos or [
        "https://images.unsplash.com/photo-1505691938895-1758d7afb15f?w=1600"
    ]
    listing = Listing(
        host_id=user.id,
        title=payload.title,
        description=payload.description,
        city=payload.city,
        country=payload.country,
        address=payload.address,
        lat=payload.lat,
        lng=payload.lng,
        price_per_night=payload.price_per_night,
        cleaning_fee=payload.cleaning_fee,
        property_type=payload.property_type,
        category=payload.category,
        guests=payload.guests,
        bedrooms=payload.bedrooms,
        beds=payload.beds,
        bathrooms=payload.bathrooms,
        amenities=",".join(payload.amenities),
        cover_image=photos[0],
    )
    db.add(listing)
    db.flush()
    for i, url in enumerate(photos):
        db.add(ListingPhoto(listing_id=listing.id, url=url, sort_order=i))
    db.commit()
    listing = load_listing(db, listing.id)
    return to_card(db, listing, user)


@app.put("/listings/{listing_id}", response_model=ListingCardOut)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="You can only edit your listings")
    data = payload.model_dump(exclude_unset=True)
    photos = data.pop("photos", None)
    amenities = data.pop("amenities", None)
    for key, value in data.items():
        setattr(listing, key, value)
    if amenities is not None:
        listing.amenities = ",".join(amenities)
    if photos is not None:
        listing.photos.clear()
        db.flush()
        for i, url in enumerate(photos):
            db.add(ListingPhoto(listing_id=listing.id, url=url, sort_order=i))
        if photos:
            listing.cover_image = photos[0]
    db.commit()
    listing = load_listing(db, listing.id)
    return to_card(db, listing, user)


@app.delete("/listings/{listing_id}")
def delete_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.host_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your listings")
    db.delete(listing)
    db.commit()
    return {"ok": True}


@app.post("/bookings", response_model=BookingOut)
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    listing = load_listing(db, payload.listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if payload.check_out <= payload.check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
    if payload.guests > listing.guests:
        raise HTTPException(status_code=400, detail="Too many guests for this home")
    if not listing_is_available(db, listing.id, payload.check_in, payload.check_out):
        raise HTTPException(status_code=409, detail="Those dates are unavailable")
    nights = (payload.check_out - payload.check_in).days
    subtotal = nights * listing.price_per_night
    service_fee = service_fee_for(nights, listing.price_per_night)
    booking = Booking(
        listing_id=listing.id,
        guest_id=user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nights=nights,
        subtotal=subtotal,
        cleaning_fee=listing.cleaning_fee,
        service_fee=service_fee,
        total=subtotal + listing.cleaning_fee + service_fee,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    booking.listing = listing
    booking.guest = user
    return _booking_out(db, booking, user)


def _booking_out(db: Session, booking: Booking, user: User | None) -> dict:
    return {
        "id": booking.id,
        "listing_id": booking.listing_id,
        "guest_id": booking.guest_id,
        "check_in": booking.check_in,
        "check_out": booking.check_out,
        "guests": booking.guests,
        "nights": booking.nights,
        "subtotal": booking.subtotal,
        "cleaning_fee": booking.cleaning_fee,
        "service_fee": booking.service_fee,
        "total": booking.total,
        "status": booking.status,
        "created_at": booking.created_at,
        "listing": to_card(db, booking.listing, user),
        "guest": booking.guest,
    }


@app.get("/trips", response_model=list[BookingOut])
def my_trips(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bookings = db.scalars(
        select(Booking)
        .options(selectinload(Booking.listing).selectinload(Listing.host), selectinload(Booking.guest))
        .where(Booking.guest_id == user.id)
        .order_by(Booking.check_in.desc())
    ).all()
    return [_booking_out(db, b, user) for b in bookings]


@app.get("/host/listings", response_model=list[ListingCardOut])
def host_listings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listings = db.scalars(
        select(Listing).options(selectinload(Listing.host)).where(Listing.host_id == user.id)
    ).all()
    return [to_card(db, l, user) for l in listings]


@app.get("/host/bookings", response_model=list[BookingOut])
def host_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bookings = db.scalars(
        select(Booking)
        .join(Listing)
        .options(selectinload(Booking.listing).selectinload(Listing.host), selectinload(Booking.guest))
        .where(Listing.host_id == user.id)
        .order_by(Booking.check_in.desc())
    ).all()
    return [_booking_out(db, b, user) for b in bookings]


@app.post("/wishlists/{listing_id}")
def toggle_wishlist(
    listing_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    listing = db.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    existing = db.scalar(
        select(Wishlist).where(Wishlist.user_id == user.id, Wishlist.listing_id == listing_id)
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"wishlisted": False}
    db.add(Wishlist(user_id=user.id, listing_id=listing_id))
    db.commit()
    return {"wishlisted": True}


@app.get("/wishlists", response_model=list[ListingCardOut])
def my_wishlists(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(Wishlist)
        .options(selectinload(Wishlist.listing).selectinload(Listing.host))
        .where(Wishlist.user_id == user.id)
    ).all()
    return [to_card(db, row.listing, user) for row in rows]


@app.post("/reviews", response_model=ReviewOut)
def create_review(
    payload: ReviewCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    stay = db.scalar(
        select(Booking).where(
            Booking.listing_id == payload.listing_id,
            Booking.guest_id == user.id,
            Booking.status.in_(["completed", "confirmed"]),
        )
    )
    if not stay:
        raise HTTPException(status_code=400, detail="You can review after booking a stay")
    review = Review(
        listing_id=payload.listing_id,
        user_id=user.id,
        rating=payload.rating,
        comment=payload.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    review.author = user
    return review
