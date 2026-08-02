import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { createItem, getItemsForUser } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await getItemsForUser(session.userId);
  return NextResponse.json({ items });
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(80),
  note: z.string().trim().max(240).optional(),
  photoUrl: z.string().nullable().optional(),
  spicy: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Item needs a title" }, { status: 400 });
    }

    const item = await createItem({
      userId: session.userId,
      title: parsed.data.title,
      note: parsed.data.note,
      photoUrl: parsed.data.photoUrl,
      spicy: parsed.data.spicy,
    });

    return NextResponse.json({ item });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Could not create item" }, { status: 500 });
  }
}
