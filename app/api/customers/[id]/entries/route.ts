import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, type, date, notes } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 },
      );
    }

    if (type !== "credit" && type !== "payment") {
      return NextResponse.json(
        { error: "Invalid entry type" },
        { status: 400 },
      );
    }

    const parsedDate = date ? new Date(date) : new Date();
    const entry = await withRlsContext({ userId: user.id }, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!customer) return null;

      return tx.entry.create({
        data: {
          amount: numAmount,
          type,
          date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
          notes: typeof notes === "string" ? notes.trim() || null : null,
          customerId: customer.id,
        },
      });
    });

    if (!entry) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      entry: {
        id: entry.id,
        amount: entry.amount,
        type: entry.type as "credit" | "payment",
        date: entry.date.toISOString(),
        notes: entry.notes || undefined,
      },
    });
  } catch (error) {
    console.error("Create entry error:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 },
    );
  }
}
