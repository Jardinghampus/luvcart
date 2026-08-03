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
      statusLeft="welcome · coquette drive · windows 94"
    >
      <div className="lc-landing">
        <section className="lc-hero-card">
          <p className="lc-kicker">WINDOWS 94 · COQUETTE DRIVE</p>
          <h1>Luvcart</h1>
          <p>
            Private polaroid folders for soft selfies &amp; spicy peeks. Incognito to the web.
            Share only with him.
          </p>
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

        <p className="lc-section-title">Quick open</p>
        <div className="lc-folder-row">
          <Link
            href={session ? "/my?folder=selfies" : "/login"}
            className="lc-folder-btn is-active"
          >
            <span className="lc-folder-emoji">💄</span>
            <span className="lc-folder-label">Selfies</span>
          </Link>
          <Link
            href={session ? "/my?folder=vacation" : "/login"}
            className="lc-folder-btn"
          >
            <span className="lc-folder-emoji">🌴</span>
            <span className="lc-folder-label">Vacation</span>
          </Link>
          <Link href={session ? "/my?folder=food" : "/login"} className="lc-folder-btn">
            <span className="lc-folder-emoji">🍕</span>
            <span className="lc-folder-label">Food</span>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
