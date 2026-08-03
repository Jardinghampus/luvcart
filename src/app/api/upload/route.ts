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
    // On some runtimes `instanceof File` fails — accept Blob-like uploads too.
    const file =
      raw instanceof File
        ? raw
        : raw instanceof Blob
          ? new File([raw], "photo.jpg", { type: raw.type || "image/jpeg" })
          : null;

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
