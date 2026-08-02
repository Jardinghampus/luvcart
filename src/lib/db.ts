import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import type { GroceryItem, User } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const ITEMS_FILE = path.join(DATA_DIR, "items.json");

let seedPromise: Promise<void> | null = null;

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
  try {
    await fs.access(ITEMS_FILE);
  } catch {
    await fs.writeFile(ITEMS_FILE, "[]", "utf8");
  }
}

async function readJson<T>(file: string): Promise<T> {
  await ensureDataFiles();
  const raw = await fs.readFile(file, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJson<T>(file: string, data: T) {
  await ensureDataFiles();
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

async function ensureDemoUser() {
  if (!seedPromise) {
    seedPromise = (async () => {
      const users = await readJson<User[]>(USERS_FILE);
      if (users.some((u) => u.username.toLowerCase() === "demo")) return;
      users.push({
        id: nanoid(),
        username: "demo",
        passwordHash: await bcrypt.hash("1111", 10),
        shareToken: nanoid(16),
        displayName: "Demo",
        createdAt: new Date().toISOString(),
      });
      await writeJson(USERS_FILE, users);
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

export async function getUsers(): Promise<User[]> {
  await ensureDemoUser();
  return readJson<User[]>(USERS_FILE);
}

export async function saveUsers(users: User[]) {
  await writeJson(USERS_FILE, users);
}

export async function getItems(): Promise<GroceryItem[]> {
  const items = await readJson<GroceryItem[]>(ITEMS_FILE);
  return items.map((item) => ({
    ...item,
    spicy: Boolean(item.spicy),
  }));
}

export async function saveItems(items: GroceryItem[]) {
  await writeJson(ITEMS_FILE, items);
}

export async function findUserByUsername(username: string) {
  const users = await getUsers();
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function findUserById(id: string) {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}

export async function findUserByShareToken(token: string) {
  const users = await getUsers();
  return users.find((u) => u.shareToken === token);
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  displayName?: string;
}) {
  const users = await getUsers();
  if (users.some((u) => u.username.toLowerCase() === input.username.toLowerCase())) {
    throw new Error("USERNAME_TAKEN");
  }

  const user: User = {
    id: nanoid(),
    username: input.username.trim(),
    passwordHash: input.passwordHash,
    shareToken: nanoid(16),
    displayName: input.displayName?.trim() || input.username.trim(),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await saveUsers(users);
  return user;
}

export async function getItemsForUser(userId: string) {
  const items = await getItems();
  return items
    .filter((i) => i.userId === userId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

export async function createItem(input: {
  userId: string;
  title: string;
  note?: string;
  photoUrl?: string | null;
  spicy?: boolean;
}) {
  const items = await getItems();
  const userItems = items.filter((i) => i.userId === input.userId);
  const maxOrder = userItems.reduce((m, i) => Math.max(m, i.sortOrder), -1);

  const item: GroceryItem = {
    id: nanoid(),
    userId: input.userId,
    title: input.title.trim(),
    note: input.note?.trim() || "",
    photoUrl: input.photoUrl ?? null,
    checked: false,
    spicy: Boolean(input.spicy),
    sortOrder: maxOrder + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  items.push(item);
  await saveItems(items);
  return item;
}

export async function updateItem(
  itemId: string,
  userId: string,
  patch: Partial<
    Pick<GroceryItem, "title" | "note" | "photoUrl" | "checked" | "spicy" | "sortOrder">
  >
) {
  const items = await getItems();
  const index = items.findIndex((i) => i.id === itemId && i.userId === userId);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await saveItems(items);
  return items[index];
}

export async function deleteItem(itemId: string, userId: string) {
  const items = await getItems();
  const next = items.filter((i) => !(i.id === itemId && i.userId === userId));
  if (next.length === items.length) return false;
  await saveItems(next);
  return true;
}
