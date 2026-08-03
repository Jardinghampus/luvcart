import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/** Shared gate for /slideshow + /demo */
export const VAULT_PASSWORD =
  process.env.SLIDESHOW_PASSWORD || process.env.ADMIN_PASSWORD || "Gamlastan24";

const SLIDESHOW_COOKIE = "bb_slideshow";
const DEMO_COOKIE = "lc_demo";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "luvcart-local-dev-secret-change-me"
  );
}

export function checkVaultPassword(input: string) {
  return input === VAULT_PASSWORD;
}

async function setGateCookie(name: string, claim: "slideshow" | "demo") {
  const token = await new SignJWT({ [claim]: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());

  const jar = await cookies();
  jar.set(name, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

async function clearGateCookie(name: string) {
  const jar = await cookies();
  jar.delete(name);
}

async function hasClaim(name: string, key: "slideshow" | "demo") {
  const jar = await cookies();
  const token = jar.get(name)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload[key] === true;
  } catch {
    return false;
  }
}

export async function unlockSlideshow() {
  await setGateCookie(SLIDESHOW_COOKIE, "slideshow");
}

export async function lockSlideshow() {
  await clearGateCookie(SLIDESHOW_COOKIE);
}

export async function isSlideshowUnlocked() {
  return hasClaim(SLIDESHOW_COOKIE, "slideshow");
}

export function checkSlideshowPassword(input: string) {
  return checkVaultPassword(input);
}

export function getSlideshowPassword() {
  return VAULT_PASSWORD;
}

export async function unlockAdmin() {
  await setGateCookie(DEMO_COOKIE, "demo");
}

export async function lockAdmin() {
  await clearGateCookie(DEMO_COOKIE);
}

export async function isAdminUnlocked() {
  return hasClaim(DEMO_COOKIE, "demo");
}

export function checkAdminPassword(input: string) {
  return checkVaultPassword(input);
}

export function getAdminPassword() {
  return VAULT_PASSWORD;
}
