"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import type { PageResult, SearchParams } from "@/lib/types";
import { Filters } from "@/components/Filters";
import { ListingCard } from "@/components/ListingCard";

const ListingMap = dynamic(() => import("@/components/ListingMap").then((mod) => mod.default), {
  ssr: false,
  loading: () => <div style={{ height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading map...</div>,
});

function Explore() {
  const params = useSearchParams();
  const [data, setData] = useState<PageResult | null>(null);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  const query: SearchParams = {
    location: params.get("location") || undefined,
    check_in: params.get("check_in") || undefined,
    check_out: params.get("check_out") || undefined,
    guests: params.get("guests") || undefined,
    min_price: params.get("min_price") || undefined,
    max_price: params.get("max_price") || undefined,
    property_type: params.get("property_type") || undefined,
    category: params.get("category") || undefined,
    amenities: params.get("amenities") || undefined,
    page: params.get("page") || "1",
  };

  useEffect(() => {
    setError("");
    api
      .listings(query)
      .then(setData)
      .catch((e) => setError(e.message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  const goPage = (page: number) => {
    const q = new URLSearchParams(params.toString());
    q.set("page", String(page));
    window.history.pushState(null, "", `/?${q.toString()}`);
    api.listings({ ...query, page: String(page) }).then(setData);
  };

  return (
    <>
      <Filters />
      <div className="container">
        <div className="card-row" style={{ padding: "16px 0" }}>
          <button
            className="filter-btn"
            onClick={() => setShowMap(!showMap)}
            style={{ width: "auto", padding: "12px 20px" }}
          >
            {showMap ? "Show list" : "Show map"}
          </button>
        </div>
        {showMap && data ? (
          <ListingMap
            listings={data.items}
            onListingClick={(id) => {
              const q = new URLSearchParams(params.toString());
              window.location.href = `/rooms/${id}`;
            }}
          />
        ) : null}
        {error ? (
          <p className="coming">
            Could not reach the API at localhost:8000. Start the FastAPI backend, then refresh.
            <br />
            {error}
          </p>
        ) : null}
        {!data && !error ? <p className="coming">Loading stays…</p> : null}
        {data ? (
          <>
            <p className="muted" style={{ paddingTop: 16 }}>
              {data.total} homes
              {query.location ? ` in ${query.location}` : ""}
            </p>
            <div className="grid">
              {data.items.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
            <div className="pager">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === data.page ? "current" : ""}
                  onClick={() => goPage(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className="coming">Loading stays…</p>}>
      <Explore />
    </Suspense>
  );
}
