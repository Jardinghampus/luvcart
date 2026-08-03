"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { AppShell } from "./AppShell";

type AdminPhoto = {
  id: string;
  title: string;
  photoUrl: string | null;
  folder: string;
  spicy: boolean;
  teaser: boolean;
  createdAt: string;
};

type AdminUser = {
  id: string;
  username: string;
  displayName: string;
  password: string;
  shareToken: string;
  avatarUrl: string | null;
  bio: string;
  createdAt: string;
  photoCount: number;
  photos: AdminPhoto[];
};

type Totals = { users: number; photos: number; withImage: number };

export function DemoDirectory() {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        setUnlocked(false);
        return;
      }
      const data = await res.json();
      setUsers(data.users || []);
      setTotals(data.totals || null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/auth");
        const data = await res.json();
        setUnlocked(Boolean(data.unlocked));
        if (data.unlocked) await load();
      } finally {
        setChecking(false);
      }
    })();
  }, [load]);

  async function onUnlock(e: FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Wrong password");
      return;
    }
    setUnlocked(true);
    setPassword("");
    await load();
  }

  async function onLock() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setUnlocked(false);
    setUsers([]);
    setTotals(null);
  }

  async function resetPassword(user: AdminUser) {
    const next = window.prompt(`New password for @${user.username}`, user.password || "");
    if (!next || next.length < 4) return;
    setResetting(user.id);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, password: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reset password");
        return;
      }
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, password: data.user.password } : u))
      );
    } finally {
      setResetting(null);
    }
  }

  if (checking) {
    return (
      <AppShell title="Demo" pathLabel="C:\\LUVCART\\DEMO" showNav={false}>
        <p className="lc-empty">Please wait, darling… 💕</p>
      </AppShell>
    );
  }

  if (!unlocked) {
    return (
      <AppShell title="Demo lock" pathLabel="C:\\LUVCART\\DEMO\\LOCK" showNav={false}>
        <form className="lc-auth" onSubmit={onUnlock}>
          <p className="lc-kicker">PRIVATE · GAMLASTAN GATE</p>
          <h1>Demo directory 🔐</h1>
          <p>All accounts, logins, and uploaded photos. Password required.</p>
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
        </form>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Demo directory"
      pathLabel="C:\\LUVCART\\DEMO\\USERS"
      showNav={false}
      statusLeft={
        totals
          ? `${totals.users} users · ${totals.photos} pics · ${totals.withImage} with files`
          : "demo unlocked"
      }
    >
      <div className="lc-demo">
        <div className="lc-vault-toolbar">
          <button type="button" className="lc-mini-btn is-pink" onClick={load} disabled={loading}>
            {loading ? "…" : "↻ refresh"}
          </button>
          <button type="button" className="lc-mini-btn" onClick={onLock}>
            🔒 lock
          </button>
          <Link className="lc-mini-btn" href="/slideshow">
            open slideshow
          </Link>
        </div>

        {error ? <p className="lc-error">{error}</p> : null}

        <div className="lc-demo-list">
          {users.map((user) => (
            <article key={user.id} className="lc-demo-card">
              <header className="lc-demo-head">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="lc-demo-avatar" />
                ) : (
                  <div className="lc-demo-avatar is-empty">💕</div>
                )}
                <div>
                  <h2>{user.displayName}</h2>
                  <p className="lc-demo-creds">
                    <span>
                      userword <strong>@{user.username}</strong>
                    </span>
                    <span>
                      password <strong>{user.password || "— not stored —"}</strong>
                    </span>
                  </p>
                  <p className="lc-share-meta">
                    {user.photoCount} photos · joined {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </header>

              <div className="lc-privacy-actions">
                <Link className="lc-mini-btn is-pink" href={`/u/${user.username}`}>
                  /u/{user.username}
                </Link>
                <Link className="lc-mini-btn" href={`/v/${user.shareToken}`}>
                  private link
                </Link>
                <button
                  type="button"
                  className="lc-mini-btn"
                  onClick={() => resetPassword(user)}
                  disabled={resetting === user.id}
                >
                  {resetting === user.id ? "…" : "set password"}
                </button>
              </div>

              {user.photos.length ? (
                <div className="lc-demo-grid">
                  {user.photos.map((photo) => (
                    <a
                      key={photo.id}
                      className="lc-demo-thumb"
                      href={photo.photoUrl || undefined}
                      target="_blank"
                      rel="noreferrer"
                      title={photo.title}
                    >
                      {photo.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.photoUrl} alt={photo.title} />
                      ) : (
                        <span>no file</span>
                      )}
                      <em>
                        {photo.spicy ? "🌶️ " : ""}
                        {photo.folder}
                      </em>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="lc-empty">No uploads yet</p>
              )}
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
