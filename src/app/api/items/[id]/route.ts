import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { deleteItem, getItemsForUser, updateItem } from "@/lib/db";
import { deletePhoto } from "@/lib/storage";

const patchSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  note: z.string().trim().max(240).optional(),
  photoUrl: z.string().nullable().optional(),
  checked: z.boolean().optional(),
  spicy: z.boolean().optional(),
  teaser: z.boolean().optional(),
  blurPx: z.number().min(0).max(24).optional(),
  folder: z.enum(["selfies", "vacation", "food", "secret"]).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update" }, { status: 400 });
  }

  const existing = (await getItemsForUser(session.userId)).find((i) => i.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    parsed.data.photoUrl !== undefined &&
    existing.photoUrl &&
    parsed.data.photoUrl !== existing.photoUrl
  ) {
    await deletePhoto(existing.photoUrl);
  }

  const item = await updateItem(id, session.userId, parsed.data);
  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = (await getItemsForUser(session.userId)).find((i) => i.id === id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deletePhoto(existing.photoUrl);
  await deleteItem(id, session.userId);
  return NextResponse.json({ ok: true });
}
