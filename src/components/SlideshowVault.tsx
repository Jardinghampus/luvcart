"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { UploadEntry } from "@/lib/uploads-catalog";
import { AppShell } from "./AppShell";

type VaultUpload = UploadEntry & {
  teaser?: boolean;
  blurPx?: number;
  folder?: string;
};

export function SlideshowVault() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<VaultUpload[]>([]);
  const [storage, setStorage] = useState("local-disk");
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<VaultUpload | null>(null);

  const current = uploads[index] || null;

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/slideshow/media");
      if (!res.ok) {
        setUnlocked(false);
        return;
      }
      const data = await res.json();
      setUploads(data.uploads || []);
      setStorage(data.storage || "local-disk");
      setIndex(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/slideshow/auth");
        const data = await res.json();
        setUnlocked(Boolean(data.unlocked));
        if (data.unlocked) await loadMedia();
      } finally {
        setChecking(false);
      }
    })();
  }, [loadMedia]);

  useEffect(() => {
    if (!playing || uploads.length === 0) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % uploads.length);
    }, 2800);
    return () => clearInterval(t);
  }, [playing, uploads.length]);

  useEffect(() => {
    if (current) setSelected(current);
  }, [current]);

  const spicyCount = useMemo(() => uploads.filter((u) => u.spicy).length, [uploads]);

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/slideshow/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Wrong password, darling.");
      return;
    }
    setUnlocked(true);
    setPassword("");
    await loadMedia();
  }

  async function onLock() {
    await fetch("/api/slideshow/auth", { method: "DELETE" });
    setUnlocked(false);
    setUploads([]);
    setPlaying(false);
  }

  if (checking) {
    return (
      <AppShell title="Vault" pathLabel="C:\\LUVCART\\VAULT" showNav={false}>
        <p className="lc-empty">Please wait, darling… 💕</p>
      </AppShell>
    );
  }

  if (!unlocked) {
    return (
      <AppShell title="Private Vault" pathLabel="C:\\LUVCART\\VAULT\\LOCK" showNav={false}>
        <form className="lc-auth" onSubmit={onUnlock}>
          <p className="lc-kicker">WINDOWS 94 · SECRET CHAMBER</p>
          <h1>Slideshow vault 🔐</h1>
          <p>Every Blob + scrapbook upload. Enter the passphrase to peek.</p>
          <label>
            password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              required
            />
          </label>
          {error ? <p className="lc-error">{error}</p> : null}
          <button type="submit" className="lc-cta is-primary">
            Unlock ✨
          </button>
          <Link className="lc-cta" href="/">
            Cancel
          </Link>
          <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#6b5a7a" }}>
            Encrypted session · 12h · keep it cute
          </p>
        </form>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Slideshow"
      pathLabel="C:\\LUVCART\\VAULT\\ALL"
      loggedIn
      statusLeft={`${uploads.length} files · ${spicyCount} spicy · ${storage}`}
    >
      <div className="lc-vault">
        <div className="lc-vault-toolbar">
          <button
            type="button"
            className="lc-mini-btn is-pink"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "❚❚ Pause" : "▶ Play"}
          </button>
          <button
            type="button"
            className="lc-mini-btn"
            onClick={() => setIndex((i) => (i - 1 + uploads.length) % Math.max(uploads.length, 1))}
            disabled={!uploads.length}
          >
            ◀ Prev
          </button>
          <button
            type="button"
            className="lc-mini-btn"
            onClick={() => setIndex((i) => (i + 1) % Math.max(uploads.length, 1))}
            disabled={!uploads.length}
          >
            Next ▶
          </button>
          <button type="button" className="lc-mini-btn" onClick={loadMedia} disabled={loading}>
            {loading ? "…" : "↻"}
          </button>
          <button type="button" className="lc-mini-btn" onClick={onLock}>
            🔒 Lock
          </button>
        </div>

        <div className="lc-vault-stage">
          <div className="lc-vault-preview">
            {selected?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.url} alt={selected.title || "upload"} />
            ) : (
              <div className="lc-empty">No uploads yet, sweetie. Drop pics in Photos 💕</div>
            )}
          </div>
          {selected ? (
            <div className="lc-vault-caption">
              <strong>{selected.title || selected.pathname || "untitled"}</strong>
              <span>
                {selected.source}
                {selected.spicy ? " · 🌶️" : ""}
                {selected.teaser ? " · ✨ teaser" : ""}
                {selected.uploadedAt ? ` · ${new Date(selected.uploadedAt).toLocaleString()}` : ""}
              </span>
            </div>
          ) : null}
        </div>

        <div className="lc-vault-strip">
          <p className="lc-section-title">Preview strip</p>
          <div className="lc-vault-thumbs">
            {uploads.map((u, i) => (
              <button
                key={u.id}
                type="button"
                className={`lc-vault-thumb ${i === index ? "is-active" : ""}`}
                onClick={() => {
                  setIndex(i);
                  setSelected(u);
                  setPlaying(false);
                }}
                title={u.title || u.pathname || u.url}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.url} alt="" />
                {u.spicy ? <em>🌶️</em> : null}
              </button>
            ))}
          </div>
          <p className="lc-guest-pill" style={{ marginTop: "0.45rem" }}>
            {index + 1}/{uploads.length || 0} · slaying in the vault ✨
          </p>
        </div>
      </div>
    </AppShell>
  );
}
