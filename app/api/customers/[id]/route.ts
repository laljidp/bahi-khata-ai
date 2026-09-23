import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone } = body;

    const trimmedName = typeof name === "string" ? name.trim() : undefined;
    const cleanPhone = typeof phone === "string" ? phone.trim() : undefined;

    const existing = await prisma.customer.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(trimmedName ? { name: trimmedName } : {}),
        phone: cleanPhone !== undefined ? (cleanPhone || null) : existing.phone,
      },
      include: {
        entries: {
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json({
      customer: {
        id: updated.id,
        name: updated.name,
        phone: updated.phone || undefined,
        entries: updated.entries.map((e) => ({
          id: e.id,
          amount: e.amount,
          type: e.type as "credit" | "payment",
          date: e.date.toISOString(),
          notes: e.notes || undefined,
        })),
      },
    });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.customer.findFirst({
      where: { id: params.id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
