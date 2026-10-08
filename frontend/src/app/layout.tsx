import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Stay · Vacation rentals, cabins, beach houses & more",
  description: "Airbnb-style marketplace for browsing, booking, and hosting homes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Suspense fallback={<header className="header" />}>
            <Header />
          </Suspense>
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
