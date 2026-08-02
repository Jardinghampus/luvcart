import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ReadOnlyList } from "@/components/ReadOnlyList";
import { findUserByShareToken, getItemsForUser } from "@/lib/db";

type Props = { params: Promise<{ token: string }> };

export default async function ViewPage({ params }: Props) {
  const { token } = await params;
  const user = await findUserByShareToken(token);
  if (!user) notFound();

  const items = await getItemsForUser(user.id);

  return (
    <AppShell title="Luvcart" subtitle="guest peek 👁" showNav={false}>
      <ReadOnlyList displayName={user.displayName} items={items} />
    </AppShell>
  );
}
