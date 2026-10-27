import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const customers = await withRlsContext({ userId: user.id }, (tx) =>
      tx.customer.findMany({
        where: { userId: user.id },
        include: {
          entries: {
            orderBy: { date: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    );

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || undefined,
      entries: c.entries.map((e) => ({
        id: e.id,
        amount: e.amount,
        type: e.type as "credit" | "payment",
        date: e.date.toISOString(),
        notes: e.notes || undefined,
      })),
    }));

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone } = body;

    const trimmedName = typeof name === "string" ? name.trim() : "";
    const cleanPhone = typeof phone === "string" ? phone.trim() : undefined;

    if (!trimmedName) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    const created = await withRlsContext({ userId: user.id }, (tx) =>
      tx.customer.create({
        data: {
          name: trimmedName,
          phone: cleanPhone || null,
          userId: user.id,
        },
        include: {
          entries: true,
        },
      })
    );

    return NextResponse.json({
      customer: {
        id: created.id,
        name: created.name,
        phone: created.phone || undefined,
        entries: [],
      },
    });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
