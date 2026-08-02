import { NextResponse } from "next/server";
import {
  checkSlideshowPassword,
  isSlideshowUnlocked,
  lockSlideshow,
  unlockSlideshow,
} from "@/lib/slideshow-auth";

export async function GET() {
  return NextResponse.json({ unlocked: await isSlideshowUnlocked() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!checkSlideshowPassword(password)) {
    return NextResponse.json({ error: "Wrong password, darling." }, { status: 401 });
  }
  await unlockSlideshow();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await lockSlideshow();
  return NextResponse.json({ ok: true });
}
