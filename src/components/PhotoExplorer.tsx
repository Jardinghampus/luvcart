"use client";

import { FormEvent, useMemo, useState, type CSSProperties } from "react";
import type { FolderId, PhotoItem, PublicUser } from "@/lib/types";
import { FOLDERS, folderMeta, TEASER_BLUR_PX } from "@/lib/types";
import { useSpicy } from "./SpicyMode";

type Props = {
  initialItems: PhotoItem[];
  user: PublicUser;
  readOnly?: boolean;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function photoStyle(item: PhotoItem, revealSpicy: boolean): CSSProperties | undefined {
  if (item.spicy && !revealSpicy) return undefined;
  if (item.teaser && item.blurPx > 0) {
    return { filter: `blur(${item.blurPx}px)`, transform: "scale(1.02)" };
  }
  return undefined;
}

function Polaroid({
  item,
  revealSpicy,
  onOpen,
}: {
  item: PhotoItem;
  revealSpicy: boolean;
  onOpen?: () => void;
}) {
  const hideSpicy = item.spicy && !revealSpicy;
  return (
    <button type="button" className="lc-polaroid" onClick={onOpen}>
      <div className={`lc-polaroid-pic ${hideSpicy ? "is-blurred" : ""}`}>
        {item.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.photoUrl}
            alt={hideSpicy ? "spicy locked" : item.title}
            style={photoStyle(item, revealSpicy)}
          />
        ) : (
          <div className="lc-polaroid-empty">{item.spicy ? "🌶️" : "💕"}</div>
        )}
        {hideSpicy ? (
          <div className="lc-polaroid-lock">
            <span>🌶️</span>
            <small>spicy</small>
          </div>
        ) : null}
        {item.teaser && !hideSpicy ? <em className="lc-teaser-badge">teaser</em> : null}
      </div>
      <div className="lc-polaroid-meta">
        <span className="lc-polaroid-caption">
          {item.spicy ? "🌶️ " : ""}
          {item.teaser ? "✨ " : ""}
          {item.title || "untitled"}
        </span>
        <span className="lc-polaroid-date">{formatDate(item.createdAt)}</span>
      </div>
    </button>
  );
}

