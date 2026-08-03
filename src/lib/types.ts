export type FolderId = "selfies" | "vacation" | "food";

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  /** Admin-only recoverable login secret (not exposed on public APIs). */
  passwordPlain: string;
  shareToken: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string;
  incognito: boolean;
  createdAt: string;
};

export type PhotoItem = {
  id: string;
  userId: string;
  title: string;
  note: string;
  photoUrl: string | null;
  folder: FolderId;
  checked: boolean;
  spicy: boolean;
  teaser: boolean;
  /** Teaser soft blur in px; 0 = sharp */
  blurPx: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

/** @deprecated use PhotoItem */
export type GroceryItem = PhotoItem;

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  shareToken: string;
  avatarUrl: string | null;
  bio: string;
  incognito: boolean;
};

export type SessionPayload = {
  userId: string;
  username: string;
};

export const FOLDERS: {
  id: FolderId;
  label: string;
  emoji: string;
  path: string;
}[] = [
  { id: "selfies", label: "Selfies", emoji: "💄", path: "C:\\USERS\\GIRL\\PHOTOS\\SELFIES" },
  { id: "vacation", label: "Vacation", emoji: "🌴", path: "C:\\USERS\\GIRL\\PHOTOS\\VACATION" },
  { id: "food", label: "Food", emoji: "🍕", path: "C:\\USERS\\GIRL\\PHOTOS\\FOOD" },
];

export function folderMeta(id: FolderId) {
  return FOLDERS.find((f) => f.id === id) || FOLDERS[0];
}

export const TEASER_BLUR_PX = 1;
