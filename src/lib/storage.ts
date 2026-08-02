import { put, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function useBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadPhoto(file: File): Promise<string> {
  const ext = path.extname(file.name || "") || ".jpg";
  const safeExt = ext.slice(0, 8);
  const filename = `${nanoid()}${safeExt}`;

  if (useBlob()) {
    const blob = await put(`blueberrydating/${filename}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  await fs.mkdir(LOCAL_UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(LOCAL_UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
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
