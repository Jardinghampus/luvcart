#!/usr/bin/env node
const bcrypt = require("bcryptjs");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

const usersPath = path.join("data", "users.json");
let users = JSON.parse(fs.readFileSync(usersPath, "utf8"));
users = users.filter((u) => u.username.toLowerCase() !== "demo");

const user = {
  id: nanoid(),
  username: "demo",
  passwordHash: bcrypt.hashSync("1111", 10),
  shareToken: nanoid(16),
  displayName: "Demo",
  createdAt: new Date().toISOString(),
};

users.push(user);
fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
console.log("Seeded demo / 1111", { share: `/v/${user.shareToken}` });
