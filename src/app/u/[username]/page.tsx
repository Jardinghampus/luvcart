import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PhotoExplorer } from "@/components/PhotoExplorer";
import { findUserByUsername, getItemsForUser } from "@/lib/db";
import { toPublicUser } from "@/lib/auth";

type Props = { params: Promise<{ username: string }> };

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await findUserByUsername(username);
  if (!user) notFound();

  const items = await getItemsForUser(user.id);

  return (
    <AppShell
      title={`${user.displayName}'s Photos`}
      pathLabel={`C:\\USERS\\${user.username.toUpperCase()}\\PHOTOS`}
      showNav={false}
    >
      <PhotoExplorer initialItems={items} user={toPublicUser(user)} readOnly />
    </AppShell>
  );
}
