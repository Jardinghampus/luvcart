"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <AppShell title="Error" pathLabel="C:\\LUVCART\\CRASH" showNav={false}>
      <section className="lc-hero-card">
        <p className="lc-kicker">GENERAL PROTECTION FAULT</p>
        <h1>uh-oh 🥺</h1>
        <p>Something glitched in the pink machine. Try again?</p>
        <div className="lc-cta-grid">
          <button type="button" className="lc-cta is-primary" onClick={reset}>
            retry ✨
          </button>
          <Link className="lc-cta" href="/">
            home
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
