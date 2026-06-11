import { Router } from "express";
import { db, resumesTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import {
  CreateResumeBody,
  UpdateResumeBody,
} from "@workspace/api-zod";

const router = Router();

// GET /api/resumes?userId=xxx
router.get("/resumes", async (req, res) => {
  const { userId } = req.query;
  if (!userId || typeof userId !== "string") {
    return res.status(400).json({ error: "userId query param required" });
  }
  const rows = await db
    .select()
    .from(resumesTable)
    .where(eq(resumesTable.userId, userId))
    .orderBy(desc(resumesTable.updatedAt));

  return res.json(
    rows.map((r) => ({
      ...r,
      id: String(r.id),
      atsScore: r.atsScore ?? null,
      template: r.template ?? null,
      plan: r.plan ?? null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }))
  );
});

// POST /api/resumes
router.post("/resumes", async (req, res) => {
  const parsed = CreateResumeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const { userId, title, data, template } = parsed.data;

  // Upsert user record
  await db
    .insert(usersTable)
    .values({ id: userId, email: (data as { personalInfo?: { email?: string } })?.personalInfo?.email ?? userId })
    .onConflictDoNothing();

  const [row] = await db
    .insert(resumesTable)
    .values({ userId, title, data: data as object, template: template ?? "ats-professional" })
    .returning();

  return res.status(201).json({
    ...row,
    id: String(row.id),
    atsScore: row.atsScore ?? null,
    template: row.template ?? null,
    plan: row.plan ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

// GET /api/resumes/:id
router.get("/resumes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const [row] = await db.select().from(resumesTable).where(eq(resumesTable.id, id));
  if (!row) return res.status(404).send();

  return res.json({
    ...row,
    id: String(row.id),
    atsScore: row.atsScore ?? null,
    template: row.template ?? null,
    plan: row.plan ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

// PATCH /api/resumes/:id
router.patch("/resumes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  const parsed = UpdateResumeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const updates: Record<string, unknown> = {};
  if (parsed.data.title != null) updates.title = parsed.data.title;
  if (parsed.data.data != null) updates.data = parsed.data.data as object;
  if (parsed.data.template != null) updates.template = parsed.data.template;
  if (parsed.data.isPaid != null) updates.isPaid = parsed.data.isPaid;
  if (parsed.data.plan != null) updates.plan = parsed.data.plan;
  if (parsed.data.atsScore != null) updates.atsScore = parsed.data.atsScore;

  const [row] = await db
    .update(resumesTable)
    .set(updates)
    .where(eq(resumesTable.id, id))
    .returning();

  if (!row) return res.status(404).send();

  return res.json({
    ...row,
    id: String(row.id),
    atsScore: row.atsScore ?? null,
    template: row.template ?? null,
    plan: row.plan ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
});

// DELETE /api/resumes/:id
router.delete("/resumes/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid id" });

  await db.delete(resumesTable).where(eq(resumesTable.id, id));
  return res.status(204).send();
});

export default router;
