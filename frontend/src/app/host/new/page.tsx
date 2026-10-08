"use client";

import { ListingForm } from "@/components/ListingForm";
import { useAuth } from "@/lib/auth";
import { LoginModal } from "@/components/LoginModal";
import { useState } from "react";

export default function NewListingPage() {
  const { user } = useAuth();
  const [login, setLogin] = useState(false);
  if (!user) {
    return (
      <div className="container coming">
        <p>Sign in as a host to publish a home.</p>
        <button className="btn-airbnb" style={{ maxWidth: 280, margin: "16px auto" }} onClick={() => setLogin(true)}>
          Log in
        </button>
        {login ? <LoginModal onClose={() => setLogin(false)} /> : null}
      </div>
    );
  }
  return <ListingForm />;
}
