import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h4>Support</h4>
          <Link href="/verify">Help Center</Link>
          <Link href="/messages">AirCover</Link>
          <p>Anti-discrimination</p>
          <p>Disability support</p>
        </div>
        <div>
          <h4>Hosting</h4>
          <Link href="/host">Airbnb your home</Link>
          <Link href="/host/new">Create a listing</Link>
          <p>Hosting resources</p>
        </div>
        <div>
          <h4>Stay</h4>
          <p>Newsroom</p>
          <p>Careers</p>
          <p>Investors</p>
        </div>
        <div>
          <h4>Placeholder</h4>
          <Link href="/messages">Messaging — coming soon</Link>
          <Link href="/verify">Identity verification — coming soon</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Stay, Inc. · Privacy · Terms · Sitemap</span>
        <span>English (US) · USD</span>
      </div>
    </footer>
  );
}
