import { NextResponse } from "next/server";
import { z } from "zod";
import { findUserByUsername } from "@/lib/db";
import { setSessionCookie, toPublicUser, verifyPassword } from "@/lib/auth";

const schema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const user = await findUserByUsername(parsed.data.username);
    if (!user) {
      return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
    }

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Wrong username or password" }, { status: 401 });
    }

    await setSessionCookie({ userId: user.id, username: user.username });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
