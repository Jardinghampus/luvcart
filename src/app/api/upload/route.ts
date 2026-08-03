import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storageMode, uploadPhoto } from "@/lib/storage";

function isImageFile(file: File) {
  if (file.type.startsWith("image/")) return true;
  // iPhone sometimes sends empty MIME — fall back to extension
  return /\.(jpe?g|png|gif|webp|heic|heif|avif)$/i.test(file.name || "");
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const raw = form.get("file");
    let file: File | null = null;
    if (raw instanceof File) {
      file = raw;
    } else if (raw && typeof raw === "object" && "arrayBuffer" in raw && "size" in raw) {
      const blob = raw as Blob;
      file = new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" });
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No photo attached" }, { status: 400 });
    }

    if (!isImageFile(file)) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Max photo size is 8MB" }, { status: 400 });
    }

    const url = await uploadPhoto(file, { userId: session.userId });
    return NextResponse.json({ url, storage: storageMode() });
  } catch (err) {
    console.error("upload failed", err);
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json(
      {
        error: message.includes("private store")
          ? "Blob store is private — use a public store for photo uploads"
          : "Upload failed",
        detail: process.env.NODE_ENV === "development" ? message : undefined,
      },
      { status: 500 }
    );
  }
}
