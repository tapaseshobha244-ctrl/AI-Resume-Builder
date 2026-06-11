import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const apiKey = process.env["GEMINI_API_KEY"];
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function getModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

async function generateText(prompt: string): Promise<string | null> {
  const model = getModel();
  if (!model) return null;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (err) {
    logger.error({ err }, "Gemini API error");
    return null;
  }
}

// ─── Fallback helpers ───────────────────────────────────────────────────────

function formatSkillsProfessionally(skills: string[]): string[] {
  const expansions: Record<string, string> = {
    python: "Python programming, automation, and scripting",
    javascript: "JavaScript (ES6+) for web development",
    typescript: "TypeScript for type-safe application development",
    react: "React.js for building dynamic user interfaces",
    nodejs: "Node.js for scalable server-side development",
    sql: "SQL for relational database querying and management",
    git: "Git version control and collaborative development",
    docker: "Docker containerization and deployment",
    aws: "AWS cloud services and infrastructure management",
    "machine learning": "Machine learning model development and deployment",
  };
  return skills.map((s) => expansions[s.toLowerCase()] ?? s);
}

function generateFallbackSummary(data: ResumeData, targetRole: string): string {
  const name = data.personalInfo?.fullName ?? "The candidate";
  const skills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])].slice(0, 3).join(", ");
  const expCount = (data.experience ?? []).length + (data.internships ?? []).length;
  const eduLine =
    data.education?.[0]
      ? `holds a ${data.education[0].degree ?? "degree"} from ${data.education[0].college ?? "a reputed institution"}`
      : "is a motivated professional";
  return `${name} is a results-driven ${targetRole} who ${eduLine}${expCount > 0 ? ` with ${expCount} practical experience${expCount > 1 ? "s" : ""}` : ""}. ${skills ? `Skilled in ${skills}.` : ""} Passionate about delivering high-quality solutions and continuously learning new technologies.`;
}

function improveProjectDescription(name: string, desc: string, tech: string): string {
  if (desc.length > 80) return desc;
  return `Developed ${name}, a ${desc.trim()}. Built using ${tech}, demonstrating proficiency in modern software development practices and problem-solving skills.`;
}

function improveResponsibilities(resp: string): string {
  if (resp.length > 100) return resp;
  const lines = resp.split(/[.\n,]/).map((l) => l.trim()).filter(Boolean);
  return lines
    .map((l) => {
      if (/^[A-Z]/.test(l)) return l + ".";
      return l.charAt(0).toUpperCase() + l.slice(1) + ".";
    })
    .join(" ");
}

// ─── Type alias for convenience ─────────────────────────────────────────────

type ResumeData = {
  personalInfo?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string | null;
    github?: string | null;
    portfolio?: string | null;
    summary?: string | null;
  };
  education?: Array<{ degree?: string; college?: string; year?: string; cgpa?: string | null }>;
  technicalSkills?: string[];
  softSkills?: string[];
  tools?: string[];
  projects?: Array<{ name?: string; description?: string; technologies?: string; githubLink?: string | null }>;
  experience?: Array<{ company?: string; role?: string; duration?: string; responsibilities?: string }>;
  internships?: Array<{ company?: string; role?: string; duration?: string; details?: string | null }>;
  certifications?: Array<{ name?: string; issuer?: string | null; year?: string | null }>;
  achievements?: Array<{ title?: string; description?: string | null }>;
  targetRole?: string | null;
  template?: string | null;
};

// ─── Exported AI functions ───────────────────────────────────────────────────

export async function enhanceResume(data: ResumeData, targetRole: string): Promise<ResumeData> {
  const prompt = `You are an expert resume writer specializing in ATS-optimized resumes for ${targetRole} roles.

Given the following resume data (JSON), enhance it:
1. Write a professional summary (2-3 sentences) for the personalInfo.summary field.
2. Rewrite technicalSkills as professional descriptive phrases.
3. Improve each project description to be concise and impactful.
4. Improve each experience responsibility to use strong action verbs.
5. Add ATS-friendly keywords relevant to ${targetRole}.
6. Keep all original fields — only improve content, don't remove anything.

Return ONLY valid JSON matching the exact same structure. No markdown, no explanation.

Resume data: ${JSON.stringify(data)}`;

  const raw = await generateText(prompt);

  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return parsed as ResumeData;
    } catch {
      logger.warn("Failed to parse Gemini response, using fallback");
    }
  }

  // Fallback enhancement
  return {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      summary: data.personalInfo?.summary || generateFallbackSummary(data, targetRole),
    },
    technicalSkills: formatSkillsProfessionally(data.technicalSkills ?? []),
    projects: (data.projects ?? []).map((p) => ({
      ...p,
      description: improveProjectDescription(p.name ?? "", p.description ?? "", p.technologies ?? ""),
    })),
    experience: (data.experience ?? []).map((e) => ({
      ...e,
      responsibilities: improveResponsibilities(e.responsibilities ?? ""),
    })),
  };
}

