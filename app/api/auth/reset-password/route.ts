import { NextResponse } from "next/server";
import {
  comparePassword,
  hashPassword,
} from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

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

    const reset = await withRlsContext(
      { authOperation: "reset_password", authEmail: email },
      async (tx) => {
        const user = await tx.user.findUnique({ where: { email } });
        const resetCode = user
          ? await tx.passwordResetCode.findUnique({ where: { userId: user.id } })
          : null;

        if (!user || !resetCode) {
          return false;
        }
        if (
          resetCode.expiresAt.getTime() <= Date.now() ||
          resetCode.attempts >= 5
        ) {
          await tx.passwordResetCode.delete({ where: { userId: user.id } });
          return false;
        }

        const matches = await comparePassword(code, resetCode.codeHash);
        if (!matches) {
          const attempts = resetCode.attempts + 1;
          if (attempts >= 5) {
            await tx.passwordResetCode.delete({ where: { userId: user.id } });
          } else {
            await tx.passwordResetCode.update({
              where: { userId: user.id },
              data: { attempts },
            });
          }
          return false;
        }

        const passwordHash = await hashPassword(password);
        await tx.user.update({
          where: { id: user.id },
          data: {
            passwordHash,
            sessionVersion: { increment: 1 },
          },
        });
        await tx.passwordResetCode.delete({ where: { userId: user.id } });
        return true;
      }
    );

    if (!reset) {
      return NextResponse.json({ error: invalidCodeMessage }, { status: 400 });
    }

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Unable to reset your password right now. Please try again later." },
      { status: 500 }
    );
  }
}
