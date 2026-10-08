"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";
import { money, nightsBetween, prettyDate, serviceFee } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { LoginModal } from "@/components/LoginModal";
import { Calendar } from "@/components/Calendar";

export default function RoomPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [login, setLogin] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.listing(Number(id)).then(setListing).catch((e) => toast(e.message));
  }, [id, toast]);

  const nights = nightsBetween(checkIn, checkOut);
  const totals = useMemo(() => {
    if (!listing || !nights) return null;
    const subtotal = nights * listing.price_per_night;
    const fee = serviceFee(nights, listing.price_per_night);
    return {
      subtotal,
      cleaning: listing.cleaning_fee,
      fee,
      total: subtotal + listing.cleaning_fee + fee,
    };
  }, [listing, nights]);

  if (!listing) return <p className="coming">Loading listing…</p>;

  const reserve = async () => {
    if (!user) {
      setLogin(true);
      return;
    }
    if (!checkIn || !checkOut) {
      toast("Choose check-in and check-out dates");
      return;
    }
    setBusy(true);
    try {
      const booking = await api.book({
        listing_id: listing.id,
        check_in: checkIn,
        check_out: checkOut,
        guests,
      });
      router.push(`/checkout/${booking.id}`);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h1 style={{ fontSize: 26 }}>{listing.title}</h1>
      <div className="card-row" style={{ marginTop: 8 }}>
        <span>
          ★ {listing.rating.toFixed(2)} · {listing.review_count} reviews · {listing.city},{" "}
          {listing.country}
        </span>
        {listing.is_superhost ? <span className="muted">Superhost</span> : null}
      </div>
      <div className="gallery">
        {(listing.photos.length ? listing.photos.map((p) => p.url) : [listing.cover_image])
          .slice(0, 5)
          .map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={url} src={url} alt="" />
          ))}
      </div>
      <div className="detail">
        <div>
          <h2>
            {listing.property_type} in {listing.city}
          </h2>
          <p className="muted">
            {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds ·{" "}
            {listing.bathrooms} baths
          </p>
          <div className="host-row">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="avatar" src={listing.host.avatar_url} alt="" style={{ width: 48, height: 48 }} />
            <div>
              <strong>Hosted by {listing.host.name}</strong>
              <div className="muted">
                {listing.host.is_superhost ? "Superhost · " : ""}Joined in {listing.host.joined_year}
              </div>
              <p style={{ marginTop: 8 }}>{listing.host.bio}</p>
            </div>
          </div>
          <p style={{ padding: "24px 0", whiteSpace: "pre-wrap" }}>{listing.description}</p>
          <h3>What this place offers</h3>
          <div className="amenity-grid">
            {listing.amenities.map((a) => (
              <div key={a}>{a}</div>
            ))}
          </div>
          <h3>Where you’ll be</h3>
          <p className="muted">{listing.address}</p>
          <div className="map-wrap">
            <iframe
              title="Map"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.04}%2C${listing.lat - 0.03}%2C${listing.lng + 0.04}%2C${listing.lat + 0.03}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
            />
          </div>
          <Calendar
            booked={listing.booked_ranges}
            checkIn={checkIn}
            checkOut={checkOut}
            onPick={(start, end) => {
              setCheckIn(start);
              setCheckOut(end);
            }}
          />
          <h2 style={{ marginTop: 32 }}>
            ★ {listing.rating.toFixed(2)} · {listing.review_count} reviews
          </h2>
          <div className="reviews">
            {listing.reviews.map((r) => (
              <article key={r.id}>
                <div className="review-head">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="avatar" src={r.author.avatar_url} alt="" />
                  <div>
                    <strong>{r.author.name}</strong>
                    <div className="muted">{prettyDate(r.created_at.slice(0, 10))}</div>
                  </div>
                </div>
                <p>{r.comment}</p>
              </article>
            ))}
          </div>
        </div>
        <aside>
          <div className="reserve">
            <div>
              <span className="price-lg">
                <strong>{money(listing.price_per_night)}</strong>
              </span>{" "}
              <span className="muted">night</span>
            </div>
            <div className="reserve-dates">
              <label>
                Check-in
                <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>
              <label style={{ borderLeft: "1px solid #222" }}>
                Checkout
                <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </label>
            </div>
            <div className="guests-box">
              <label>
                Guests
                <input
                  type="number"
                  min={1}
                  max={listing.guests}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                />
              </label>
            </div>
            <button className="btn-airbnb" disabled={busy} onClick={reserve}>
              Reserve
            </button>
            <p className="muted" style={{ textAlign: "center", marginTop: 8, fontSize: 13 }}>
              You won’t be charged yet
            </p>
            {totals ? (
              <div className="breakdown">
                <div className="row">
                  <span>
                    {money(listing.price_per_night)} x {nights} nights
                  </span>
                  <span>{money(totals.subtotal)}</span>
                </div>
                <div className="row">
                  <span>Cleaning fee</span>
                  <span>{money(totals.cleaning)}</span>
                </div>
                <div className="row">
                  <span>Stay service fee</span>
                  <span>{money(totals.fee)}</span>
                </div>
                <div className="row total">
                  <span>Total</span>
                  <span>{money(totals.total)}</span>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
      {login ? <LoginModal onClose={() => setLogin(false)} /> : null}
    </div>
  );
}
