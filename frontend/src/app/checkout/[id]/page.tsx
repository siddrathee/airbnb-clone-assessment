"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { money, prettyDate } from "@/lib/format";

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    api.trips().then((trips) => {
      setBooking(trips.find((t) => String(t.id) === id) || null);
    });
  }, [id]);

  if (!booking) return <p className="coming">Loading confirmation…</p>;

  return (
    <div className="container" style={{ maxWidth: 720, paddingBottom: 80 }}>
      <h1 className="page-title">Your reservation is confirmed</h1>
      <p className="muted">Payment is mocked for this assignment — no card was charged.</p>
      <div className="trip" style={{ marginTop: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={booking.listing.cover_image} alt="" />
        <div className="trip-body">
          <div className="status">{booking.status}</div>
          <h3>{booking.listing.title}</h3>
          <p>
            {prettyDate(booking.check_in)} – {prettyDate(booking.check_out)} · {booking.nights}{" "}
            nights · {booking.guests} guests
          </p>
          <p>
            {booking.listing.city}, {booking.listing.country}
          </p>
        </div>
        <strong>{money(booking.total)}</strong>
      </div>
      <div className="breakdown" style={{ marginTop: 24 }}>
        <div className="row">
          <span>Nights</span>
          <span>{money(booking.subtotal)}</span>
        </div>
        <div className="row">
          <span>Cleaning</span>
          <span>{money(booking.cleaning_fee)}</span>
        </div>
        <div className="row">
          <span>Service fee</span>
          <span>{money(booking.service_fee)}</span>
        </div>
        <div className="row total">
          <span>Total (USD)</span>
          <span>{money(booking.total)}</span>
        </div>
      </div>
      <p style={{ marginTop: 24 }}>
        <Link href="/trips" className="linkish">
          View trips
        </Link>
      </p>
    </div>
  );
}
