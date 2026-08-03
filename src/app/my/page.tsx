import { redirect } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PhotoExplorer } from "@/components/PhotoExplorer";
import { getSession, toPublicUser } from "@/lib/auth";
import { reconcileUserBlobs } from "@/lib/blob-sync";
import { findUserById, getItemsForUser } from "@/lib/db";
import { folderMeta, type FolderId } from "@/lib/types";

type Props = { searchParams: Promise<{ folder?: string }> };

function parseFolder(value?: string): FolderId {
  if (value === "vacation" || value === "food" || value === "selfies" || value === "secret") {
    return value;
  }
  return "selfies";
}

export default async function MyPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await findUserById(session.userId);
  if (!user) redirect("/login");

  try {
    await reconcileUserBlobs(user.id);
  } catch (err) {
    console.error("blob reconcile failed", err);
  }

  const items = await getItemsForUser(user.id);
  const folder = parseFolder((await searchParams).folder);
  const meta = folderMeta(folder);

  return (
    <AppShell title={`My ${meta.label}`} pathLabel={meta.path} loggedIn>
      <PhotoExplorer
        initialItems={items}
        user={toPublicUser(user)}
        initialFolder={folder}
      />
    </AppShell>
  );
}
