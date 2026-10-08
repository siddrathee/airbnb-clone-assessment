from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from .models import Booking, Listing, Review, User, Wishlist


def listing_rating(db: Session, listing_id: int) -> tuple[float, int]:
    row = db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.listing_id == listing_id)
    ).one()
    avg, count = row
    return (round(float(avg), 2) if avg else 0.0, int(count or 0))


def dates_overlap(a_start: date, a_end: date, b_start: date, b_end: date) -> bool:
    return a_start < b_end and a_end > b_start


def listing_is_available(db: Session, listing_id: int, check_in: date, check_out: date) -> bool:
    if check_out <= check_in:
        return False
    bookings = db.scalars(
        select(Booking).where(
            Booking.listing_id == listing_id,
            Booking.status != "cancelled",
        )
    ).all()
    return not any(dates_overlap(check_in, check_out, b.check_in, b.check_out) for b in bookings)


def booked_ranges(db: Session, listing_id: int) -> list[dict]:
    bookings = db.scalars(
        select(Booking).where(Booking.listing_id == listing_id, Booking.status != "cancelled")
    ).all()
    return [{"check_in": b.check_in.isoformat(), "check_out": b.check_out.isoformat()} for b in bookings]


def to_card(db: Session, listing: Listing, user: User | None) -> dict:
    rating, count = listing_rating(db, listing.id)
    wishlisted = False
    if user:
        wishlisted = (
            db.scalar(
                select(Wishlist.id).where(
                    Wishlist.user_id == user.id, Wishlist.listing_id == listing.id
                )
            )
            is not None
        )
    return {
        "id": listing.id,
        "title": listing.title,
        "city": listing.city,
        "country": listing.country,
        "price_per_night": listing.price_per_night,
        "cover_image": listing.cover_image,
        "category": listing.category,
        "property_type": listing.property_type,
        "guests": listing.guests,
        "lat": listing.lat,
        "lng": listing.lng,
        "rating": rating,
        "review_count": count,
        "is_superhost": listing.host.is_superhost if listing.host else False,
        "wishlisted": wishlisted,
    }


def load_listing(db: Session, listing_id: int) -> Listing | None:
    return db.scalar(
        select(Listing)
        .options(
            selectinload(Listing.photos),
            selectinload(Listing.host),
            selectinload(Listing.reviews).selectinload(Review.author),
        )
        .where(Listing.id == listing_id)
    )


def service_fee_for(nights: int, nightly: int) -> int:
    return max(15, round(nights * nightly * 0.14))


def filter_listings(
    db: Session,
    *,
    location: str | None,
    check_in: date | None,
    check_out: date | None,
    guests: int | None,
    min_price: int | None,
    max_price: int | None,
    property_type: str | None,
    category: str | None,
    amenities: str | None,
    page: int,
    page_size: int,
    user: User | None,
):
    stmt = select(Listing).options(selectinload(Listing.host))
    if location:
        loc = f"%{location.strip()}%"
        stmt = stmt.where(
            or_(
                Listing.city.ilike(loc),
                Listing.country.ilike(loc),
                Listing.title.ilike(loc),
                Listing.address.ilike(loc),
            )
        )
    if guests:
        stmt = stmt.where(Listing.guests >= guests)
    if min_price is not None:
        stmt = stmt.where(Listing.price_per_night >= min_price)
    if max_price is not None:
        stmt = stmt.where(Listing.price_per_night <= max_price)
    if property_type:
        stmt = stmt.where(Listing.property_type == property_type)
    if category:
        stmt = stmt.where(Listing.category == category)
    if amenities:
        for amenity in [a.strip() for a in amenities.split(",") if a.strip()]:
            stmt = stmt.where(Listing.amenities.ilike(f"%{amenity}%"))

    listings = db.scalars(stmt.order_by(Listing.id)).all()

    if check_in and check_out:
        listings = [l for l in listings if listing_is_available(db, l.id, check_in, check_out)]

    total = len(listings)
    pages = max(1, (total + page_size - 1) // page_size)
    start = (page - 1) * page_size
    page_items = listings[start : start + page_size]
    return {
        "items": [to_card(db, l, user) for l in page_items],
        "page": page,
        "page_size": page_size,
        "total": total,
        "pages": pages,
    }
