import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { LuvcartIcon, StickerRow } from "@/components/CuteIcons";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <AppShell subtitle="luv soft ✨" loggedIn={Boolean(session)}>
      <section className="bb-landing">
        <div className="bb-landing-glow" aria-hidden />
        <StickerRow />

        <div className="bb-brand-block">
          <div className="bb-brand-mark">
            <LuvcartIcon size={22} />
            soft mode on
          </div>

          <h1 className="bb-brand-name">Luvcart</h1>

          <p className="bb-brand-line">cute little cart. pink & private. just for you 💕</p>

          <div className="bb-chip-row" aria-hidden>
            <span className="bb-emoji-chip">🛒 luv</span>
            <span className="bb-emoji-chip">🎀 girly</span>
            <span className="bb-emoji-chip">🔒 safe</span>
            <span className="bb-emoji-chip">✨ sparkle</span>
          </div>

          <div className="bb-cta-grid">
            {session ? (
              <Link className="bb-btn bb-btn-primary" href="/my">
                open mine 💗
              </Link>
            ) : (
              <>
                <Link className="bb-btn bb-btn-primary" href="/signup">
                  join luvcart ✨
                </Link>
                <Link className="bb-btn bb-btn-soft" href="/login">
                  i already shop here 🍓
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
