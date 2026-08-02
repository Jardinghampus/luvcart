"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  username: string;
  displayName: string;
  shareToken: string;
};

export function ShareProfileCard({ username, displayName, shareToken }: Props) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [profileUrl, setProfileUrl] = useState(`https://luvcart.vercel.app/u/${username}`);

  useEffect(() => {
    setProfileUrl(`${window.location.origin}/u/${username}`);
  }, [username]);

  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(profileUrl)}`;
  }, [profileUrl]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  }

  async function shareNative() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} on Luvcart`,
          text: `Private peek — ${displayName}'s Luvcart ✨`,
          url: profileUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 1600);
        return;
      } catch {
        // fall through
      }
    }
    await copyLink();
  }

  return (
    <section className="lc-hero-card">
      <p style={{ fontFamily: "var(--font-retro)", fontSize: "0.72rem", color: "#e11d74" }}>
        SHARE MY PROFILE · INCOGNITO
      </p>
      <h1 style={{ fontSize: "1.8rem" }}>send your sparkle ✨</h1>
      <p>
        Share only with him. Guests can peek folders — never edit. Your profile stays out of search
        engines.
      </p>

      <div
        style={{
          marginTop: "0.85rem",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: "0.75rem",
          alignItems: "center",
          padding: "0.7rem",
          background: "rgba(255,255,255,0.78)",
          border: "2px solid #fff",
          borderRightColor: "#716f64",
          borderBottomColor: "#716f64",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrUrl}
          alt="Profile QR"
          width={88}
          height={88}
          style={{ border: "2px solid #716f64", background: "white" }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: 800, fontSize: "0.85rem", color: "#6b5a7a" }}>
            your public profile
          </p>
          <p
            style={{
              margin: "0.25rem 0 0",
              fontFamily: "var(--font-pixel)",
              fontSize: "1.2rem",
              color: "#e11d74",
            }}
          >
            @{username}
          </p>
          <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", fontWeight: 700, color: "#6b5a7a" }}>
            🕶 robots blocked · share privately
          </p>
        </div>
      </div>

      <div className="lc-cta-grid">
        <button type="button" className="lc-cta is-primary" onClick={shareNative}>
          {shared ? "shared 💕" : copied ? "copied 💕" : "share my profile 🎀"}
        </button>
        <button type="button" className="lc-cta" onClick={copyLink}>
          {copied ? "link copied ✓" : "copy profile link"}
        </button>
        <Link className="lc-cta" href={`/u/${username}`}>
          preview as guest 👁
        </Link>
        <Link className="lc-cta" href="/my">
          back to photos 💗
        </Link>
      </div>

      <details style={{ marginTop: "0.85rem" }}>
        <summary
          style={{
            cursor: "pointer",
            fontSize: "0.78rem",
            fontWeight: 800,
            color: "#6b5a7a",
          }}
        >
          advanced / private token link
        </summary>
        <p
          style={{
            margin: "0.45rem 0 0",
            wordBreak: "break-all",
            fontFamily: "var(--font-pixel)",
            fontSize: "0.95rem",
            color: "#6b5a7a",
          }}
        >
          /v/{shareToken}
        </p>
      </details>
    </section>
  );
}
