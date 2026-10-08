"use client";

import Link from "next/link";
import type { ListingCard as Card } from "@/lib/types";
import { money } from "@/lib/format";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { useState } from "react";

export function ListingCard({ listing }: { listing: Card }) {
  const { user } = useAuth();
  const toast = useToast();
  const [wish, setWish] = useState(listing.wishlisted);

  return (
    <article className="card">
      <Link href={`/rooms/${listing.id}`} className="card-media">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={listing.cover_image} alt={listing.title} />
        {listing.is_superhost ? <span className="badge">Guest favorite</span> : null}
        <button
          className="heart"
          aria-label="Save"
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!user) {
              toast("Log in to save homes");
              return;
            }
            const res = await api.toggleWish(listing.id);
            setWish(res.wishlisted);
            toast(res.wishlisted ? "Saved to wishlist" : "Removed from wishlist");
          }}
        >
          <svg width="24" height="24" viewBox="0 0 32 32">
            <path
              d="M16 28s-10-6.8-10-14a6 6 0 0 1 10-4 6 6 0 0 1 10 4c0 7.2-10 14-10 14z"
              fill={wish ? "#ff385c" : "rgba(0,0,0,.5)"}
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
        </button>
      </Link>
      <Link href={`/rooms/${listing.id}`}>
        <div className="card-row">
          <span className="card-title">
            {listing.city}, {listing.country}
          </span>
          <span className="star">
            ★ {listing.rating ? listing.rating.toFixed(2) : "New"}
          </span>
        </div>
        <div className="muted">{listing.title}</div>
        <div>
          <strong>{money(listing.price_per_night)}</strong> <span className="muted">night</span>
        </div>
      </Link>
    </article>
  );
}
