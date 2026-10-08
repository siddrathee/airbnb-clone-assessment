export type User = {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  is_host: boolean;
  is_superhost: boolean;
  bio: string;
  joined_year: number;
};

export type Photo = { id: number; url: string; sort_order: number };

export type Review = {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: User;
};

export type ListingCard = {
  id: number;
  title: string;
  city: string;
  country: string;
  price_per_night: number;
  cover_image: string;
  category: string;
  property_type: string;
  guests: number;
  lat: number;
  lng: number;
  rating: number;
  review_count: number;
  is_superhost: boolean;
  wishlisted: boolean;
};

export type ListingDetail = ListingCard & {
  description: string;
  address: string;
  cleaning_fee: number;
  service_fee: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  photos: Photo[];
  host: User;
  reviews: Review[];
  booked_ranges: { check_in: string; check_out: string }[];
};

export type PageResult = {
  items: ListingCard[];
  page: number;
  page_size: number;
  total: number;
  pages: number;
};

export type Booking = {
  id: number;
  listing_id: number;
  guest_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  nights: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total: number;
  status: string;
  created_at: string;
  listing: ListingCard;
  guest: User;
};

export type SearchParams = {
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
  min_price?: string;
  max_price?: string;
  property_type?: string;
  category?: string;
  amenities?: string;
  page?: string;
};
