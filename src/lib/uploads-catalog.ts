import { list } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { getItems } from "./db";

export type UploadEntry = {
  id: string;
  url: string;
  source: "blob" | "local" | "item";
  pathname?: string;
  title?: string;
  spicy?: boolean;
  username?: string;
  uploadedAt?: string;
  size?: number;
};

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function listAllUploads(): Promise<UploadEntry[]> {
  const byUrl = new Map<string, UploadEntry>();

  const items = await getItems();
  for (const item of items) {
    if (!item.photoUrl) continue;
    byUrl.set(item.photoUrl, {
      id: `item-${item.id}`,
      url: item.photoUrl,
      source: "item",
      title: item.title,
      spicy: Boolean(item.spicy),
      uploadedAt: item.updatedAt || item.createdAt,
    });
  }

  try {
    const files = await fs.readdir(LOCAL_UPLOAD_DIR);
    for (const name of files) {
      if (name.startsWith(".")) continue;
      const url = `/uploads/${name}`;
      const stat = await fs.stat(path.join(LOCAL_UPLOAD_DIR, name));
      if (!byUrl.has(url)) {
        byUrl.set(url, {
          id: `local-${name}`,
          url,
          source: "local",
          pathname: name,
          uploadedAt: stat.mtime.toISOString(),
          size: stat.size,
        });
      }
    }
  } catch {
    // no local uploads folder
  }

  if (useBlob()) {
    try {
      let cursor: string | undefined;
      do {
        const page = await list({
          prefix: "blueberrydating/",
          cursor,
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        for (const blob of page.blobs) {
          if (blob.pathname.includes("/data/")) continue;
          const existing = byUrl.get(blob.url);
          byUrl.set(blob.url, {
            id: existing?.id || `blob-${blob.pathname}`,
            url: blob.url,
            source: "blob",
            pathname: blob.pathname,
            title: existing?.title,
            spicy: existing?.spicy,
            uploadedAt:
              blob.uploadedAt instanceof Date
                ? blob.uploadedAt.toISOString()
                : blob.uploadedAt
                  ? String(blob.uploadedAt)
                  : existing?.uploadedAt,
            size: blob.size,
          });
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
    } catch (err) {
      console.error("blob list failed", err);
    }
  }

  return [...byUrl.values()].sort((a, b) =>
    (b.uploadedAt || "").localeCompare(a.uploadedAt || "")
  );
}

export { useBlob as storageUsesBlob };
