import { Router } from "express";
import { db, paymentsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

// POST /api/payments/order — placeholder (Razorpay disabled)
router.post("/payments/order", async (_req, res) => {
  return res.json({
    orderId: "disabled",
    amount: 0,
    currency: "INR",
    key: "disabled",
  });
});

// POST /api/payments/verify — placeholder
router.post("/payments/verify", async (_req, res) => {
  return res.json({ success: false, message: "Payment system not yet enabled" });
});

// GET /api/payments/status/:userId
router.get("/payments/status/:userId", async (req, res) => {
  const { userId } = req.params;
  const rows = await db
    .select()
    .from(paymentsTable)
    .where(eq(paymentsTable.userId, userId))
    .orderBy(desc(paymentsTable.createdAt));

  return res.json(
    rows.map((r) => ({
      ...r,
      id: String(r.id),
      resumeId: r.resumeId ?? null,
      orderId: r.orderId ?? null,
      paymentId: r.paymentId ?? null,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

export default router;
