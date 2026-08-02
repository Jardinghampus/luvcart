import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { getSession, toPublicUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";
import Link from "next/link";

export default async function SharePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserById(session.userId);
  if (!user) redirect("/login");

  const publicUser = toPublicUser(user);

  return (
    <AppShell subtitle="share 🎀" loggedIn largeTitle="share soft">
      <div className="bb-stack">
        <section className="bb-sheet">
          <div className="bb-chip-row">
            <span className="bb-emoji-chip">👁 peek</span>
            <span className="bb-emoji-chip">🔒 no edit</span>
            <span className="bb-emoji-chip">💗 yours</span>
          </div>
          <h1 className="bb-h1">send your sparkle ✨</h1>
          <p className="bb-lead">they can look. only you can change things.</p>
          <p className="bb-fineprint" style={{ wordBreak: "break-all" }}>
            /v/{publicUser.shareToken}
          </p>
          <div className="bb-cta-grid" style={{ marginTop: "0.9rem" }}>
            <Link className="bb-btn bb-btn-primary" href={`/v/${publicUser.shareToken}`}>
              preview guest 👁
            </Link>
            <Link className="bb-btn bb-btn-soft" href="/my">
              back to mine 💗
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
