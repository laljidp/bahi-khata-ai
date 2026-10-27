import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string; entryId: string }> },
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, type, date, notes } = body;

    const data: Record<string, unknown> = {};
    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        return NextResponse.json(
          { error: "Amount must be a positive number" },
          { status: 400 },
        );
      }
      data.amount = num;
    }
    if (type !== undefined) {
      if (type !== "credit" && type !== "payment") {
        return NextResponse.json(
          { error: "Invalid entry type" },
          { status: 400 },
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

    const updated = await withRlsContext({ userId: user.id }, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!customer) return null;

      return tx.entry.update({
        where: { id: params.entryId, customerId: customer.id, notes },
        data,
      });
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 },
      );
    }
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
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string; entryId: string }> },
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const deleted = await withRlsContext({ userId: user.id }, async (tx) => {
      const customer = await tx.customer.findFirst({
        where: { id: params.id, userId: user.id },
      });
      if (!customer) return false;

      const result = await tx.entry.deleteMany({
        where: { id: params.entryId, customerId: customer.id },
      });
      return result.count > 0;
    });

    if (!deleted) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete entry error:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 },
    );
  }
}
