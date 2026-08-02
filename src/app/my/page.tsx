import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PhotoExplorer } from "@/components/PhotoExplorer";
import { getSession, toPublicUser } from "@/lib/auth";
import { findUserById, getItemsForUser } from "@/lib/db";
import { folderMeta } from "@/lib/types";

export default async function MyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserById(session.userId);
  if (!user) redirect("/login");

  const items = await getItemsForUser(user.id);
  const path = folderMeta("selfies").path;

  return (
    <AppShell title="My Selfies" pathLabel={path} loggedIn>
      <PhotoExplorer initialItems={items} user={toPublicUser(user)} />
    </AppShell>
  );
}
