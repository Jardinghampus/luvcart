import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "bb_slideshow";
const PASSWORD = process.env.SLIDESHOW_PASSWORD || "Gamlastan24";

function secret() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "blueberry-local-dev-secret-change-me"
  );
}

export function getSlideshowPassword() {
  return PASSWORD;
}

export async function unlockSlideshow() {
  const token = await new SignJWT({ slideshow: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
}

export async function lockSlideshow() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isSlideshowUnlocked() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload.slideshow === true;
  } catch {
    return false;
  }
}

export function checkSlideshowPassword(input: string) {
  return input === PASSWORD;
}
