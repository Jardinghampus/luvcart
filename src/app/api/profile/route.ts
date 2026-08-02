import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, toPublicUser } from "@/lib/auth";
import { findUserById, updateUser } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null });
  const user = await findUserById(session.userId);
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: toPublicUser(user) });
}

const patchSchema = z.object({
  displayName: z.string().trim().min(1).max(40).optional(),
  bio: z.string().trim().max(160).optional(),
  avatarUrl: z.string().nullable().optional(),
  incognito: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile update" }, { status: 400 });
  }

  const user = await updateUser(session.userId, parsed.data);
  return NextResponse.json({ user: toPublicUser(user) });
}
