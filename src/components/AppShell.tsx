"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { LuvcartIcon, LockCuteIcon } from "./CuteIcons";
import { useSpicy } from "./SpicyMode";

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showNav?: boolean;
  loggedIn?: boolean;
  largeTitle?: string;
};

export function AppShell({
  children,
  title = "Luvcart",
  subtitle,
  showNav = true,
  loggedIn = false,
  largeTitle,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { spicy, toggleSpicy } = useSpicy();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const navLinks = loggedIn
    ? [
        { href: "/", label: "Home", emoji: "🏠" },
        { href: "/my", label: "Mine", emoji: "💗" },
        { href: "/share", label: "Share", emoji: "🎀" },
      ]
    : [
        { href: "/", label: "Home", emoji: "🏠" },
        { href: "/signup", label: "Join", emoji: "✨" },
        { href: "/login", label: "Login", emoji: "🍓" },
      ];

  return (
    <div className={`bb-app ${spicy ? "is-spicy" : ""}`}>
      <div className="bb-ios-status" aria-hidden />
      {spicy ? <div className="bb-scanlines" aria-hidden /> : null}
      <header className="bb-nav">
        <div className="bb-nav-left">
          <LuvcartIcon size={26} />
          <div>
            <p className="bb-nav-title">{title}</p>
            {subtitle ? <p className="bb-nav-sub">{subtitle}</p> : null}
          </div>
        </div>
        <div className="bb-nav-actions">
          <button
            type="button"
            className={`bb-spicy-toggle ${spicy ? "is-on" : ""}`}
            onClick={toggleSpicy}
            aria-pressed={spicy}
            title={spicy ? "Spicy on · retro unlocked" : "Turn on spicy pics + retro"}
          >
            <span className="bb-spicy-knob" aria-hidden />
            <span className="bb-spicy-label">{spicy ? "🌶️ SPICY" : "🌶️ spicy"}</span>
          </button>
          <div className="bb-secure" title="Saved login · encrypted session">
            <LockCuteIcon size={14} />
            <span>safe</span>
          </div>
        </div>
      </header>

      {spicy ? (
        <div className="bb-marquee" aria-hidden>
            <span>
            ★ SPICY MODE ON ★ RETRO VIBES ★ HOT PICS UNLOCKED ★ LATE 90s ENERGY ★ LUVCART ★
          </span>
        </div>
      ) : null}

      <main className={`bb-main ${showNav ? "has-dock" : ""}`}>
        {largeTitle ? <h1 className="bb-large-title">{largeTitle}</h1> : null}
        {children}
      </main>

      {showNav ? (
        <nav className="bb-tabbar" aria-label="Main">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`bb-tab ${active ? "is-active" : ""}`}
              >
                <span className="bb-tab-emoji">{link.emoji}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
          {loggedIn ? (
            <button type="button" className="bb-tab" onClick={logout}>
              <span className="bb-tab-emoji">👋</span>
              <span>Out</span>
            </button>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
