import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { getSupabase } from "./supabase";
import type { FolderId, PhotoItem, User } from "./types";
import { TEASER_BLUR_PX } from "./types";

const FOLDER_IDS: FolderId[] = ["selfies", "vacation", "food"];

type ProfileRow = {
  id: string;
  username: string;
  password_hash: string;
  display_name: string;
  share_token: string;
  avatar_url: string | null;
  bio: string | null;
  incognito: boolean | null;
  created_at: string;
};

type PhotoRow = {
  id: string;
  user_id: string;
  title: string;
  note: string | null;
  photo_url: string | null;
  folder: string;
  spicy: boolean | null;
  teaser: boolean | null;
  blur_px: number | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

function normalizeFolder(value: unknown): FolderId {
  if (typeof value === "string" && FOLDER_IDS.includes(value as FolderId)) {
    return value as FolderId;
  }
  return "selfies";
}

function mapUser(row: ProfileRow): User {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    shareToken: row.share_token,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio || "",
    incognito: row.incognito !== false,
    createdAt: row.created_at,
  };
}

function mapPhoto(row: PhotoRow): PhotoItem {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    note: row.note || "",
    photoUrl: row.photo_url,
    folder: normalizeFolder(row.folder),
    checked: false,
    spicy: Boolean(row.spicy),
    teaser: Boolean(row.teaser),
    blurPx: row.blur_px == null ? (row.teaser ? TEASER_BLUR_PX : 0) : Number(row.blur_px),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function ensureDemoUser() {
  const sb = getSupabase();
  const { data: existing } = await sb
    .from("profiles")
    .select("id")
    .eq("username", "demo")
    .maybeSingle();
  if (existing) return;

  await sb.from("profiles").insert({
    id: crypto.randomUUID(),
    username: "demo",
    password_hash: await bcrypt.hash("1111", 10),
    display_name: "Demo",
    share_token: nanoid(16),
    avatar_url: null,
    bio: "soft girl drive · private peeks only",
    incognito: true,
  });
}

export async function getUsers(): Promise<User[]> {
  await ensureDemoUser();
  const { data, error } = await getSupabase().from("profiles").select("*");
  if (error) throw error;
  return (data as ProfileRow[]).map(mapUser);
}

export async function findUserByUsername(username: string) {
  await ensureDemoUser();
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .ilike("username", username)
    .maybeSingle();
  if (error) throw error;
  return data ? mapUser(data as ProfileRow) : null;
}

export async function findUserById(id: string) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapUser(data as ProfileRow) : null;
}

export async function findUserByShareToken(token: string) {
  const { data, error } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("share_token", token)
    .maybeSingle();
  if (error) throw error;
  return data ? mapUser(data as ProfileRow) : null;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  displayName?: string;
}) {
  const taken = await findUserByUsername(input.username);
  if (taken) throw new Error("USERNAME_TAKEN");

  const row = {
    id: crypto.randomUUID(),
    username: input.username.trim(),
    password_hash: input.passwordHash,
    display_name: input.displayName?.trim() || input.username.trim(),
    share_token: nanoid(16),
    avatar_url: null,
    bio: "",
    incognito: true,
  };

  const { data, error } = await getSupabase().from("profiles").insert(row).select("*").single();
  if (error) throw error;
  return mapUser(data as ProfileRow);
}

export async function updateUser(
  userId: string,
  patch: Partial<Pick<User, "displayName" | "avatarUrl" | "bio" | "incognito">>
) {
  const payload: Record<string, unknown> = {};
  if (patch.displayName !== undefined) payload.display_name = patch.displayName;
  if (patch.avatarUrl !== undefined) payload.avatar_url = patch.avatarUrl;
  if (patch.bio !== undefined) payload.bio = patch.bio;
  if (patch.incognito !== undefined) payload.incognito = patch.incognito;

  const { data, error } = await getSupabase()
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return mapUser(data as ProfileRow);
}

export async function rotateShareToken(userId: string) {
  const nextToken = nanoid(16);
  const { data, error } = await getSupabase()
    .from("profiles")
    .update({ share_token: nextToken })
    .eq("id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return mapUser(data as ProfileRow);
}

export async function getItems(): Promise<PhotoItem[]> {
  const { data, error } = await getSupabase().from("photos").select("*");
  if (error) throw error;
  return (data as PhotoRow[]).map(mapPhoto);
}

export async function getItemsForUser(userId: string) {
  const { data, error } = await getSupabase()
    .from("photos")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as PhotoRow[]).map(mapPhoto);
}

export async function createItem(input: {
  userId: string;
  title: string;
  note?: string;
  photoUrl?: string | null;
  spicy?: boolean;
  teaser?: boolean;
  blurPx?: number;
  folder?: FolderId;
}) {
  const existing = await getItemsForUser(input.userId);
  const maxOrder = existing.reduce((m, i) => Math.max(m, i.sortOrder), -1);
  const teaser = Boolean(input.teaser);
  const blurPx =
    input.blurPx != null ? input.blurPx : teaser ? TEASER_BLUR_PX : 0;

  const { data, error } = await getSupabase()
    .from("photos")
    .insert({
      id: crypto.randomUUID(),
      user_id: input.userId,
      title: input.title.trim(),
      note: input.note?.trim() || "",
      photo_url: input.photoUrl ?? null,
      folder: normalizeFolder(input.folder),
      spicy: Boolean(input.spicy),
      teaser,
      blur_px: blurPx,
      sort_order: maxOrder + 1,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapPhoto(data as PhotoRow);
}

export async function updateItem(
  itemId: string,
  userId: string,
  patch: Partial<
    Pick<
      PhotoItem,
      "title" | "note" | "photoUrl" | "checked" | "spicy" | "teaser" | "blurPx" | "folder" | "sortOrder"
    >
  >
) {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (patch.title !== undefined) payload.title = patch.title;
  if (patch.note !== undefined) payload.note = patch.note;
  if (patch.photoUrl !== undefined) payload.photo_url = patch.photoUrl;
  if (patch.spicy !== undefined) payload.spicy = patch.spicy;
  if (patch.teaser !== undefined) {
    payload.teaser = patch.teaser;
    if (patch.blurPx === undefined) {
      payload.blur_px = patch.teaser ? TEASER_BLUR_PX : 0;
    }
  }
  if (patch.blurPx !== undefined) payload.blur_px = patch.blurPx;
  if (patch.folder !== undefined) payload.folder = patch.folder;
  if (patch.sortOrder !== undefined) payload.sort_order = patch.sortOrder;

  const { data, error } = await getSupabase()
    .from("photos")
    .update(payload)
    .eq("id", itemId)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? mapPhoto(data as PhotoRow) : null;
}

export async function deleteItem(itemId: string, userId: string) {
  const { data, error } = await getSupabase()
    .from("photos")
    .delete()
    .eq("id", itemId)
    .eq("user_id", userId)
    .select("id");
  if (error) throw error;
  return Boolean(data?.length);
}
