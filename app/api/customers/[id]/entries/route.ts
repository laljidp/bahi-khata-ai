import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const body = await req.json();
    const { amount, type, date, notes } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (type !== "credit" && type !== "payment") {
      return NextResponse.json(
        { error: "Invalid entry type" },
        { status: 400 }
      );
    }

    const parsedDate = date ? new Date(date) : new Date();

    const entry = await prisma.entry.create({
      data: {
        amount: numAmount,
        type,
        date: isNaN(parsedDate.getTime()) ? new Date() : parsedDate,
        notes: typeof notes === "string" ? notes.trim() || null : null,
        customerId: customer.id,
      },
    });

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
      { status: 500 }
    );
  }
}
