import { NextResponse } from "next/server";
import {
  comparePassword,
  hashPassword,
} from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

const invalidCodeMessage = "Invalid or expired reset code";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const password = typeof body.password === "string" ? body.password.trim() : "";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: invalidCodeMessage }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json(
        { error: "Password or PIN must be at least 4 characters" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    const resetCode = user
      ? await prisma.passwordResetCode.findUnique({ where: { userId: user.id } })
      : null;

    if (
      !user ||
      !resetCode ||
      resetCode.expiresAt.getTime() <= Date.now() ||
      resetCode.attempts >= 5
    ) {
      if (resetCode && resetCode.attempts >= 5) {
        await prisma.passwordResetCode.delete({ where: { userId: resetCode.userId } });
      }
      return NextResponse.json({ error: invalidCodeMessage }, { status: 400 });
    }

    const matches = await comparePassword(code, resetCode.codeHash);
    if (!matches) {
      const attempts = resetCode.attempts + 1;
      if (attempts >= 5) {
        await prisma.passwordResetCode.delete({ where: { userId: user.id } });
      } else {
        await prisma.passwordResetCode.update({
          where: { userId: user.id },
          data: { attempts },
        });
      }
      return NextResponse.json({ error: invalidCodeMessage }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          sessionVersion: { increment: 1 },
        },
      }),
      prisma.passwordResetCode.delete({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset your password right now. Please try again later." },
      { status: 500 }
    );
  }
}