export async function getAtsScore(
  data: ResumeData,
  targetRole: string
): Promise<{ score: number; missingKeywords: string[]; suggestions: string[]; strengths: string[] }> {
  const prompt = `You are an ATS (Applicant Tracking System) expert. Analyze this resume for the role: ${targetRole}.

Return ONLY valid JSON (no markdown) with these exact fields:
{
  "score": <integer 0-100>,
  "missingKeywords": [<array of missing ATS keywords>],
  "suggestions": [<array of improvement suggestions>],
  "strengths": [<array of resume strengths>]
}

Resume: ${JSON.stringify(data)}`;

  const raw = await generateText(prompt);

  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (typeof parsed.score === "number") return parsed;
    } catch {
      logger.warn("Failed to parse ATS score, using fallback");
    }
  }

  // Fallback ATS scoring
  let score = 40;
  const strengths: string[] = [];
  const missingKeywords: string[] = [];
  const suggestions: string[] = [];

  if (data.personalInfo?.summary) { score += 10; strengths.push("Professional summary present"); }
  else { suggestions.push("Add a professional summary targeting your role"); missingKeywords.push("professional summary"); }

  if ((data.technicalSkills ?? []).length >= 5) { score += 10; strengths.push("Strong technical skills section"); }
  else { suggestions.push("Add more relevant technical skills"); }

  if ((data.experience ?? []).length > 0) { score += 10; strengths.push("Work experience included"); }
  else { suggestions.push("Add work experience or internships"); }

  if ((data.projects ?? []).length >= 2) { score += 10; strengths.push("Multiple projects showcased"); }
  else { suggestions.push("Add more projects to demonstrate skills"); }

  if (data.personalInfo?.linkedin) { score += 5; strengths.push("LinkedIn profile linked"); }
  else { missingKeywords.push("LinkedIn URL"); suggestions.push("Add your LinkedIn profile URL"); }

  if (data.personalInfo?.github) { score += 5; strengths.push("GitHub profile linked"); }
  else { missingKeywords.push("GitHub URL"); suggestions.push("Add your GitHub profile URL"); }

  if ((data.certifications ?? []).length > 0) { score += 5; strengths.push("Certifications listed"); }

  if ((data.achievements ?? []).length > 0) { score += 5; strengths.push("Achievements highlighted"); }

  return { score: Math.min(score, 100), missingKeywords, suggestions, strengths };
}

export async function generateCoverLetter(
  data: ResumeData,
  targetRole: string,
  companyName: string
): Promise<string> {
  const prompt = `Write a professional cover letter for a ${targetRole} position at ${companyName}.

Candidate info:
- Name: ${data.personalInfo?.fullName ?? "Candidate"}
- Skills: ${[...(data.technicalSkills ?? []), ...(data.softSkills ?? [])].slice(0, 6).join(", ")}
- Experience: ${(data.experience ?? []).map((e) => `${e.role} at ${e.company}`).join(", ") || "fresher"}
- Education: ${data.education?.[0] ? `${data.education[0].degree} from ${data.education[0].college}` : ""}

Write a compelling, 3-paragraph cover letter. Be specific, professional, and enthusiastic. No placeholder text. Return only the cover letter text, no subject line or date.`;

  const raw = await generateText(prompt);

  if (raw) return raw.trim();

  // Fallback cover letter
  const name = data.personalInfo?.fullName ?? "I";
  const skills = [...(data.technicalSkills ?? [])].slice(0, 3).join(", ");
  const edu = data.education?.[0];
  return `Dear Hiring Manager,

I am writing to express my strong interest in the ${targetRole} position at ${companyName}. ${edu ? `As a ${edu.degree} graduate from ${edu.college}, I` : "I"} have developed a robust skill set in ${skills || "software development"} and am eager to bring my expertise to your team.

Throughout my academic and professional journey, I have consistently demonstrated a passion for problem-solving and delivering high-quality results. ${data.projects?.length ? `My project experience includes ${data.projects[0].name}, where I ${data.projects[0].description?.slice(0, 80) ?? "developed impactful solutions"}.` : ""} I thrive in collaborative environments and am always seeking opportunities to learn and grow.

I am particularly drawn to ${companyName} because of its reputation for innovation and excellence. I am confident that my technical skills and dedication make me a strong fit for this role. I would welcome the opportunity to discuss how I can contribute to your team.

Sincerely,
${data.personalInfo?.fullName ?? "Candidate"}`;
}
