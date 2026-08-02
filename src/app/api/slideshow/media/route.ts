import { NextResponse } from "next/server";
import { getItems } from "@/lib/db";
import { listAllUploads, storageUsesBlob } from "@/lib/uploads-catalog";
import { isSlideshowUnlocked } from "@/lib/slideshow-auth";

export async function GET() {
  if (!(await isSlideshowUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  const uploads = await listAllUploads();
  const items = await getItems();
  const byUrl = new Map(items.filter((i) => i.photoUrl).map((i) => [i.photoUrl as string, i]));

  const enriched = uploads.map((u) => {
    const item = byUrl.get(u.url);
    return {
      ...u,
      title: u.title || item?.title,
      spicy: u.spicy ?? item?.spicy,
      teaser: item?.teaser,
      blurPx: item?.blurPx,
      folder: item?.folder,
      userId: item?.userId,
    };
  });

  return NextResponse.json({
    uploads: enriched,
    storage: storageUsesBlob() ? "vercel-blob" : "local-disk",
    count: enriched.length,
  });
}
