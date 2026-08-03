import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { hashPassword } from "@/lib/auth";
import { getItems, getUsers, updateUserPassword } from "@/lib/db";

export async function GET() {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  const [users, photos] = await Promise.all([getUsers(), getItems()]);
  const directory = users
    .map((u) => {
      const userPhotos = photos
        .filter((p) => p.userId === u.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return {
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        password: u.passwordPlain || "",
        shareToken: u.shareToken,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        createdAt: u.createdAt,
        photoCount: userPhotos.length,
        photos: userPhotos.map((p) => ({
          id: p.id,
          title: p.title,
          photoUrl: p.photoUrl,
          folder: p.folder,
          spicy: p.spicy,
          teaser: p.teaser,
          createdAt: p.createdAt,
        })),
      };
    })
    .sort((a, b) => a.username.localeCompare(b.username));

  return NextResponse.json({
    users: directory,
    totals: {
      users: directory.length,
      photos: photos.length,
      withImage: photos.filter((p) => p.photoUrl).length,
    },
  });
}

const resetSchema = z.object({
  userId: z.string().uuid(),
  password: z.string().min(4).max(72),
});

export async function PATCH(request: Request) {
  if (!(await isAdminUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password reset" }, { status: 400 });
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const user = await updateUserPassword(
    parsed.data.userId,
    passwordHash,
    parsed.data.password
  );

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      password: user.passwordPlain,
    },
  });
}
