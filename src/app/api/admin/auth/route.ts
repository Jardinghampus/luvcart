import { NextResponse } from "next/server";
import {
  checkAdminPassword,
  isAdminUnlocked,
  lockAdmin,
  unlockAdmin,
} from "@/lib/admin-auth";

export async function GET() {
  return NextResponse.json({ unlocked: await isAdminUnlocked() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";
  if (!checkAdminPassword(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  await unlockAdmin();
  return NextResponse.json({ unlocked: true });
}

export async function DELETE() {
  await lockAdmin();
  return NextResponse.json({ unlocked: false });
}
