import { Router } from "express";
import { db, resumesTable, usersTable, paymentsTable } from "@workspace/db";
import { count, sum, gte, desc } from "drizzle-orm";

const router = Router();

// GET /api/admin/stats
router.get("/admin/stats", async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [[userCount], [resumeCount], [paymentData], [monthlyResumes], [monthlyRevenue]] =
    await Promise.all([
      db.select({ count: count() }).from(usersTable),
      db.select({ count: count() }).from(resumesTable),
      db.select({ count: count(), total: sum(paymentsTable.amount) }).from(paymentsTable),
      db
        .select({ count: count() })
        .from(resumesTable)
        .where(gte(resumesTable.createdAt, startOfMonth)),
      db
        .select({ total: sum(paymentsTable.amount) })
        .from(paymentsTable)
        .where(gte(paymentsTable.createdAt, startOfMonth)),
    ]);

  return res.json({
    totalUsers: userCount?.count ?? 0,
    totalResumes: resumeCount?.count ?? 0,
    totalPayments: paymentData?.count ?? 0,
    totalRevenue: Number(paymentData?.total ?? 0),
    resumesThisMonth: monthlyResumes?.count ?? 0,
    revenueThisMonth: Number(monthlyRevenue?.total ?? 0),
  });
});

// GET /api/admin/users
router.get("/admin/users", async (_req, res) => {
  const users = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  const resumeCounts = await db
    .select({ userId: resumesTable.userId, count: count() })
    .from(resumesTable)
    .groupBy(resumesTable.userId);
  const spendMap = await db
    .select({ userId: paymentsTable.userId, total: sum(paymentsTable.amount) })
    .from(paymentsTable)
    .groupBy(paymentsTable.userId);

  const rcMap = Object.fromEntries(resumeCounts.map((r) => [r.userId, r.count]));
  const spMap = Object.fromEntries(spendMap.map((s) => [s.userId, Number(s.total ?? 0)]));

  return res.json(
    users.map((u) => ({
      id: u.id,
      email: u.email,
      displayName: u.displayName ?? null,
      createdAt: u.createdAt.toISOString(),
      resumeCount: rcMap[u.id] ?? 0,
      totalSpent: spMap[u.id] ?? 0,
    }))
  );
});

// GET /api/admin/payments
router.get("/admin/payments", async (_req, res) => {
  const rows = await db
    .select()
    .from(paymentsTable)
    .orderBy(desc(paymentsTable.createdAt));

  return res.json(
    rows.map((r) => ({
      id: String(r.id),
      userId: r.userId,
      resumeId: r.resumeId ?? null,
      plan: r.plan,
      amount: r.amount,
      status: r.status,
      orderId: r.orderId ?? null,
      paymentId: r.paymentId ?? null,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
