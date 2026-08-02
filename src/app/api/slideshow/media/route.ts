import { NextResponse } from "next/server";
import { isSlideshowUnlocked } from "@/lib/slideshow-auth";
import { listAllUploads, storageUsesBlob } from "@/lib/uploads-catalog";

export async function GET() {
  if (!(await isSlideshowUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  const uploads = await listAllUploads();
  return NextResponse.json({
    uploads,
    storage: storageUsesBlob() ? "vercel-blob" : "local-disk",
    count: uploads.length,
  });
}
