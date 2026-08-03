"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { saveMyPageSnapshot } from "@/lib/save-page-card";
import { useSpicy } from "./SpicyMode";

type Props = {
  children: ReactNode;
  title?: string;
  pathLabel?: string;
  showNav?: boolean;
  loggedIn?: boolean;
  toolbarExtra?: ReactNode;
  statusLeft?: string;
};

function useClock() {
  const [now, setNow] = useState("--:--:-- --");
  useEffect(() => {
    const tick = () => {
      setNow(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function AppShell({
  children,
  title = "Luvcart",
  pathLabel = "C:\\USERS\\GIRL\\PHOTOS",
  showNav = true,
  loggedIn = false,
  toolbarExtra,
  statusLeft,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { spicy, toggleSpicy } = useSpicy();
  const clock = useClock();
  const [saving, setSaving] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function onSave() {
    if (saving) return;
    setSaving(true);
    try {
      await saveMyPageSnapshot();
    } catch (err) {
      console.error(err);
      window.alert("Could not save snapshot — try again 💕");
    } finally {
      setSaving(false);
    }
  }

  const navLinks = loggedIn
    ? [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/my", label: "Photos", icon: "💗" },
        { href: "/share", label: "Share", icon: "🎀" },
      ]
    : [
        { href: "/", label: "Home", icon: "🏠" },
        { href: "/signup", label: "Join", icon: "✨" },
        { href: "/login", label: "Login", icon: "🍓" },
      ];

  const crumb = title.replace(/^My\s+/i, "") || "Photos";

  return (
    <div className="lc-desktop">
      <div className="lc-desktop-icons" aria-hidden>
        <span>♻️ Recycle</span>
        <span>💻 My PC</span>
        <span>📁 Photos</span>
        <span>💖 Luvcart</span>
      </div>

      <div className="lc-window">
        <div className="lc-titlebar">
          <span className="lc-titlebar-text">
            {title} — {pathLabel}
          </span>
          <div className="lc-traffic">
            <button type="button" aria-label="Minimize">
              _
            </button>
            <button type="button" aria-label="Maximize">
              □
            </button>
            <button
              type="button"
              className="is-close"
              aria-label="Close"
              onClick={() => router.push(loggedIn ? "/my" : "/")}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="lc-menubar">
          <span className="lc-brand-mini">Luvcart</span>
          <button type="button">File</button>
          <button type="button">Edit</button>
          <button type="button">View</button>
          <button type="button">Help</button>
          <div className="lc-menubar-spacer" />
          <button
            type="button"
            className={`lc-tool-btn ${spicy ? "is-hot" : ""}`}
            onClick={toggleSpicy}
            aria-pressed={spicy}
            title="Spicy filter"
          >
            ✨ Filter
          </button>
          {toolbarExtra}
          <button
            type="button"
            className="lc-tool-btn"
            onClick={onSave}
            disabled={saving}
            title="Save my page snapshot"
          >
            {saving ? "…" : "💾 Save"}
          </button>
        </div>

        <div className="lc-pathbar">
          <span className="lc-folder-ico" aria-hidden>
            📁
          </span>
          <nav className="lc-crumbs" aria-label="Path">
            <span>Desktop</span>
            <span>›</span>
            <span>My Computer</span>
            <span>›</span>
            <span>My Photos</span>
            <span>›</span>
            <strong>{crumb}</strong>
          </nav>
          <time className="lc-clock">{clock}</time>
        </div>

        <main className="lc-content">{children}</main>

        <footer className="lc-statusbar">
          <span>{statusLeft || "3 folders · luv mode · slaying ✨"}</span>
          <span className="lc-statusbar-right">LUVCART v2.6 ❤️</span>
        </footer>
      </div>

      {showNav ? (
        <nav className="lc-dock" aria-label="Main">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`lc-dock-btn ${pathname === link.href ? "is-active" : ""}`}
            >
              <span className="lc-dock-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
          {loggedIn ? (
            <button type="button" className="lc-dock-btn" onClick={logout}>
              <span className="lc-dock-icon">👋</span>
              <span>Out</span>
            </button>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