export function PhotoExplorer({ initialItems, user, readOnly = false }: Props) {
  const { spicy: spicyMode } = useSpicy();
  const [items, setItems] = useState(initialItems);
  const [profile, setProfile] = useState(user);
  const [folder, setFolder] = useState<FolderId>("selfies");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [markSpicy, setMarkSpicy] = useState(false);
  const [markTeaser, setMarkTeaser] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [active, setActive] = useState<PhotoItem | null>(null);
  const [feedMode, setFeedMode] = useState(false);

  const meta = folderMeta(folder);
  const inFolder = useMemo(() => items.filter((i) => i.folder === folder), [items, folder]);
  const feed = useMemo(
    () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items]
  );
  const shown = feedMode ? feed : inFolder;
  const folderCounts = useMemo(() => {
    const counts: Record<FolderId, number> = { selfies: 0, vacation: 0, food: 0 };
    for (const item of items) counts[item.folder] += 1;
    return counts;
  }, [items]);

  async function uploadFile(f: File) {
    const form = new FormData();
    form.append("file", f);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (readOnly) return;
    setError("");
    setBusy(true);
    try {
      const photoUrl = file ? await uploadFile(file) : null;
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          note,
          photoUrl,
          spicy: markSpicy,
          teaser: markTeaser,
          blurPx: markTeaser ? TEASER_BLUR_PX : 0,
          folder,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add");
      setItems((prev) => [...prev, data.item]);
      setTitle("");
      setNote("");
      setMarkSpicy(false);
      setMarkTeaser(true);
      setFile(null);
      setShowAdd(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function patchItem(item: PhotoItem, body: Record<string, unknown>) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return null;
    setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    setActive(data.item);
    return data.item as PhotoItem;
  }

  async function removeItem(item: PhotoItem) {
    if (readOnly) return;
    if (!confirm(`Delete “${item.title}”?`)) return;
    const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    setActive(null);
  }

  async function onAvatar(f: File | null) {
    if (!f || readOnly) return;
    setBusy(true);
    try {
      const avatarUrl = await uploadFile(f);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Avatar failed");
      setProfile(data.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Avatar failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lc-explorer">
      <section className="lc-profile-card">
        <div className="lc-avatar-wrap">
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt={profile.displayName} className="lc-avatar" />
          ) : (
            <div className="lc-avatar lc-avatar-empty">💕</div>
          )}
          {!readOnly ? (
            <label className="lc-avatar-edit">
              💾
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  void onAvatar(e.target.files?.[0] || null);
                  e.target.value = "";
                }}
              />
            </label>
          ) : null}
        </div>
        <div className="lc-profile-meta">
          <h2>{profile.displayName}</h2>
          <p>@{profile.username}</p>
          <p className="lc-profile-bio">{profile.bio || "private polaroid drive"}</p>
          <div className="lc-chip-row">
            {profile.incognito ? (
              <span className="lc-emoji-chip">🕶 incognito</span>
            ) : (
              <span className="lc-emoji-chip">🌐 listed</span>
            )}
            <span className="lc-emoji-chip">{items.length} photos</span>
          </div>
        </div>
      </section>

      <section className="lc-section">
        <div className="lc-section-head">
          <h2 className="lc-section-title">My folders</h2>
          <button type="button" className="lc-mini-btn" onClick={() => setFeedMode((v) => !v)}>
            {feedMode ? "Folders" : "Feed"}
          </button>
        </div>
        {!feedMode ? (
          <div className="lc-folder-row">
            {FOLDERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className={`lc-folder-btn ${folder === f.id ? "is-active" : ""}`}
                onClick={() => setFolder(f.id)}
              >
                <span className="lc-folder-emoji">{f.emoji}</span>
                <span className="lc-folder-label">{f.label}</span>
                <span className="lc-folder-count">{folderCounts[f.id]}</span>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="lc-section">
        <div className="lc-section-head">
          <h2 className="lc-section-title">{feedMode ? "All photos" : meta.label}</h2>
          {!readOnly ? (
            <button type="button" className="lc-mini-btn" onClick={() => setShowAdd((v) => !v)}>
              {showAdd ? "Close" : "+ Add pic"}
            </button>
          ) : (
            <span className="lc-guest-pill">👁 peek only · {profile.displayName}</span>
          )}
        </div>

        {showAdd && !readOnly ? (
          <form className="lc-add-panel" onSubmit={onCreate}>
            <label>
              caption
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="slay ✨"
                required
                maxLength={80}
              />
            </label>
            <label>
              note
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="for his eyes only"
                maxLength={240}
              />
            </label>
            <label>
              photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>
            <label className="lc-checkline">
              <input
                type="checkbox"
                checked={markTeaser}
                onChange={(e) => setMarkTeaser(e.target.checked)}
              />
              ✨ teaser (soft {TEASER_BLUR_PX}px blur)
            </label>
            <label className="lc-checkline">
              <input
                type="checkbox"
                checked={markSpicy}
                onChange={(e) => setMarkSpicy(e.target.checked)}
              />
              🌶️ spicy / nude (hidden until Filter)
            </label>
            {error ? <p className="lc-error">{error}</p> : null}
            <button type="submit" className="lc-mini-btn is-pink" disabled={busy}>
              {busy ? "Saving…" : "Save to folder 💾"}
            </button>
          </form>
        ) : null}

        {shown.length === 0 ? (
          <p className="lc-empty">This folder is empty, babe. Drop a Polaroid ✨</p>
        ) : (
          <div className="lc-polaroid-grid">
            {shown.map((item) => (
              <Polaroid
                key={item.id}
                item={item}
                revealSpicy={spicyMode}
                onOpen={() => setActive(item)}
              />
            ))}
          </div>
        )}
      </section>

      {active ? (
        <div className="lc-modal" role="dialog" aria-modal>
          <div className="lc-modal-window">
            <div className="lc-titlebar">
              <span>Preview — {active.title}</span>
              <button type="button" className="lc-traffic-x" onClick={() => setActive(null)}>
                ✕
              </button>
            </div>
            <div className="lc-modal-body">
              <div className={`lc-modal-pic ${active.spicy && !spicyMode ? "is-blurred" : ""}`}>
                {active.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={active.photoUrl}
                    alt={active.title}
                    style={photoStyle(active, spicyMode)}
                  />
                ) : (
                  <div className="lc-polaroid-empty">💕</div>
                )}
              </div>
              <p className="lc-modal-note">{active.note || "no note yet"}</p>
              {!readOnly ? (
                <div className="lc-modal-actions">
                  <button
                    type="button"
                    className="lc-mini-btn"
                    onClick={() =>
                      patchItem(active, {
                        teaser: !active.teaser,
                        blurPx: !active.teaser ? TEASER_BLUR_PX : 0,
                      })
                    }
                  >
                    {active.teaser ? "clear teaser blur" : "make teaser ✨"}
                  </button>
                  {active.teaser ? (
                    <button
                      type="button"
                      className="lc-mini-btn"
                      onClick={() =>
                        patchItem(active, {
                          blurPx: active.blurPx > 0 ? 0 : TEASER_BLUR_PX,
                        })
                      }
                    >
                      {active.blurPx > 0 ? "remove blur" : "restore 1px blur"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="lc-mini-btn"
                    onClick={() => patchItem(active, { spicy: !active.spicy })}
                  >
                    {active.spicy ? "unspicy" : "make spicy 🌶️"}
                  </button>
                  <button
                    type="button"
                    className="lc-mini-btn is-danger"
                    onClick={() => removeItem(active)}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
