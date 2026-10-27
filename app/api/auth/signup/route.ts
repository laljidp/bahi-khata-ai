import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { hashPassword, signSessionToken, AUTH_COOKIE_NAME } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shopName, phone, email, password } = body;

    const trimmedShopName = typeof shopName === "string" ? shopName.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.replace(/[\s-]/g, "").trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!trimmedShopName) {
      return NextResponse.json(
        { error: "Shop name is required" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
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

    const passwordHash = await hashPassword(cleanPassword);
    const { existing, user } = await withRlsContext(
      {
        authOperation: "signup",
        authEmail: cleanEmail,
        authPhone: cleanPhone,
      },
      async (tx) => {
        const existing = await tx.user.findFirst({
          where: {
            OR: [{ email: cleanEmail }, { phone: cleanPhone }],
          },
        });
        if (existing) {
          return { existing, user: null };
        }

        const user = await tx.user.create({
          data: {
            shopName: trimmedShopName,
            phone: cleanPhone,
            email: cleanEmail,
            passwordHash,
          },
          select: {
            id: true,
            shopName: true,
            phone: true,
            email: true,
            sessionVersion: true,
          },
        });
        return { existing: null, user };
      }
    );

    if (existing?.email === cleanEmail) {
      return NextResponse.json(
        { error: "An account with this email address is already registered. Please log in." },
        { status: 409 }
      );
    }
    if (existing?.phone === cleanPhone) {
      return NextResponse.json(
        { error: "A shop with this phone number is already registered. Please log in." },
        { status: 409 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unable to create account. Please try again." },
        { status: 500 }
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

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please check database connection." },
      { status: 500 }
    );
  }
}
