import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/db";
import { hashPassword, setSessionCookie, toPublicUser } from "@/lib/auth";

const schema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers, underscore only"),
  password: z.string().min(4, "Password must be at least 4 characters").max(72),
  displayName: z.string().trim().max(40).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await createUser({
      username: parsed.data.username,
      passwordHash,
      displayName: parsed.data.displayName,
    });

    await setSessionCookie({ userId: user.id, username: user.username });
    return NextResponse.json({ user: toPublicUser(user) });
  } catch (err) {
    if (err instanceof Error && err.message === "USERNAME_TAKEN") {
      return NextResponse.json({ error: "That username is already taken" }, { status: 409 });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not create account" }, { status: 500 });
  }
}
