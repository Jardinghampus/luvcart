import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { getSession } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();

  return (
    <AppShell
      title="My Photos"
      pathLabel="C:\\USERS\\GIRL\\PHOTOS"
      loggedIn={Boolean(session)}
    >
      <div className="lc-landing">
        <section className="lc-hero-card">
          <p style={{ fontFamily: "var(--font-retro)", fontSize: "0.72rem", color: "#e11d74" }}>
            WINDOWS 94 · COQUETTE DRIVE
          </p>
          <h1>Luvcart</h1>
          <p>your cute photo folders. polaroids, spicy filter, private share.</p>
          <div className="lc-cta-grid">
            {session ? (
              <Link className="lc-cta is-primary" href="/my">
                open my photos 💗
              </Link>
            ) : (
              <>
                <Link className="lc-cta is-primary" href="/signup">
                  join luvcart ✨
                </Link>
                <Link className="lc-cta" href="/login">
                  i already have folders 🍓
                </Link>
              </>
            )}
          </div>
        </section>

        <div className="lc-folder-row">
          <div className="lc-folder-btn is-active">
            <span className="lc-folder-emoji">💄</span>
            <span className="lc-folder-label">Selfies</span>
          </div>
          <div className="lc-folder-btn">
            <span className="lc-folder-emoji">🌴</span>
            <span className="lc-folder-label">Vacation</span>
          </div>
          <div className="lc-folder-btn">
            <span className="lc-folder-emoji">🍕</span>
            <span className="lc-folder-label">Food</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
