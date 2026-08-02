import { NextResponse } from "next/server";
import { getSession, toPublicUser } from "@/lib/auth";
import { rotateShareToken } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await rotateShareToken(session.userId);
  return NextResponse.json({
    user: toPublicUser(user),
    message: "Private link spun — old one is gone ✨",
  });
}
