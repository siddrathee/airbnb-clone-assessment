"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const CATS = [
  ["Cities", "🏙️"],
  ["Beach", "🏖️"],
  ["Cabins", "🌲"],
  ["Amazing views", "🏞️"],
  ["Tiny homes", "🏠"],
  ["Countryside", "🌾"],
  ["Tropical", "🌴"],
  ["Design", "🛋️"],
  ["Lakes", "💧"],
  ["Skiing", "⛷️"],
];

export function Filters() {
  const params = useSearchParams();
  const router = useRouter();
  const selected = params.get("category") || "";
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(params.get("min_price") || "");
  const [max, setMax] = useState(params.get("max_price") || "");
  const [type, setType] = useState(params.get("property_type") || "");
  const [amenities, setAmenities] = useState(params.get("amenities") || "");

  const setCat = (cat: string) => {
    const q = new URLSearchParams(params.toString());
    if (selected === cat) q.delete("category");
    else q.set("category", cat);
    q.delete("page");
    router.push(`/?${q.toString()}`);
  };

  const apply = () => {
    const q = new URLSearchParams(params.toString());
    if (min) q.set("min_price", min);
    else q.delete("min_price");
    if (max) q.set("max_price", max);
    else q.delete("max_price");
    if (type) q.set("property_type", type);
    else q.delete("property_type");
    if (amenities) q.set("amenities", amenities);
    else q.delete("amenities");
    q.delete("page");
    router.push(`/?${q.toString()}`);
    setOpen(false);
  };

  return (
    <>
      <div className="container cats">
        {CATS.map(([name, icon]) => (
          <button
            key={name}
            className={selected === name ? "cat active" : "cat"}
            onClick={() => setCat(name)}
          >
            <span>{icon}</span>
            {name}
          </button>
        ))}
        <button className="filter-btn" onClick={() => setOpen(true)}>
          Filters
        </button>
      </div>
      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Filters</h2>
            <div className="modal-body">
              <label className="field">
                Min price
                <input value={min} onChange={(e) => setMin(e.target.value)} type="number" />
              </label>
              <label className="field">
                Max price
                <input value={max} onChange={(e) => setMax(e.target.value)} type="number" />
              </label>
              <label className="field">
                Property type
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="">Any</option>
                  <option>Entire home</option>
                  <option>Private room</option>
                  <option>Shared room</option>
                </select>
              </label>
              <label className="field">
                Amenities (comma separated)
                <input
                  value={amenities}
                  onChange={(e) => setAmenities(e.target.value)}
                  placeholder="Wifi, Pool, Kitchen"
                />
              </label>
              <button className="btn-airbnb" onClick={apply}>
                Show homes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
