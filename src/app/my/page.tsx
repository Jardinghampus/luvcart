import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { GroceryManager } from "@/components/GroceryManager";
import { getSession, toPublicUser } from "@/lib/auth";
import { findUserById, getItemsForUser } from "@/lib/db";

export default async function MyPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserById(session.userId);
  if (!user) redirect("/login");

  const items = await getItemsForUser(user.id);

  return (
    <AppShell subtitle={`@${user.username} 💗`} loggedIn largeTitle="mine">
      <GroceryManager initialItems={items} user={toPublicUser(user)} />
    </AppShell>
  );
}
