import { NextResponse } from "next/server";
import { findUserByShareToken, getItemsForUser } from "@/lib/db";

type Params = { params: Promise<{ token: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  const user = await findUserByShareToken(token);
  if (!user) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const items = await getItemsForUser(user.id);
  return NextResponse.json({
    list: {
      displayName: user.displayName,
      username: user.username,
      items: items.map(({ id, title, note, photoUrl, checked, spicy, sortOrder, updatedAt }) => ({
        id,
        title,
        note,
        photoUrl,
        checked,
        spicy,
        sortOrder,
        updatedAt,
      })),
    },
  });
}
