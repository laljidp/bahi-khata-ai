import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string; entryId: string }> }
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

    const data: Record<string, unknown> = {};
    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 }
        );
      }
      data.amount = num;
    }
    if (type !== undefined) {
      if (type !== "credit" && type !== "payment") {
        return NextResponse.json(
          { error: "Invalid entry type" },
          { status: 400 }
        );
      }
      data.type = type;
    }
    if (date !== undefined) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        data.date = d;
      }
    }
    if (notes !== undefined) {
      data.notes = typeof notes === "string" ? notes.trim() || null : null;
    }

    const updated = await prisma.entry.update({
      where: { id: params.entryId, customerId: customer.id },
      data,
    });

    return NextResponse.json({
      entry: {
        id: updated.id,
        amount: updated.amount,
        type: updated.type as "credit" | "payment",
        date: updated.date.toISOString(),
        notes: updated.notes || undefined,
      },
    });
  } catch (error) {
    console.error("Update entry error:", error);
    return NextResponse.json(
      { error: "Failed to update entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string; entryId: string }> }
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

    await prisma.entry.delete({
      where: { id: params.entryId, customerId: customer.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete entry error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
