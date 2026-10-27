import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const genericResponse = {
  message: "If an account exists for that email, a reset code has been sent.",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(genericResponse);
    }

    const existingCode = await prisma.passwordResetCode.findUnique({
      where: { userId: user.id },
    });
    if (
      existingCode &&
      Date.now() - existingCode.createdAt.getTime() < 60_000
    ) {
      return NextResponse.json(genericResponse);
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const codeHash = await hashPassword(code);
    await prisma.passwordResetCode.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
      update: {
        codeHash,
        expiresAt: new Date(Date.now() + 10 * 60_000),
        attempts: 0,
        createdAt: new Date(),
      },
    });

    try {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL;
      if (!apiKey || !from) {
        throw new Error("Resend email configuration is missing");
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [email],
          subject: "Your Bahi Khata password reset code",
          text: `Your password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        }),
      });

      if (!response.ok) {
        console.error("Password reset email delivery failed:", response.status);
        throw new Error("Password reset email delivery failed");
      }
    } catch (error) {
      await prisma.passwordResetCode.deleteMany({
        where: { userId: user.id, codeHash },
      });
      throw error;
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Unable to send a reset code right now. Please try again later." },
      { status: 503 }
    );
  }
}
