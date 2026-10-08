import type {
  Booking,
  ListingCard,
  ListingDetail,
  PageResult,
  SearchParams,
  User,
} from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function headers(extra?: HeadersInit): HeadersInit {
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("stay_user_id") : null;
  return {
    "Content-Type": "application/json",
    ...(userId ? { "X-User-Id": userId } : {}),
    ...extra,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: headers(init?.headers),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = "Something went wrong";
    try {
      const body = await res.json();
      message = body.detail || message;
    } catch {
      /* ignore */
    }
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return res.json();
}

export function queryString(params: SearchParams) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const api = {
  users: () => request<User[]>("/users"),
  login: (email: string) =>
    request<User>("/auth/login", { method: "POST", body: JSON.stringify({ email }) }),
  listings: (params: SearchParams) =>
    request<PageResult>(`/listings${queryString(params)}`),
  listing: (id: number) => request<ListingDetail>(`/listings/${id}`),
  createListing: (body: unknown) =>
    request<ListingCard>("/listings", { method: "POST", body: JSON.stringify(body) }),
  updateListing: (id: number, body: unknown) =>
    request<ListingCard>(`/listings/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteListing: (id: number) =>
    request<{ ok: boolean }>(`/listings/${id}`, { method: "DELETE" }),
  book: (body: unknown) =>
    request<Booking>("/bookings", { method: "POST", body: JSON.stringify(body) }),
  trips: () => request<Booking[]>("/trips"),
  hostListings: () => request<ListingCard[]>("/host/listings"),
  hostBookings: () => request<Booking[]>("/host/bookings"),
  toggleWish: (id: number) =>
    request<{ wishlisted: boolean }>(`/wishlists/${id}`, { method: "POST" }),
  wishes: () => request<ListingCard[]>("/wishlists"),
  review: (body: unknown) =>
    request("/reviews", { method: "POST", body: JSON.stringify(body) }),
  categories: () => request<string[]>("/meta/categories"),
};
