"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { UploadEntry } from "@/lib/uploads-catalog";

export function SlideshowVault() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [uploads, setUploads] = useState<UploadEntry[]>([]);
  const [storage, setStorage] = useState("local-disk");
  const [loading, setLoading] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<UploadEntry | null>(null);

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
      setError(data.error || "Nope");
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
      <div className="win-app">
        <div className="win-window">
          <div className="win-titlebar">
            <span>🌸 Luvcart Vault — loading…</span>
          </div>
          <div className="win-body">
            <p className="win-status">Please wait, darling…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="win-app">
        <div className="win-window win-login">
          <div className="win-titlebar">
            <span>🔐 Private Slideshow Vault</span>
            <div className="win-traffic">
              <b>_</b>
              <b>□</b>
              <b>×</b>
            </div>
          </div>
          <div className="win-body">
            <div className="win-hero">
              <p className="win-kicker">Windows 94 · posh girl mode</p>
              <h1>Slideshow Chamber</h1>
              <p>
                A charming little vault for every upload — blob, local, and scrapbook pics.
                Enter the secret passphrase.
              </p>
            </div>
            <form className="win-form" onSubmit={onUnlock}>
              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoFocus
                  required
                />
              </label>
              {error ? <p className="win-error">{error}</p> : null}
              <div className="win-btn-row">
                <button type="submit" className="win-btn win-btn-pink">
                  Unlock ✨
                </button>
                <a href="/" className="win-btn">
                  Cancel
                </a>
              </div>
            </form>
            <p className="win-footnote">Encrypted session · 12h · keep it cute</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="win-app">
      <div className="win-window win-wide">
        <div className="win-titlebar">
          <span>🎞️ Luvcart Slideshow — all uploads</span>
          <div className="win-traffic">
            <b>_</b>
            <b>□</b>
            <button type="button" className="win-x" onClick={onLock} title="Lock vault">
              ×
            </button>
          </div>
        </div>

        <div className="win-toolbar">
          <button type="button" className="win-btn win-btn-pink" onClick={() => setPlaying((p) => !p)}>
            {playing ? "❚❚ Pause" : "▶ Play slideshow"}
          </button>
          <button
            type="button"
            className="win-btn"
            onClick={() => setIndex((i) => (i - 1 + uploads.length) % Math.max(uploads.length, 1))}
            disabled={!uploads.length}
          >
            ◀ Prev
          </button>
          <button
            type="button"
            className="win-btn"
            onClick={() => setIndex((i) => (i + 1) % Math.max(uploads.length, 1))}
            disabled={!uploads.length}
          >
            Next ▶
          </button>
          <button type="button" className="win-btn" onClick={loadMedia} disabled={loading}>
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button type="button" className="win-btn" onClick={onLock}>
            🔒 Lock
          </button>
          <span className="win-pill">{storage}</span>
          <span className="win-pill">{uploads.length} files</span>
          <span className="win-pill">{spicyCount} spicy</span>
        </div>

        <div className="win-stage">
          <div className="win-preview">
            {selected?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.url} alt={selected.title || "upload"} />
            ) : (
              <div className="win-empty">No uploads yet, sweetie. Drop some pics first 💕</div>
            )}
            {selected ? (
              <div className="win-caption">
                <strong>{selected.title || selected.pathname || "untitled"}</strong>
                <span>
                  {selected.source}
                  {selected.spicy ? " · 🌶️ spicy" : ""}
                  {selected.uploadedAt ? ` · ${new Date(selected.uploadedAt).toLocaleString()}` : ""}
                </span>
              </div>
            ) : null}
          </div>

          <div className="win-filmstrip">
            <p className="win-strip-title">Preview strip</p>
            <div className="win-thumbs">
              {uploads.map((u, i) => (
                <button
                  key={u.id}
                  type="button"
                  className={`win-thumb ${i === index ? "is-active" : ""}`}
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
          </div>
        </div>

        <div className="win-statusbar">
          Ready · Luvcart vault · posh &amp; private · {index + 1}/{uploads.length || 0}
        </div>
      </div>
    </div>
  );
}
