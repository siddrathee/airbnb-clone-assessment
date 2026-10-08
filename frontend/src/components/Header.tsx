"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Logo } from "./Logo";
import { LoginModal } from "./LoginModal";

export function Header() {
  const pathname = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const showSearch = pathname === "/" || pathname.startsWith("/search");

  const [location, setLocation] = useState(params.get("location") || "");
  const [checkIn, setCheckIn] = useState(params.get("check_in") || "");
  const [checkOut, setCheckOut] = useState(params.get("check_out") || "");
  const [guests, setGuests] = useState(params.get("guests") || "1");

  const search = () => {
    const q = new URLSearchParams();
    if (location) q.set("location", location);
    if (checkIn) q.set("check_in", checkIn);
    if (checkOut) q.set("check_out", checkOut);
    if (guests) q.set("guests", guests);
    router.push(`/?${q.toString()}`);
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/">
          <Logo />
        </Link>
        {showSearch ? (
          <form
            className="search-pill"
            onSubmit={(e) => {
              e.preventDefault();
              search();
            }}
          >
            <div className="search-field">
              <label>Where</label>
              <input
                placeholder="Search destinations"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <div className="search-split" />
            <div className="search-field">
              <label>Check in</label>
              <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
            <div className="search-split" />
            <div className="search-field">
              <label>Check out</label>
              <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
            <div className="search-split" />
            <div className="search-field">
              <label>Who</label>
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
            <button className="search-go" aria-label="Search" type="submit">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <circle cx="14" cy="14" r="9" stroke="white" strokeWidth="3" />
                <path d="M21 21l7 7" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        ) : (
          <div />
        )}
        <div className="header-right">
          <Link className="host-link" href="/host">
            Airbnb your home
          </Link>
          <div style={{ position: "relative" }}>
            <button className="avatar-btn" onClick={() => setMenu((v) => !v)}>
              <svg width="16" height="16" viewBox="0 0 32 32">
                <path d="M4 10h24M4 16h24M4 22h24" stroke="#222" strokeWidth="3" />
              </svg>
              {user ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="avatar" src={user.avatar_url} alt="" />
              ) : (
                <span className="avatar" />
              )}
            </button>
            {menu ? (
              <div
                className="modal"
                style={{ position: "absolute", right: 0, top: 48, width: 240, zIndex: 50 }}
              >
                <div className="modal-body">
                  {user ? (
                    <>
                      <strong>{user.name}</strong>
                      <Link href="/trips" onClick={() => setMenu(false)}>
                        Trips
                      </Link>
                      <Link href="/wishlists" onClick={() => setMenu(false)}>
                        Wishlists
                      </Link>
                      <Link href="/host" onClick={() => setMenu(false)}>
                        Host dashboard
                      </Link>
                      <Link href="/messages" onClick={() => setMenu(false)}>
                        Messages
                      </Link>
                      <button className="linkish" onClick={() => { logout(); setMenu(false); }}>
                        Log out
                      </button>
                      <button className="linkish" onClick={() => { toggleTheme(); }}>
                        {theme === "light" ? "🌙 Dark mode" : "☀️ Light mode"}
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn-airbnb"
                      onClick={() => {
                        setMenu(false);
                        setOpen(true);
                      }}
                    >
                      Log in
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      {open ? <LoginModal onClose={() => setOpen(false)} /> : null}
    </header>
  );
}
