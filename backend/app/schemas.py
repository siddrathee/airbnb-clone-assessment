from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    avatar_url: str
    is_host: bool
    is_superhost: bool
    bio: str
    joined_year: int

    class Config:
        from_attributes = True


class LoginIn(BaseModel):
    email: EmailStr


class PhotoOut(BaseModel):
    id: int
    url: str
    sort_order: int

    class Config:
        from_attributes = True


class ReviewOut(BaseModel):
    id: int
    rating: float
    comment: str
    created_at: datetime
    author: UserOut

    class Config:
        from_attributes = True


class ListingCardOut(BaseModel):
    id: int
    title: str
    city: str
    country: str
    price_per_night: int
    cover_image: str
    category: str
    property_type: str
    guests: int
    lat: float
    lng: float
    rating: float
    review_count: int
    is_superhost: bool
    wishlisted: bool = False

    class Config:
        from_attributes = True


class ListingDetailOut(ListingCardOut):
    description: str
    address: str
    cleaning_fee: int
    service_fee: int
    bedrooms: int
    beds: int
    bathrooms: float
    amenities: list[str]
    photos: list[PhotoOut]
    host: UserOut
    reviews: list[ReviewOut]
    booked_ranges: list[dict]


class ListingCreate(BaseModel):
    title: str
    description: str
    city: str
    country: str
    address: str = ""
    lat: float = 0
    lng: float = 0
    price_per_night: int = Field(gt=0)
    cleaning_fee: int = 45
    property_type: str
    category: str
    guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: float = 1
    amenities: list[str] = []
    photos: list[str] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    address: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    price_per_night: Optional[int] = None
    cleaning_fee: Optional[int] = None
    property_type: Optional[str] = None
    category: Optional[str] = None
    guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    amenities: Optional[list[str]] = None
    photos: Optional[list[str]] = None


class BookingCreate(BaseModel):
    listing_id: int
    check_in: date
    check_out: date
    guests: int = Field(ge=1)


class BookingOut(BaseModel):
    id: int
    listing_id: int
    guest_id: int
    check_in: date
    check_out: date
    guests: int
    nights: int
    subtotal: int
    cleaning_fee: int
    service_fee: int
    total: int
    status: str
    created_at: datetime
    listing: ListingCardOut
    guest: UserOut

    class Config:
        from_attributes = True


class ReviewCreate(BaseModel):
    listing_id: int
    rating: float = Field(ge=1, le=5)
    comment: str


class PageOut(BaseModel):
    items: list[ListingCardOut]
    page: int
    page_size: int
    total: int
    pages: int
