"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { useToast } from "@/lib/toast";
import type { ListingDetail } from "@/lib/types";

const empty = {
  title: "",
  description: "",
  city: "",
  country: "",
  address: "",
  lat: 0,
  lng: 0,
  price_per_night: 120,
  cleaning_fee: 40,
  property_type: "Entire home",
  category: "Cities",
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: "Wifi,Kitchen,Washer",
  photos: "",
};

export function ListingForm({ listing }: { listing?: ListingDetail }) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState(
    listing
      ? {
          title: listing.title,
          description: listing.description,
          city: listing.city,
          country: listing.country,
          address: listing.address,
          lat: listing.lat,
          lng: listing.lng,
          price_per_night: listing.price_per_night,
          cleaning_fee: listing.cleaning_fee,
          property_type: listing.property_type,
          category: listing.category,
          guests: listing.guests,
          bedrooms: listing.bedrooms,
          beds: listing.beds,
          bathrooms: listing.bathrooms,
          amenities: listing.amenities.join(","),
          photos: listing.photos.map((p) => p.url).join("\n"),
        }
      : empty
  );
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        urls.push(dataUrl);
      }
      setForm((f) => ({ ...f, photos: [...f.photos.split("\n").filter(Boolean), ...urls].join("\n") }));
      toast("Images added");
    } catch (err) {
      toast("Failed to add images");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setBusy(true);
    const body = {
      ...form,
      amenities: form.amenities.split(",").map((s) => s.trim()).filter(Boolean),
      photos: form.photos.split("\n").map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (listing) {
        await api.updateListing(listing.id, body);
        toast("Listing updated");
        router.push("/host");
      } else {
        await api.createListing(body);
        toast("Listing published");
        router.push("/host");
      }
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 720, paddingBottom: 80 }}>
      <h1 className="page-title">{listing ? "Edit listing" : "Create a listing"}</h1>
      <div className="modal-body" style={{ padding: 0 }}>
        {(
          [
            ["title", "Title"],
            ["city", "City"],
            ["country", "Country"],
            ["address", "Neighborhood / address"],
          ] as const
        ).map(([k, label]) => (
          <label className="field" key={k}>
            {label}
            <input value={form[k]} onChange={(e) => set(k, e.target.value)} />
          </label>
        ))}
        <label className="field">
          Description
          <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </label>
        <label className="field">
          Category
          <select value={form.category} onChange={(e) => set("category", e.target.value)}>
            {["Beach", "Cabins", "Amazing views", "Tiny homes", "Countryside", "Tropical", "Design", "Lakes", "Skiing", "Cities"].map(
              (c) => (
                <option key={c}>{c}</option>
              )
            )}
          </select>
        </label>
        <label className="field">
          Property type
          <select value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
            <option>Entire home</option>
            <option>Private room</option>
            <option>Shared room</option>
          </select>
        </label>
        <label className="field">
          Price per night
          <input type="number" value={form.price_per_night} onChange={(e) => set("price_per_night", Number(e.target.value))} />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
          <label className="field">
            Guests
            <input type="number" value={form.guests} onChange={(e) => set("guests", Number(e.target.value))} />
          </label>
          <label className="field">
            Bedrooms
            <input type="number" value={form.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} />
          </label>
          <label className="field">
            Beds
            <input type="number" value={form.beds} onChange={(e) => set("beds", Number(e.target.value))} />
          </label>
          <label className="field">
            Baths
            <input type="number" value={form.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
          </label>
        </div>
        <label className="field">
          Amenities (comma separated)
          <input value={form.amenities} onChange={(e) => set("amenities", e.target.value)} />
        </label>
        <label className="field">
          Photo URLs (one per line)
          <textarea rows={4} value={form.photos} onChange={(e) => set("photos", e.target.value)} />
        </label>
        <label className="field">
          Upload images
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            disabled={uploading}
          />
          {uploading && <span className="muted">Uploading...</span>}
        </label>
        <button className="btn-airbnb" disabled={busy} onClick={save}>
          {listing ? "Save" : "Publish"}
        </button>
      </div>
    </div>
  );
}
