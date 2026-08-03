import { put, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadPhoto(
  file: File,
  opts?: { userId?: string }
): Promise<string> {
  const ext = path.extname(file.name || "") || ".jpg";
  const safeExt = ext.slice(0, 8);
  const filename = `${nanoid()}${safeExt}`;
  const owner = opts?.userId?.replace(/[^a-zA-Z0-9_-]/g, "") || "shared";
  const blobPath = `luvcart/${owner}/${filename}`;

  if (useBlob()) {
    const blob = await put(blobPath, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
    });
    return blob.url;
  }

  await fs.mkdir(path.join(LOCAL_UPLOAD_DIR, owner), { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, owner, filename), bytes);
  return `/uploads/${owner}/${filename}`;
}

export async function deletePhoto(url: string | null | undefined) {
  if (!url) return;

  if (useBlob() && url.includes("blob.vercel-storage.com")) {
    try {
      await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      // ignore missing remote files
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore missing local files
    }
  }
}

export function storageMode() {
  return useBlob() ? "vercel-blob" : "local-disk";
}

/** Extract owner folder from luvcart/{userId}/file or /uploads/{userId}/file */
export function ownerFromPhotoUrl(url: string): string | null {
  try {
    const pathname = url.startsWith("http") ? new URL(url).pathname : url;
    const parts = pathname.split("/").filter(Boolean);
    // .../luvcart/{owner}/{file} or uploads/{owner}/{file}
    const luvIdx = parts.findIndex((p) => p === "luvcart" || p === "uploads");
    if (luvIdx >= 0 && parts[luvIdx + 1] && parts[luvIdx + 2]) {
      return parts[luvIdx + 1];
    }
  } catch {
    // ignore
  }
  return null;
}
