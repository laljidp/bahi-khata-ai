import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { comparePassword, signSessionToken, AUTH_COOKIE_NAME } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, password } = body;

    const cleanPhone = typeof phone === "string" ? phone.replace(/[\s-]/g, "").trim() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!cleanPhone || !cleanPassword) {
      return NextResponse.json(
        { error: "Phone number and password are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this phone number" },
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
