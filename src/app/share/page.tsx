import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ShareProfileCard } from "@/components/ShareProfileCard";
import { getSession, toPublicUser } from "@/lib/auth";
import { findUserById } from "@/lib/db";

export default async function SharePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserById(session.userId);
  if (!user) redirect("/login");

  const publicUser = toPublicUser(user);

  return (
    <AppShell title="Share my profile" pathLabel="C:\\USERS\\GIRL\\SHARE" loggedIn>
      <ShareProfileCard
        username={publicUser.username}
        displayName={publicUser.displayName}
        shareToken={publicUser.shareToken}
      />
    </AppShell>
  );
}
