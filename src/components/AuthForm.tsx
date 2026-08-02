"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          password,
          displayName: displayName || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      router.push("/my");
      router.refresh();
    } catch {
      setError("Network error — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="lc-auth" onSubmit={onSubmit}>
      <h1>{mode === "signup" ? "make it yours 💕" : "welcome back 🍓"}</h1>
      <p>
        {mode === "signup"
          ? "userword + password. we keep your login safe 🔒"
          : "your login is saved — slip back into your folders ✨"}
      </p>

      {mode === "signup" ? (
        <label>
          nickname
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Luv Babe"
            maxLength={40}
          />
        </label>
      ) : null}

      <label>
        userword
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="luvcart_girl"
          autoComplete="username"
          required
          minLength={3}
          maxLength={24}
        />
      </label>

      <label>
        password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={4}
        />
      </label>

      {error ? <p className="lc-error">{error}</p> : null}

      <button className="lc-cta is-primary" type="submit" disabled={loading}>
        {loading ? "saving… 🔐" : mode === "signup" ? "save me 💗" : "let me in ✨"}
      </button>

      <p style={{ fontSize: "0.82rem" }}>
        🔐 logins are saved (hashed + encrypted session).
        {mode === "signup" ? (
          <>
            {" "}
            already here? <Link href="/login">login</Link>
          </>
        ) : (
          <>
            {" "}
            new? <Link href="/signup">join</Link>
          </>
        )}
      </p>
    </form>
  );
}
