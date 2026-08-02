#!/usr/bin/env node
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

const usersPath = path.join("data", "users.json");
const itemsPath = path.join("data", "items.json");

let users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
users = users.filter((u) => u.username.toLowerCase() !== "berryberryberry");

const id = nanoid();
const shareToken = nanoid(16);
const passwordHash = bcrypt.hashSync("berryberry", 10);

const user = {
  id,
  username: "berryberryberry",
  passwordHash,
  shareToken,
  displayName: "Berry Berry Berry",
  createdAt: new Date().toISOString(),
};

users.push(user);
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

let items = JSON.parse(fs.readFileSync(itemsPath, "utf8"));
items = items.filter((i) => i.userId !== id);

const now = new Date().toISOString();
const seed = [
  { title: "🫐 blueberries", note: "the tiny sweet ones", checked: false, spicy: false },
  { title: "🍓 strawberries", note: "heart-shaped vibes", checked: false, spicy: false },
  { title: "🌸 oat milk", note: "barista cute", checked: true, spicy: false },
  { title: "🌶️ pink lemonade", note: "shh… spicy sip", checked: false, spicy: true },
  { title: "🧁 vanilla yogurt", note: "soft girl breakfast", checked: false, spicy: false },
].map((x, i) => ({
  id: nanoid(),
  userId: id,
  title: x.title,
  note: x.note,
  photoUrl: null,
  checked: x.checked,
  spicy: x.spicy,
  sortOrder: i,
  createdAt: now,
  updatedAt: now,
}));

items.push(...seed);
fs.writeFileSync(itemsPath, JSON.stringify(items, null, 2));

console.log("Seeded Berry Berry Berry");
console.log({ username: user.username, password: "berryberry", share: `/v/${shareToken}` });
