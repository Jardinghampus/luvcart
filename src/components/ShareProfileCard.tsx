"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Props = {
  username: string;
  displayName: string;
  shareToken: string;
};

export function ShareProfileCard({ username, displayName, shareToken }: Props) {
  const [token, setToken] = useState(shareToken);
  const [copied, setCopied] = useState<"profile" | "private" | null>(null);
  const [shared, setShared] = useState(false);
  const [origin, setOrigin] = useState("https://luvcart.vercel.app");
  const [confirmSpin, setConfirmSpin] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinFlash, setSpinFlash] = useState(false);
  const [spinError, setSpinError] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    setToken(shareToken);
  }, [shareToken]);

  const profileUrl = `${origin}/u/${username}`;
  const privateUrl = `${origin}/v/${token}`;

  const qrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=8&data=${encodeURIComponent(profileUrl)}`;
  }, [profileUrl]);

  async function copy(text: string, which: "profile" | "private") {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 1600);
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
    await copy(profileUrl, "profile");
  }

  async function spinPrivateLink() {
    setSpinError("");
    setSpinning(true);
    try {
      const res = await fetch("/api/profile/rotate-share", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setSpinError(data.error || "Could not spin a new link");
        return;
      }
      const next = data.user?.shareToken as string;
      setToken(next);
      setConfirmSpin(false);
      setSpinFlash(true);
      setTimeout(() => setSpinFlash(false), 2200);
      await copy(`${origin}/v/${next}`, "private");
    } catch {
      setSpinError("Network glitch — try again");
    } finally {
      setSpinning(false);
    }
  }

  return (
    <section className="lc-hero-card">
      <p className="lc-kicker">SHARE MY PROFILE · INCOGNITO</p>
      <h1 style={{ fontSize: "1.8rem" }}>send your sparkle ✨</h1>
      <p>
        Share only with him. Guests can peek folders — never edit. Your profile stays out of search
        engines.
      </p>

      <div className="lc-share-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrUrl} alt="Profile QR" width={88} height={88} className="lc-share-qr" />
        <div>
          <p className="lc-share-label">your public profile</p>
          <p className="lc-share-handle">@{username}</p>
          <p className="lc-share-meta">🕶 robots blocked · share privately</p>
        </div>
      </div>

      <div className="lc-cta-grid">
        <button type="button" className="lc-cta is-primary" onClick={shareNative}>
          {shared ? "shared 💕" : copied === "profile" ? "copied 💕" : "share my profile 🎀"}
        </button>
        <button type="button" className="lc-cta" onClick={() => copy(profileUrl, "profile")}>
          {copied === "profile" ? "link copied ✓" : "copy profile link"}
        </button>
        <Link className="lc-cta" href={`/u/${username}`}>
          preview as guest 👁
        </Link>
        <Link className="lc-cta" href="/my">
          back to photos 💗
        </Link>
      </div>

      <div className={`lc-privacy-panel ${spinFlash ? "is-fresh" : ""}`}>
        <div className="lc-privacy-head">
          <span aria-hidden>🌀</span>
          <div>
            <strong>Privacy spin</strong>
            <p>Optional secret link. Spin a new one anytime — the old URL vanishes.</p>
          </div>
        </div>

        <label className="lc-privacy-url">
          <span>private guest link</span>
          <input type="text" readOnly value={privateUrl} onFocus={(e) => e.target.select()} />
        </label>

        <div className="lc-privacy-actions">
          <button
            type="button"
            className="lc-mini-btn is-pink"
            onClick={() => copy(privateUrl, "private")}
          >
            {copied === "private" ? "copied ✓" : "copy secret link"}
          </button>
          <Link className="lc-mini-btn" href={`/v/${token}`}>
            open secret preview
          </Link>
          {!confirmSpin ? (
            <button type="button" className="lc-mini-btn" onClick={() => setConfirmSpin(true)}>
              🌀 spin a new link
            </button>
          ) : null}
        </div>

        {confirmSpin ? (
          <div className="lc-privacy-confirm" role="alertdialog" aria-label="Confirm link spin">
            <p>
              Spinning kills the old private URL. Anyone with the old link gets a 404. Your @
              {username} profile stays the same.
            </p>
            <div className="lc-privacy-actions">
              <button
                type="button"
                className="lc-mini-btn is-pink"
                onClick={spinPrivateLink}
                disabled={spinning}
              >
                {spinning ? "spinning…" : "yes, spin it ✨"}
              </button>
              <button
                type="button"
                className="lc-mini-btn"
                onClick={() => setConfirmSpin(false)}
                disabled={spinning}
              >
                keep this one
              </button>
            </div>
          </div>
        ) : null}

        {spinFlash ? (
          <p className="lc-privacy-flash">new secret link ready · old one is gone 💕</p>
        ) : null}
        {spinError ? <p className="lc-error">{spinError}</p> : null}
      </div>
    </section>
  );
}
