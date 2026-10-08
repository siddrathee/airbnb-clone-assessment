"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ListingCard as Card } from "@/lib/types";
import { ListingCard } from "@/components/ListingCard";
import { useAuth } from "@/lib/auth";
import { LoginModal } from "@/components/LoginModal";

export default function WishlistsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Card[]>([]);
  const [login, setLogin] = useState(false);

  useEffect(() => {
    if (!user) return;
    api.wishes().then(setItems);
  }, [user]);

  if (!user) {
    return (
      <div className="container coming">
        <h1>Wishlists</h1>
        <button className="btn-airbnb" style={{ maxWidth: 280, margin: "16px auto" }} onClick={() => setLogin(true)}>
          Log in
        </button>
        {login ? <LoginModal onClose={() => setLogin(false)} /> : null}
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">Wishlists</h1>
      <div className="grid">
        {items.map((l) => (
          <ListingCard key={l.id} listing={{ ...l, wishlisted: true }} />
        ))}
      </div>
      {items.length === 0 ? <p className="muted">Tap the heart on a home to save it here.</p> : null}
    </div>
  );
}
