"use client";

import { useState } from "react";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function inRange(day: string, ranges: { check_in: string; check_out: string }[]) {
  return ranges.some((r) => day >= r.check_in && day < r.check_out);
}

export function Calendar({
  booked,
  checkIn,
  checkOut,
  onPick,
}: {
  booked: { check_in: string; check_out: string }[];
  checkIn: string;
  checkOut: string;
  onPick: (start: string, end: string) => void;
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array.from({ length: startPad }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(year, month, i + 1)),
  ];

  const click = (d: Date) => {
    const day = iso(d);
    if (inRange(day, booked)) return;
    if (!checkIn || (checkIn && checkOut) || day <= checkIn) onPick(day, "");
    else onPick(checkIn, day);
  };

  return (
    <div>
      <div className="card-row" style={{ margin: "16px 0" }}>
        <h3>
          {cursor.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div>
          <button className="filter-btn" onClick={() => setCursor(new Date(year, month - 1, 1))}>
            ‹
          </button>{" "}
          <button className="filter-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}>
            ›
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, maxWidth: 420 }}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={`${d}${i}`} className="muted" style={{ textAlign: "center", fontSize: 12 }}>
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const day = iso(d);
          const blocked = inRange(day, booked);
          const selected = day === checkIn || day === checkOut || (checkIn && checkOut && day > checkIn && day < checkOut);
          return (
            <button
              key={day}
              disabled={blocked}
              onClick={() => click(d)}
              style={{
                height: 40,
                borderRadius: 20,
                border: 0,
                cursor: blocked ? "not-allowed" : "pointer",
                background: selected ? "#222" : "transparent",
                color: blocked ? "#ddd" : selected ? "#fff" : "#222",
                textDecoration: blocked ? "line-through" : "none",
              }}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
