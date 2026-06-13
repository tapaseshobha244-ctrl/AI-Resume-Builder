import { Router } from "express";
import {
  enhanceResume,
  getAtsScore,
  generateCoverLetter,
  generateInterviewQuestions,
  generateLinkedInProfile,
  generateProjectSuggestions,
  generateJobRecommendations,
  runResumeDoctor,
} from "../lib/gemini";
import {
  EnhanceResumeBody,
  GetAtsScoreBody,
  GenerateCoverLetterBody,
  GenerateInterviewQuestionsBody,
  GenerateLinkedInProfileBody,
  GenerateProjectSuggestionsBody,
  GenerateJobRecommendationsBody,
  RunResumeDoctorBody,
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

// POST /api/ai/interview-questions
router.post("/ai/interview-questions", async (req, res) => {
  const parsed = GenerateInterviewQuestionsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const result = await generateInterviewQuestions(parsed.data.data, parsed.data.targetRole);
  return res.json(result);
});

// POST /api/ai/linkedin-profile
router.post("/ai/linkedin-profile", async (req, res) => {
  const parsed = GenerateLinkedInProfileBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const result = await generateLinkedInProfile(parsed.data.data, parsed.data.targetRole);
  return res.json(result);
});

// POST /api/ai/project-suggestions
router.post("/ai/project-suggestions", async (req, res) => {
  const parsed = GenerateProjectSuggestionsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const result = await generateProjectSuggestions(
    parsed.data.skills,
    parsed.data.targetRole,
    parsed.data.branch ?? null
  );
  return res.json(result);
});

// POST /api/ai/job-recommendations
router.post("/ai/job-recommendations", async (req, res) => {
  const parsed = GenerateJobRecommendationsBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const result = await generateJobRecommendations(parsed.data.data);
  return res.json(result);
});

// POST /api/ai/resume-doctor
router.post("/ai/resume-doctor", async (req, res) => {
  const parsed = RunResumeDoctorBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.message });
  const result = await runResumeDoctor(parsed.data.data, parsed.data.targetRole);
  return res.json(result);
});

export default router;
