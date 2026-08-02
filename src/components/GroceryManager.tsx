"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import type { GroceryItem, PublicUser } from "@/lib/types";
import { useSpicy } from "./SpicyMode";

type Props = {
  initialItems: GroceryItem[];
  user: PublicUser;
};

function ItemThumb({
  item,
  revealSpicy,
}: {
  item: GroceryItem;
  revealSpicy: boolean;
}) {
  const hide = item.spicy && !revealSpicy;

  if (!item.photoUrl) {
    return <div className="bb-thumb bb-thumb-empty">{item.spicy ? "🌶️" : "💕"}</div>;
  }

  return (
    <div className={`bb-thumb ${hide ? "is-blurred" : ""} ${item.spicy ? "is-spicy-item" : ""}`}>
      {item.photoUrl.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.photoUrl} alt={hide ? "spicy photo locked" : item.title} />
      ) : (
        <Image
          src={item.photoUrl}
          alt={hide ? "spicy photo locked" : item.title}
          width={96}
          height={96}
          unoptimized
        />
      )}
      {hide ? (
        <div className="bb-thumb-lock">
          <span>🌶️</span>
          <small>spicy</small>
        </div>
      ) : null}
    </div>
  );
}

export function GroceryManager({ initialItems, user }: Props) {
  const { spicy: spicyMode } = useSpicy();
  const [items, setItems] = useState(initialItems);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [markSpicy, setMarkSpicy] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editNote, setEditNote] = useState("");
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return `/v/${user.shareToken}`;
    return `${window.location.origin}/v/${user.shareToken}`;
  }, [user.shareToken]);

  const remaining = items.filter((i) => !i.checked).length;
  const spicyCount = items.filter((i) => i.spicy).length;

  async function copyShare() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy link");
    }
  }

  function onPickFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function uploadIfNeeded(): Promise<string | null> {
    if (!file) return null;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url as string;
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const photoUrl = await uploadIfNeeded();
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, note, photoUrl, spicy: markSpicy }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not add item");
      setItems((prev) => [...prev, data.item]);
      setTitle("");
      setNote("");
      setMarkSpicy(false);
      onPickFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleChecked(item: GroceryItem) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: !item.checked }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
  }

  async function toggleItemSpicy(item: GroceryItem) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spicy: !item.spicy }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
  }

  async function removeItem(item: GroceryItem) {
    if (!confirm(`Delete “${item.title}”?`)) return;
    const res = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    if (!res.ok) return;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  function startEdit(item: GroceryItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditNote(item.note);
  }

  async function saveEdit(item: GroceryItem) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, note: editNote }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not save");
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    setEditingId(null);
  }

  async function replacePhoto(item: GroceryItem, nextFile: File) {
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", nextFile);
      const up = await fetch("/api/upload", { method: "POST", body: form });
      const upData = await up.json();
      if (!up.ok) throw new Error(upData.error || "Upload failed");

      const res = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: upData.url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update photo");
      setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo update failed");
    } finally {
      setBusy(false);
    }
  }

  async function clearPhoto(item: GroceryItem) {
    const res = await fetch(`/api/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoUrl: null }),
    });
    const data = await res.json();
    if (!res.ok) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? data.item : i)));
  }

  return (
    <div className="bb-stack">
      <section className="bb-sheet">
        <div className="bb-chip-row">
          <span className="bb-emoji-chip">💗 yours</span>
          <span className="bb-emoji-chip">🔒 saved login</span>
          <span className={`bb-emoji-chip ${spicyMode ? "is-hot" : ""}`}>
            {spicyMode ? "🌶️ spicy on" : "🌶️ spicy off"}
          </span>
        </div>
        <h1 className="bb-h1">hi {user.displayName} 🛒</h1>
        <p className="bb-lead">
          {spicyMode
            ? "retro unlocked. spicy pics showing. stay cute 🔥"
            : "soft mode. mark pics spicy — flip the toggle to reveal + go retro."}
        </p>
        <div className="bb-stats">
          <div>
            <strong>{items.length}</strong>
            <span>bits</span>
          </div>
          <div>
            <strong>{remaining}</strong>
            <span>open</span>
          </div>
          <div>
            <strong>{spicyCount || "0"}</strong>
            <span>spicy</span>
          </div>
        </div>
        <div className="bb-share-row">
          <input className="bb-share-input" readOnly value={shareUrl} />
          <button type="button" className="bb-btn bb-btn-soft" onClick={copyShare}>
            {copied ? "copied 💕" : "copy 🎀"}
          </button>
        </div>
      </section>

      <form className="bb-sheet" onSubmit={onCreate}>
        <h2 className="bb-h2">{spicyMode ? "drop something hot 🌶️" : "add something cute ✨"}</h2>
        <label className="bb-field">
          <span>name</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={spicyMode ? "🔥 secret snack" : "🛒 cute finds"}
            required
            maxLength={80}
          />
        </label>
        <label className="bb-field">
          <span>note</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={spicyMode ? "shh… spicy 💫" : "the tiny sweet ones 💕"}
            maxLength={240}
          />
        </label>
        <label className="bb-field">
          <span>photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onPickFile(e.target.files?.[0] || null)}
          />
        </label>
        <label className="bb-toggle-row">
          <input
            type="checkbox"
            checked={markSpicy}
            onChange={(e) => setMarkSpicy(e.target.checked)}
          />
          <span>🌶️ mark as spicy picture</span>
        </label>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className={`bb-preview ${markSpicy && !spicyMode ? "is-blurred-preview" : ""}`}
          />
        ) : null}
        {error ? <p className="bb-error">{error}</p> : null}
        <button className="bb-btn bb-btn-primary" type="submit" disabled={busy}>
          {busy ? "saving… 🔐" : markSpicy ? "add spicy 🌶️" : "add 💗"}
        </button>
      </form>

      <section className="bb-sheet">
        <h2 className="bb-h2">{spicyMode ? "hot scrapbook 🔥" : "my bits 🍓"}</h2>
        {items.length === 0 ? (
          <p className="bb-empty">empty for now… drop a pic ✨</p>
        ) : (
          <ul className="bb-list">
            {items.map((item) => (
              <li
                key={item.id}
                className={`bb-item ${item.checked ? "is-checked" : ""} ${item.spicy ? "is-spicy-row" : ""}`}
              >
                <button
                  type="button"
                  className="bb-check"
                  onClick={() => toggleChecked(item)}
                  aria-label={item.checked ? "Mark unchecked" : "Mark checked"}
                >
                  {item.checked ? "✓" : item.spicy ? "🌶️" : "♡"}
                </button>

                <div className="bb-item-body">
                  {editingId === item.id ? (
                    <div className="bb-edit-stack">
                      <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                      <input value={editNote} onChange={(e) => setEditNote(e.target.value)} />
                      <div className="bb-row">
                        <button
                          type="button"
                          className="bb-btn bb-btn-primary"
                          onClick={() => saveEdit(item)}
                        >
                          save 💕
                        </button>
                        <button
                          type="button"
                          className="bb-btn bb-btn-soft"
                          onClick={() => setEditingId(null)}
                        >
                          cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="bb-item-title">
                        {item.spicy ? "🌶️ " : ""}
                        {item.title}
                      </p>
                      {item.note ? <p className="bb-item-note">{item.note}</p> : null}
                    </>
                  )}

                  <div className="bb-item-actions">
                    <button type="button" className="bb-linkish" onClick={() => startEdit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="bb-linkish"
                      onClick={() => toggleItemSpicy(item)}
                    >
                      {item.spicy ? "unspicy" : "make spicy"}
                    </button>
                    <label className="bb-linkish">
                      Swap photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) void replacePhoto(item, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    {item.photoUrl ? (
                      <button type="button" className="bb-linkish" onClick={() => clearPhoto(item)}>
                        Remove photo
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="bb-linkish danger"
                      onClick={() => removeItem(item)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <ItemThumb item={item} revealSpicy={spicyMode} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
