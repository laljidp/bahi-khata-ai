import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { withRlsContext } from "./rls";

export const AUTH_COOKIE_NAME = "bahi_khata_session";

const secretText =
  process.env.JWT_SECRET ||
  "bahi_khata_$$_$ecret_$et_jwt_$ecret_in_env_file_32char$";
const JWT_SECRET = new TextEncoder().encode(secretText);

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export interface SessionPayload {
  userId: string;
  phone: string;
  shopName: string;
  sessionVersion: number;
}

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.userId || !payload.phone || !payload.shopName) {
      return null;
    }
    const sessionVersion =
      typeof payload.sessionVersion === "number" ? payload.sessionVersion : 0;
    return {
      userId: payload.userId as string,
      phone: payload.phone as string,
      shopName: payload.shopName as string,
      sessionVersion,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session) return null;

    const user = await withRlsContext({ userId: session.userId }, (tx) =>
      tx.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          shopName: true,
          phone: true,
          email: true,
          sessionVersion: true,
        },
      })
    );

    return user?.sessionVersion === session.sessionVersion ? user : null;
  } catch {
    return null;
  }
}
