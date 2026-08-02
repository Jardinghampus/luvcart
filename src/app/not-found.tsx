import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function NotFound() {
  return (
    <AppShell title="404" pathLabel="C:\\LUVCART\\ERROR" showNav>
      <section className="lc-hero-card">
        <p className="lc-kicker">FILE NOT FOUND</p>
        <h1>oopsie 💔</h1>
        <p>This window doesn&apos;t exist on the Luvcart drive.</p>
        <div className="lc-cta-grid">
          <Link className="lc-cta is-primary" href="/">
            back to desktop 🏠
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
