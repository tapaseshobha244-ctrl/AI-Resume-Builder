import { Router } from "express";
import { enhanceResume, getAtsScore, generateCoverLetter } from "../lib/gemini";
import {
  EnhanceResumeBody,
  GetAtsScoreBody,
  GenerateCoverLetterBody,
} from "@workspace/api-zod";

const router = Router();

// POST /api/ai/enhance-resume
router.post("/ai/enhance-resume", async (req, res) => {
  const parsed = EnhanceResumeBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const enhanced = await enhanceResume(parsed.data.data, parsed.data.targetRole);
  return res.json({ data: enhanced });
});

// POST /api/ai/ats-score
router.post("/ai/ats-score", async (req, res) => {
  const parsed = GetAtsScoreBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const result = await getAtsScore(parsed.data.data, parsed.data.targetRole);
  return res.json(result);
});

// POST /api/ai/cover-letter
router.post("/ai/cover-letter", async (req, res) => {
  const parsed = GenerateCoverLetterBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });

  const content = await generateCoverLetter(
    parsed.data.data,
    parsed.data.targetRole,
    parsed.data.companyName
  );
  return res.json({ content });
});

export default router;
