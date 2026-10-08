"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { money, prettyDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { LoginModal } from "@/components/LoginModal";

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Booking[]>([]);
  const [login, setLogin] = useState(false);
  const [reviewFor, setReviewFor] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!user) return;
    api.trips().then(setTrips).catch(() => setTrips([]));
  }, [user]);

  if (!user) {
    return (
      <div className="container coming">
        <h1>Trips</h1>
        <p>Log in to see upcoming and past stays.</p>
        <button className="btn-airbnb" style={{ maxWidth: 280, margin: "16px auto" }} onClick={() => setLogin(true)}>
          Log in
        </button>
        {login ? <LoginModal onClose={() => setLogin(false)} /> : null}
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Trips</h1>
      <div className="trips">
        {trips.length === 0 ? <p className="muted">No trips yet — find a stay on the home page.</p> : null}
        {trips.map((t) => (
          <Link key={t.id} href={`/rooms/${t.listing_id}`} className="trip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={t.listing.cover_image} alt="" />
            <div className="trip-body">
              <div className="status">{t.status}</div>
              <h3>
                {t.listing.city}, {t.listing.country}
              </h3>
              <p className="muted">{t.listing.title}</p>
              <p>
                {prettyDate(t.check_in)} – {prettyDate(t.check_out)}
              </p>
            </div>
            <strong>{money(t.total)}</strong>
            {t.status === "completed" ? (
              <button
                className="linkish"
                style={{ padding: 16 }}
                onClick={(e) => {
                  e.preventDefault();
                  setReviewFor(t.listing_id);
                }}
              >
                Review
              </button>
            ) : null}
          </Link>
        ))}
        {reviewFor ? (
          <div className="modal-backdrop" onClick={() => setReviewFor(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h2>Leave a review</h2>
              <div className="modal-body">
                <label className="field">
                  Rating
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                  />
                </label>
                <label className="field">
                  Comment
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} />
                </label>
                <button
                  className="btn-airbnb"
                  onClick={async () => {
                    await api.review({ listing_id: reviewFor, rating, comment });
                    setReviewFor(null);
                    setComment("");
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
