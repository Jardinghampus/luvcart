"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useSpicy } from "./SpicyMode";

type Props = {
  children: ReactNode;
  title?: string;
  pathLabel?: string;
  showNav?: boolean;
  loggedIn?: boolean;
  toolbarExtra?: ReactNode;
};

function useClock() {
  const [now, setNow] = useState("00:00:00");
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
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { spicy, toggleSpicy } = useSpicy();
  const clock = useClock();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const navLinks = loggedIn
    ? [
        { href: "/", label: "Home" },
        { href: "/my", label: "Photos" },
        { href: "/share", label: "Share" },
        { href: "/slideshow", label: "Vault" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/signup", label: "Join" },
        { href: "/login", label: "Login" },
      ];

  return (
    <div className={`lc-desktop ${spicy ? "is-spicy" : ""}`}>
      {spicy ? <div className="lc-scanlines" aria-hidden /> : null}

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
            <button type="button" className="is-close" aria-label="Close" onClick={() => router.push("/")}>
              ✕
            </button>
          </div>
        </div>

        <div className="lc-menubar">
          <span className="lc-brand-mini">Luvcart</span>
          <button type="button">File</button>
          <button type="button">Edit</button>
          <button type="button">View</button>
          <div className="lc-menubar-spacer" />
          <button
            type="button"
            className={`lc-tool-btn ${spicy ? "is-hot" : ""}`}
            onClick={toggleSpicy}
            aria-pressed={spicy}
          >
            ✨ Filter
          </button>
          {toolbarExtra}
          <button type="button" className="lc-tool-btn" onClick={() => window.print?.()}>
            💾 Save
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
            <strong>{title.replace(/^My\s+/i, "") || "Photos"}</strong>
          </nav>
          <time className="lc-clock">{clock}</time>
        </div>

        <main className="lc-content">{children}</main>

        <footer className="lc-statusbar">
          <span>3 folders</span>
          <span className="lc-dot">·</span>
          <span>luv mode</span>
          <span className="lc-dot">·</span>
          <span>slaying ✨</span>
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
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <button type="button" className="lc-dock-btn" onClick={logout}>
              Out
            </button>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
