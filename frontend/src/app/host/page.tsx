"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Booking, ListingCard } from "@/lib/types";
import { money, prettyDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/lib/toast";
import { LoginModal } from "@/components/LoginModal";

export default function HostPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [login, setLogin] = useState(false);

  const load = () => {
    api.hostListings().then(setListings);
    api.hostBookings().then(setBookings);
  };

  useEffect(() => {
    if (user) load();
  }, [user]);

  if (!user) {
    return (
      <div className="container coming">
        <h1>Host dashboard</h1>
        <p>Sign in as a host to manage listings and reservations.</p>
        <button className="btn-airbnb" style={{ maxWidth: 280, margin: "16px auto" }} onClick={() => setLogin(true)}>
          Log in
        </button>
        {login ? <LoginModal onClose={() => setLogin(false)} /> : null}
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card-row" style={{ alignItems: "end" }}>
        <h1 className="page-title">Welcome, {user.name.split(" ")[0]}</h1>
        <Link href="/host/new" className="btn-airbnb" style={{ width: "auto", padding: "12px 20px" }}>
          Create listing
        </Link>
      </div>
      <div className="host-dash">
        <section>
          <h2>Your listings</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Home</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link href={`/rooms/${l.id}`}>{l.title}</Link>
                    <div className="muted">
                      {l.city}, {l.country}
                    </div>
                  </td>
                  <td>{money(l.price_per_night)}</td>
                  <td>
                    <Link className="linkish" href={`/host/${l.id}/edit`}>
                      Edit
                    </Link>{" "}
                    <button
                      className="linkish"
                      onClick={async () => {
                        if (!confirm("Delete this listing?")) return;
                        await api.deleteListing(l.id);
                        toast("Listing deleted");
                        load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {listings.length === 0 ? <p className="muted">No listings yet.</p> : null}
        </section>
        <section>
          <h2>Reservations</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Dates</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.guest.name}
                    <div className="muted">{b.listing.title}</div>
                  </td>
                  <td>
                    {prettyDate(b.check_in)} – {prettyDate(b.check_out)}
                  </td>
                  <td>{money(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 ? <p className="muted">No reservations yet.</p> : null}
        </section>
      </div>
    </div>
  );
}
