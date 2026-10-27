import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

type AuthOperation =
  | "signup"
  | "login"
  | "forgot_password"
  | "reset_password";

type RlsContext = {
  userId?: string;
  authOperation?: AuthOperation;
  authEmail?: string;
  authPhone?: string;
};

export async function withRlsContext<T>(
  context: RlsContext,
  callback: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  if (!context.userId && !context.authOperation) {
    throw new Error("An RLS user or auth operation context is required");
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`
      SELECT
        set_config('app.user_id', ${context.userId ?? ""}, true),
        set_config('app.auth_operation', ${context.authOperation ?? ""}, true),
        set_config('app.auth_email', ${context.authEmail ?? ""}, true),
        set_config('app.auth_phone', ${context.authPhone ?? ""}, true)
    `;
    return callback(tx);
  });
}
