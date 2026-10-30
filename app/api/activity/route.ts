import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/lib/auth";
import { withRlsContext } from "@/app/lib/rls";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = new URL(req.url).searchParams;
  const page = Math.max(1, Number.parseInt(params.get("page") || "1", 10) || 1);
  const requestedSize = Number.parseInt(params.get("pageSize") || String(DEFAULT_PAGE_SIZE), 10);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, requestedSize || DEFAULT_PAGE_SIZE));

  try {
    const result = await withRlsContext({ userId: user.id }, async (tx) => {
      const where = { customer: { userId: user.id } };
      const [total, entries] = await Promise.all([
        tx.entry.count({ where }),
        tx.entry.findMany({
          where,
          orderBy: [{ date: "desc" }, { id: "desc" }],
          skip: (page - 1) * pageSize,
          take: pageSize,
          select: {
            id: true,
            customerId: true,
            amount: true,
            type: true,
            date: true,
            notes: true,
            customer: { select: { name: true } },
          },
        }),
      ]);
      return { total, entries };
    });

    return NextResponse.json({
      entries: result.entries.map((entry) => ({
        id: entry.id,
        customerId: entry.customerId,
        customerName: entry.customer.name,
        amount: entry.amount,
        type: entry.type,
        date: entry.date.toISOString(),
        notes: entry.notes || undefined,
      })),
      pagination: {
        page,
        pageSize,
        total: result.total,
        totalPages: Math.ceil(result.total / pageSize),
      },
    });
  } catch (error) {
    console.error("Fetch activity error:", error);
    return NextResponse.json({ error: "Failed to fetch recent activity" }, { status: 500 });
  }
}
