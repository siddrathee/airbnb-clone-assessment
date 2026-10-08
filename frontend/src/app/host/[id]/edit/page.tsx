"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ListingDetail } from "@/lib/types";
import { ListingForm } from "@/components/ListingForm";

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  useEffect(() => {
    api.listing(Number(id)).then(setListing);
  }, [id]);
  if (!listing) return <p className="coming">Loading…</p>;
  return <ListingForm listing={listing} />;
}
