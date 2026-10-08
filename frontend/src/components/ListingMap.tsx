"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Listing = {
  id: number;
  title: string;
  city: string;
  country: string;
  price_per_night: number;
  lat: number;
  lng: number;
  cover_image: string;
};

export default function ListingMap({ listings, onListingClick }: { listings: Listing[]; onListingClick?: (id: number) => void }) {
  const [map, setMap] = useState<L.Map | null>(null);
  const mapId = "listing-map";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mapInstance = L.map(mapId).setView([48.8566, 2.3522], 4);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInstance);

    setMap(mapInstance);

    return () => {
      mapInstance.remove();
    };
  }, []);

  useEffect(() => {
    if (!map) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const icon = L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background: #fff;
        border: 2px solid #222;
        border-radius: 20px;
        padding: 4px 8px;
        font-weight: 600;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        white-space: nowrap;
      ">$$</div>`,
      iconSize: [60, 30],
      iconAnchor: [30, 15],
    });

    listings.forEach((listing) => {
      const marker = L.marker([listing.lat, listing.lng], {
        icon: L.divIcon({
          className: "custom-marker",
          html: `<div style="
            background: #fff;
            border: 2px solid #222;
            border-radius: 20px;
            padding: 4px 8px;
            font-weight: 600;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            white-space: nowrap;
            cursor: pointer;
          ">$${listing.price_per_night}</div>`,
          iconSize: [60, 30],
          iconAnchor: [30, 15],
        }),
      }).addTo(map);

      if (onListingClick) {
        marker.on("click", () => onListingClick(listing.id));
      }
    });

    if (listings.length > 0) {
      const bounds = L.latLngBounds(listings.map((l) => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, listings, onListingClick]);

  return <div id={mapId} style={{ height: "400px", width: "100%", borderRadius: "12px", border: "1px solid #ddd" }} />;
}
