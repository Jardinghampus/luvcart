import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { storageMode, uploadPhoto } from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No photo attached" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Max photo size is 8MB" }, { status: 400 });
    }

    const url = await uploadPhoto(file, { userId: session.userId });
    return NextResponse.json({ url, storage: storageMode() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
