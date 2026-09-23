import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from "@/app/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shopName, phone, password } = body;

    const trimmedShopName = typeof shopName === "string" ? shopName.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.replace(/[\s-]/g, "").trim() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!trimmedShopName) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      );
    }

    if (!cleanPhone || cleanPhone.length < 6) {
      return NextResponse.json(
        { error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return NextResponse.json(
        { error: "Password or PIN must be at least 4 characters" },
        { status: 400 }
      );
    }

    // Check if phone already registered
    const existing = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A shop with this phone number is already registered. Please log in." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(cleanPassword);
    const user = await prisma.user.create({
      data: {
        shopName: trimmedShopName,
        phone: cleanPhone,
        passwordHash,
      },
      select: {
        id: true,
        shopName: true,
        phone: true,
      },
    });

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

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please check database connection." },
      { status: 500 }
    );
  }
}
