import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { comparePassword, signSessionToken, AUTH_COOKIE_NAME } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || !cleanPassword) {
      return NextResponse.json(
        { error: "A valid email address and password are required" },
        { status: 400 }
      );
    }

    const user = await withRlsContext(
      { authOperation: "login", authEmail: cleanEmail },
      (tx) => tx.user.findUnique({ where: { email: cleanEmail } })
    );

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isValid = await comparePassword(cleanPassword, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password or PIN" },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: user.id,
      phone: user.phone,
      shopName: user.shopName,
      sessionVersion: user.sessionVersion,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        shopName: user.shopName,
        phone: user.phone,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in. Please check database connection." },
      { status: 500 }
    );
  }
}
