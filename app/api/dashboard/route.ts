import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const data = await withRlsContext({ userId: user.id }, async (tx) => {
      const customers = await tx.customer.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          name: true,
          entries: { select: { amount: true, type: true } },
        },
      });
      const recentEntries = await tx.entry.findMany({
        where: { customer: { userId: user.id } },
        orderBy: { date: "desc" },
        take: 6,
        select: {
          id: true,
          customerId: true,
          amount: true,
          type: true,
          date: true,
          notes: true,
          customer: { select: { name: true } },
        },
      });
      return { customers, recentEntries };
    });

    let outstanding = 0;
    let customersWithDues = 0;
    for (const customer of data.customers) {
      const balance = customer.entries.reduce(
        (sum, entry) => sum + (entry.type === "credit" ? entry.amount : -entry.amount),
        0,
      );
      outstanding += Math.max(balance, 0);
      if (balance > 0) customersWithDues++;
    }

    return NextResponse.json({
      dashboard: {
        outstanding,
        customerCount: data.customers.length,
        customersWithDues,
        recent: data.recentEntries.map((entry) => ({
          id: entry.id,
          customerId: entry.customerId,
          customerName: entry.customer.name,
          amount: entry.amount,
          type: entry.type,
          date: entry.date.toISOString(),
          notes: entry.notes || undefined,
        })),
      },
    });
  } catch (error) {
    console.error("Fetch dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
