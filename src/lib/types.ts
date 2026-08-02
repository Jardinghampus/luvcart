export type User = {
  id: string;
  username: string;
  passwordHash: string;
  shareToken: string;
  displayName: string;
  createdAt: string;
};

export type GroceryItem = {
  id: string;
  userId: string;
  title: string;
  note: string;
  photoUrl: string | null;
  checked: boolean;
  spicy: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  shareToken: string;
};

export type SessionPayload = {
  userId: string;
  username: string;
};
