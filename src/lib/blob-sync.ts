import { list } from "@vercel/blob";
import { createItem, getItemsForUser } from "./db";
import { ownerFromPhotoUrl } from "./storage";

/**
 * Recover Blob files under luvcart/{userId}/ that never got a photos row
 * (e.g. upload succeeded but create-item failed). Keeps feed in sync with Blob.
 */
export async function reconcileUserBlobs(userId: string) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return { recovered: 0 };

  const existing = await getItemsForUser(userId);
  const known = new Set(existing.map((i) => i.photoUrl).filter(Boolean) as string[]);

  const orphans: { url: string; uploadedAt?: string }[] = [];
  let cursor: string | undefined;

  do {
    const page = await list({
      prefix: `luvcart/${userId}/`,
      cursor,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    for (const blob of page.blobs) {
      if (known.has(blob.url)) continue;
      const owner = ownerFromPhotoUrl(blob.url);
      if (owner && owner !== userId) continue;
      orphans.push({
        url: blob.url,
        uploadedAt:
          blob.uploadedAt instanceof Date
            ? blob.uploadedAt.toISOString()
            : blob.uploadedAt
              ? String(blob.uploadedAt)
              : undefined,
      });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  let recovered = 0;
  for (const orphan of orphans) {
    const name = orphan.url.split("/").pop()?.split("?")[0] || "recovered";
    await createItem({
      userId,
      title: `recovered · ${name.slice(0, 24)}`,
      note: "auto-synced from Blob ✨",
      photoUrl: orphan.url,
      folder: "selfies",
      teaser: true,
    });
    recovered += 1;
  }

  return { recovered };
}
