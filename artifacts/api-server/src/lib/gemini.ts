import { GoogleGenerativeAI } from "@google/generative-ai";
import { logger } from "./logger";

const apiKey = process.env["GEMINI_API_KEY"];
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Try models in order — newer models are preferred; older names are kept as fallback
const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-flash",
];

async function generateText(prompt: string): Promise<string | null> {
  if (!genAI) return null;
  for (const modelName of GEMINI_MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      logger.info({ modelName }, "Gemini response received");
      return text;
    } catch (err) {
      logger.warn({ err: (err as { message?: string }).message, modelName }, "Gemini model unavailable, trying next");
    }
  }
  logger.error("All Gemini models failed, using fallback");
  return null;
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

// ─── Interview Questions ─────────────────────────────────────────────────────

export async function generateInterviewQuestions(
  data: ResumeData,
  targetRole: string
): Promise<{ questions: Array<{ question: string; category: string; answer: string; tip: string | null }> }> {
  const skills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])].slice(0, 8).join(", ");
  const projects = (data.projects ?? []).map((p) => p.name).filter(Boolean).slice(0, 3).join(", ");
  const prompt = `You are an expert career coach. Generate 20 interview questions for a ${targetRole} candidate.

Candidate background:
- Skills: ${skills || "general software skills"}
- Projects: ${projects || "personal projects"}
- Education: ${data.education?.[0] ? `${data.education[0].degree} from ${data.education[0].college}` : "graduate"}
- Experience: ${(data.experience ?? []).length > 0 ? (data.experience ?? []).map((e) => `${e.role} at ${e.company}`).join(", ") : "fresher/student"}

Generate exactly 20 questions — 5 HR, 5 Technical, 5 Behavioral, 5 Project-based.
For each, provide a model answer (100-150 words) and a quick tip (1 sentence).

Return ONLY valid JSON (no markdown):
{
  "questions": [
    {
      "question": "...",
      "category": "hr|technical|behavioral|project",
      "answer": "...",
      "tip": "..."
    }
  ]
}`;

  const raw = await generateText(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.questions)) return parsed;
    } catch {
      logger.warn("Failed to parse interview questions response");
    }
  }

  // Fallback questions
  const fallback = [
    { question: `Tell me about yourself and why you want to be a ${targetRole}.`, category: "hr", answer: `I'm a motivated ${targetRole} with a strong foundation in ${skills || "software development"}. I'm passionate about building impactful solutions and continuously improving my skills. My background in ${data.education?.[0]?.degree ?? "computer science"} has given me solid problem-solving abilities, and I'm excited about the opportunity to apply them at your organization.`, tip: "Keep it under 2 minutes and focus on your most relevant experience." },
    { question: "What are your greatest strengths and how do they apply to this role?", category: "hr", answer: `My key strengths include strong analytical thinking, attention to detail, and the ability to learn quickly. In the context of ${targetRole}, these help me write clean, maintainable code and adapt to new technologies. I've also demonstrated strong collaboration skills by working on team projects and internships.`, tip: "Back each strength with a concrete example." },
    { question: "Where do you see yourself in 5 years?", category: "hr", answer: `In 5 years, I see myself as a senior ${targetRole} who has delivered impactful products and mentored junior engineers. I want to deepen my technical expertise while also growing my leadership skills. I'm excited about contributing to the long-term vision of a forward-thinking company.`, tip: "Align your goals with the company's growth trajectory." },
    { question: "Why should we hire you over other candidates?", category: "hr", answer: `I bring a combination of strong technical skills in ${skills || "software development"}, a proven track record through my projects, and a growth mindset. I'm not just looking for a job — I'm looking for an opportunity to grow and contribute meaningfully. My ability to quickly learn and adapt makes me a valuable long-term investment.`, tip: "Be specific about the unique value you bring." },
    { question: "How do you handle pressure and tight deadlines?", category: "hr", answer: `I break large tasks into smaller milestones and prioritize ruthlessly. I communicate proactively with stakeholders when timelines are at risk and focus on delivering the most critical features first. I've successfully delivered projects under tight deadlines during my internships and academic projects.`, tip: "Mention a specific time you delivered under pressure." },
    { question: `Explain the difference between synchronous and asynchronous programming.`, category: "technical", answer: `Synchronous programming executes tasks sequentially — each operation must complete before the next begins. Asynchronous programming allows tasks to run concurrently without blocking the main thread. For example, when fetching data from an API, async/await or Promises let other code run while waiting for the response. This is crucial for building responsive web applications that don't freeze the UI.`, tip: "Use a real-world analogy to make your explanation memorable." },
    { question: "What is REST and how does it differ from GraphQL?", category: "technical", answer: `REST (Representational State Transfer) is an architectural style where clients interact with resources via standard HTTP methods (GET, POST, PUT, DELETE). Each endpoint represents a specific resource. GraphQL is a query language where the client specifies exactly what data it needs in a single request, avoiding over-fetching or under-fetching. REST is simpler and more cacheable; GraphQL is more flexible for complex data requirements.`, tip: "Mention when you'd choose one over the other." },
    { question: "How does a browser render a web page?", category: "technical", answer: `The browser parses HTML into a DOM tree, CSS into a CSSOM, and combines them into a render tree. It then performs layout (calculating positions and sizes), painting (filling pixels), and compositing (combining layers). JavaScript can modify the DOM and CSSOM, triggering reflow and repaint. Understanding this pipeline is key to optimizing performance — minimizing DOM manipulation and avoiding layout thrashing.`, tip: "Mention the critical rendering path explicitly." },
    { question: "What is time complexity and why does it matter?", category: "technical", answer: `Time complexity describes how an algorithm's runtime scales with input size, expressed in Big O notation. For example, O(n) means runtime grows linearly, while O(n²) grows quadratically. It matters because inefficient algorithms can make software unusable at scale. When optimizing, I consider whether a hash map (O(1) lookup) is better than a linear search (O(n)) for the use case.`, tip: "Always explain your complexity analysis with a concrete example." },
    { question: "Explain the concept of database indexing.", category: "technical", answer: `Database indexes are data structures that improve query performance by allowing the database to find rows without scanning the entire table. They work similarly to a book's index — pointing directly to relevant pages. While indexes speed up reads, they slow down writes and consume storage. I typically index columns used in WHERE clauses, JOIN conditions, and ORDER BY operations.`, tip: "Mention the trade-off between read performance and write overhead." },
    { question: "Describe a challenging project and how you overcame the obstacles.", category: "behavioral", answer: `${projects ? `During my ${projects.split(",")[0]} project, I faced challenges with performance optimization. The initial implementation was too slow for real-time use. I profiled the bottlenecks, refactored the data fetching logic, and implemented caching, which reduced load time by 60%. This taught me the importance of measuring before optimizing.` : `During a group project, we had conflicting visions for the architecture. I organized a structured technical discussion, presented tradeoffs clearly, and we reached consensus on a scalable approach. The project was delivered successfully on time.`}`, tip: "Use the STAR method: Situation, Task, Action, Result." },
    { question: "Tell me about a time you had to learn something quickly.", category: "behavioral", answer: `When I joined an internship, I had to get up to speed with an unfamiliar tech stack within a week. I immediately reviewed the documentation, built a small prototype to get hands-on experience, and connected with senior engineers for guidance. By the end of the first sprint, I was contributing meaningful code. This experience reinforced the importance of structured self-learning.`, tip: "Quantify your learning speed when possible." },
    { question: "How do you handle constructive criticism?", category: "behavioral", answer: `I welcome constructive criticism as an opportunity to grow. When I receive feedback, I listen actively without becoming defensive, ask clarifying questions to fully understand the issue, and then take concrete steps to improve. After a code review flagged performance issues in my work, I researched the topic thoroughly and applied those learnings across the entire codebase.`, tip: "Show that you turned criticism into a positive outcome." },
    { question: "Describe a situation where you had to work in a team with conflicting opinions.", category: "behavioral", answer: `In a hackathon, our team had a debate about which tech stack to use. I facilitated a structured discussion where each person presented their preferred option with pros and cons. We evaluated each against our timeline and requirements, and ultimately chose the most pragmatic option. Everyone felt heard, and we delivered a working product within 24 hours.`, tip: "Emphasize your role as a collaborator and communicator." },
    { question: "Tell me about a time you failed and what you learned.", category: "behavioral", answer: `In one project, I underestimated the complexity of an integration task and caused a delay. I learned to break down complex tasks more carefully, set buffer time in estimates, and communicate risks earlier. This experience made me a much better project planner and I've consistently met deadlines since then.`, tip: "Focus on the lesson and how you applied it — not just the failure." },
    { question: `Walk me through one of your key projects in detail.`, category: "project", answer: `${data.projects?.[0] ? `My ${data.projects[0].name} project was built using ${data.projects[0].technologies || "modern web technologies"}. ${data.projects[0].description || "It solved a real-world problem by providing an efficient, user-friendly solution."} The main challenges included designing a scalable architecture and ensuring good performance. I learned a lot about full-stack development and API design through this project.` : `I built a full-stack web application using React and Node.js that solved a real-world problem. The system included user authentication, a database layer, and a RESTful API. I deployed it to the cloud and optimized it for performance. This project taught me end-to-end product development skills.`}`, tip: "Use the STAR method and quantify impact where possible." },
    { question: "How did you approach the technical architecture for your projects?", category: "project", answer: `I start by understanding the core requirements and constraints, then choose appropriate technologies. For web apps, I consider scalability, maintainability, and developer experience. I typically sketch out the component structure and data flow before writing any code. For database design, I think about query patterns first to design efficient schemas.`, tip: "Show that you think about architecture before implementation." },
    { question: "What improvements would you make to your past projects?", category: "project", answer: `Looking back, I'd add better test coverage, implement more thorough error handling, and improve the CI/CD pipeline for faster deployments. I'd also refactor some components to be more modular and reusable. These improvements would make the codebase more maintainable and the application more resilient.`, tip: "Self-awareness and growth mindset impress interviewers." },
    { question: "How did you handle version control and collaboration on your projects?", category: "project", answer: `I use Git with a feature-branch workflow. Each new feature or bug fix gets its own branch. I write clear, atomic commit messages and use pull requests for code review. For team projects, we established coding standards upfront and did regular code reviews to maintain quality. I'm also comfortable with GitFlow for more structured release cycles.`, tip: "Mention specific Git workflows and branching strategies you've used." },
    { question: "How do you ensure your projects are production-ready?", category: "project", answer: `I follow a production readiness checklist: proper error handling and logging, environment-specific configuration, input validation, security headers, performance optimization, and thorough testing. I also document the deployment process and ensure monitoring is in place. Code reviews and staged deployments further reduce risk before going live.`, tip: "Mention specific tools — linters, CI/CD, monitoring — you've used." },
  ];
  return { questions: fallback };
}

// ─── LinkedIn Profile Generator ─────────────────────────────────────────────

export async function generateLinkedInProfile(
  data: ResumeData,
  targetRole: string
): Promise<{ headline: string; about: string; skills: string[]; summary: string; score: number }> {
  const name = data.personalInfo?.fullName ?? "Professional";
  const skills = [...(data.technicalSkills ?? []), ...(data.softSkills ?? []), ...(data.tools ?? [])].filter(Boolean);
  const prompt = `You are a LinkedIn optimization expert. Generate an optimized LinkedIn profile for ${name}, targeting ${targetRole} roles.

Resume data: ${JSON.stringify({
    personalInfo: data.personalInfo,
    skills,
    education: data.education,
    experience: data.experience,
    projects: data.projects,
  })}

Return ONLY valid JSON (no markdown):
{
  "headline": "<120 char headline, role + key skills>",
  "about": "<300 char about section, professional and engaging>",
  "skills": ["<list of 15-20 relevant LinkedIn skills>"],
  "summary": "<2 paragraph professional summary for About section, ~300 words>",
  "score": <optimization score 0-100>
}`;

  const raw = await generateText(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.headline && parsed.about) return parsed;
    } catch {
      logger.warn("Failed to parse LinkedIn profile response");
    }
  }

  const edu = data.education?.[0];
  const expLine = (data.experience ?? []).length > 0
    ? (data.experience ?? []).map((e) => `${e.role} at ${e.company}`).join(" | ")
    : "aspiring professional";
  return {
    headline: `${targetRole} | ${skills.slice(0, 3).join(" · ")} | Open to Opportunities`,
    about: `${targetRole} with expertise in ${skills.slice(0, 4).join(", ")}. ${edu ? `${edu.degree} from ${edu.college}.` : ""} ${expLine}. Passionate about building impactful solutions.`,
    skills: skills.slice(0, 20),
    summary: `I am a passionate ${targetRole} with a strong foundation in ${skills.slice(0, 5).join(", ")}. ${edu ? `I hold a ${edu.degree} from ${edu.college}, where I developed a deep understanding of computer science fundamentals.` : ""}\n\nThroughout my journey, I have worked on ${(data.projects ?? []).slice(0, 2).map((p) => p.name).filter(Boolean).join(" and ") || "impactful projects"} and am always seeking new challenges. I believe in continuous learning and delivering high-quality work.`,
    score: 65,
  };
}

// ─── Project Suggestions ─────────────────────────────────────────────────────

export async function generateProjectSuggestions(
  skills: string[],
  targetRole: string,
  branch?: string | null
): Promise<{ projects: Array<{ name: string; description: string; features: string[]; techStack: string[]; difficulty: string; resumeImpact: number }> }> {
  const prompt = `You are a senior software engineer and career mentor. Generate 6 project ideas for a ${targetRole} student/fresher.

Their skills: ${skills.join(", ") || "basic programming"}
${branch ? `Branch/specialization: ${branch}` : ""}

Generate 2 beginner, 2 intermediate, 2 advanced projects. Each project should be unique, impactful for a resume, and realistically buildable.

Return ONLY valid JSON (no markdown):
{
  "projects": [
    {
      "name": "...",
      "description": "1-2 sentence description",
      "features": ["feature 1", "feature 2", "feature 3"],
      "techStack": ["tech1", "tech2"],
      "difficulty": "beginner|intermediate|advanced",
      "resumeImpact": <score 1-10>
    }
  ]
}`;

  const raw = await generateText(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.projects)) return parsed;
    } catch {
      logger.warn("Failed to parse project suggestions response");
    }
  }

  const hasReact = skills.some((s) => /react|frontend|javascript|js/i.test(s));
  const hasPython = skills.some((s) => /python|ml|data/i.test(s));
  return {
    projects: [
      { name: "Personal Portfolio Website", description: "A responsive portfolio showcasing your projects, skills, and contact information.", features: ["Project showcase", "Contact form", "Dark mode toggle"], techStack: ["HTML", "CSS", "JavaScript"], difficulty: "beginner", resumeImpact: 6 },
      { name: "Todo App with Authentication", description: "A full-stack task management app with user login, CRUD operations, and local storage.", features: ["User auth", "Add/edit/delete tasks", "Filter by status"], techStack: hasReact ? ["React", "Node.js", "MongoDB"] : ["HTML", "JavaScript", "LocalStorage"], difficulty: "beginner", resumeImpact: 5 },
      { name: "Real-Time Chat Application", description: "A chat app with rooms, private messaging, and online status using WebSockets.", features: ["Real-time messaging", "Multiple rooms", "User presence"], techStack: ["React", "Node.js", "Socket.io"], difficulty: "intermediate", resumeImpact: 8 },
      { name: hasPython ? "ML Price Predictor" : "E-Commerce Store", description: hasPython ? "A machine learning model that predicts housing or stock prices with a web dashboard." : "A full-featured online store with cart, payments, and admin panel.", features: hasPython ? ["Data preprocessing", "Model training", "Prediction API", "Dashboard"] : ["Product catalog", "Cart/checkout", "Admin dashboard", "Payment integration"], techStack: hasPython ? ["Python", "Scikit-learn", "Flask", "React"] : ["React", "Node.js", "Stripe", "PostgreSQL"], difficulty: "intermediate", resumeImpact: 9 },
      { name: "AI Resume Builder", description: "A web app that uses AI to generate professional resumes from user input.", features: ["Form-based input", "AI content generation", "PDF export", "Multiple templates"], techStack: ["React", "Node.js", "OpenAI/Gemini API", "PostgreSQL"], difficulty: "advanced", resumeImpact: 10 },
      { name: "DevOps Pipeline Dashboard", description: "A CI/CD monitoring dashboard that visualizes build statuses, deployments, and metrics.", features: ["GitHub integration", "Build status tracking", "Deployment logs", "Alerts"], techStack: ["React", "Node.js", "Docker", "GitHub API"], difficulty: "advanced", resumeImpact: 9 },
    ],
  };
}

// ─── Job Recommendations ─────────────────────────────────────────────────────

export async function generateJobRecommendations(
  data: ResumeData
): Promise<{ roles: Array<{ title: string; matchScore: number; description: string; requiredSkills: string[]; missingSkills: string[]; learningPath: string[]; salaryRange: string | null }> }> {
  const skills = [...(data.technicalSkills ?? []), ...(data.tools ?? [])].filter(Boolean);
  const prompt = `You are a career counselor. Analyze this resume and recommend the 6 best-matching job roles.

Resume summary:
- Skills: ${skills.join(", ") || "general programming"}
- Education: ${data.education?.[0] ? `${data.education[0].degree} from ${data.education[0].college}` : "graduate"}
- Experience: ${(data.experience ?? []).map((e) => `${e.role} at ${e.company}`).join(", ") || "fresher"}
- Projects: ${(data.projects ?? []).map((p) => p.name).filter(Boolean).join(", ") || "personal projects"}
- Target: ${data.targetRole || "software engineering"}

For each role provide: title, matchScore (0-100), description (1 sentence), requiredSkills (5-8 skills), missingSkills (skills they lack for this role), learningPath (3-5 steps to get this job), salaryRange (e.g. "$60k-$90k/yr").

Return ONLY valid JSON (no markdown):
{
  "roles": [
    {
      "title": "...",
      "matchScore": 85,
      "description": "...",
      "requiredSkills": ["..."],
      "missingSkills": ["..."],
      "learningPath": ["Step 1: ...", "Step 2: ..."],
      "salaryRange": "..."
    }
  ]
}`;

  const raw = await generateText(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed.roles)) return parsed;
    } catch {
      logger.warn("Failed to parse job recommendations response");
    }
  }

  const hasReact = skills.some((s) => /react|frontend|vue|angular/i.test(s));
  const hasBackend = skills.some((s) => /node|express|django|spring|backend/i.test(s));
  const hasML = skills.some((s) => /python|ml|tensorflow|pytorch|data/i.test(s));
  return {
    roles: [
      { title: hasReact ? "Frontend Developer" : "Software Developer", matchScore: 82, description: "Build user-facing web applications using modern JavaScript frameworks.", requiredSkills: ["JavaScript", "React", "HTML/CSS", "Git", "REST APIs"], missingSkills: skills.length < 5 ? ["TypeScript", "Testing", "Performance Optimization"] : [], learningPath: ["Master React hooks and state management", "Learn TypeScript", "Build 2-3 portfolio projects", "Contribute to open source", "Apply to junior roles"], salaryRange: "$60k–$95k/yr" },
      { title: hasBackend ? "Backend Developer" : "Full-Stack Developer", matchScore: 75, description: "Design and build scalable server-side applications and APIs.", requiredSkills: ["Node.js", "Express", "SQL", "REST APIs", "Authentication"], missingSkills: ["System Design", "Caching", "Microservices"], learningPath: ["Deep dive into databases (SQL + NoSQL)", "Learn system design fundamentals", "Build a production-grade API", "Learn containerization with Docker", "Apply to internships"], salaryRange: "$70k–$110k/yr" },
      { title: hasML ? "Data Scientist" : "Software Engineer", matchScore: 70, description: hasML ? "Extract insights from data using statistical analysis and machine learning." : "Design, develop, and maintain software systems across the stack.", requiredSkills: hasML ? ["Python", "Pandas", "Scikit-learn", "SQL", "Statistics"] : ["Data Structures", "Algorithms", "System Design", "OOP"], missingSkills: hasML ? ["Deep Learning", "MLOps", "Spark"] : ["Low-level systems", "Distributed systems"], learningPath: ["Study DSA and system design", "Solve LeetCode problems daily", "Build full-stack projects", "Prepare for technical interviews", "Target FAANG or product companies"], salaryRange: "$80k–$130k/yr" },
      { title: "DevOps Engineer", matchScore: 60, description: "Automate and optimize software delivery pipelines and infrastructure.", requiredSkills: ["Linux", "Docker", "CI/CD", "Cloud (AWS/GCP)", "Kubernetes"], missingSkills: ["Kubernetes", "Terraform", "Cloud certifications"], learningPath: ["Learn Linux and bash scripting", "Get AWS Solutions Architect certification", "Learn Docker and Kubernetes", "Build CI/CD pipelines", "Target DevOps engineer roles"], salaryRange: "$85k–$130k/yr" },
      { title: "Product Manager (Technical)", matchScore: 55, description: "Define product vision and work with engineering teams to ship features.", requiredSkills: ["Communication", "Data Analysis", "Roadmapping", "User Research", "SQL"], missingSkills: ["Business strategy", "Market research", "Stakeholder management"], learningPath: ["Learn product management fundamentals (PM school)", "Build a product portfolio (case studies)", "Get experience in data analysis and SQL", "Network in product management communities", "Transition from engineering to PM roles"], salaryRange: "$90k–$140k/yr" },
      { title: "UI/UX Designer (Technical)", matchScore: 50, description: "Design user interfaces and experiences with a technical understanding of implementation.", requiredSkills: ["Figma", "User Research", "Prototyping", "CSS", "Accessibility"], missingSkills: ["Figma mastery", "Design systems", "User research methodologies"], learningPath: ["Learn Figma and design fundamentals", "Study UX principles and accessibility", "Build a design portfolio", "Collaborate with developers on projects", "Apply to design-engineering hybrid roles"], salaryRange: "$65k–$100k/yr" },
    ],
  };
}

// ─── Resume Doctor ───────────────────────────────────────────────────────────

export async function runResumeDoctor(
  data: ResumeData,
  targetRole: string
): Promise<{ healthScore: number; issues: Array<{ section: string; severity: string; problem: string; fix: string }>; strengths: string[]; overallFeedback: string }> {
  const prompt = `You are an expert resume reviewer and ATS specialist. Perform a comprehensive resume health check for a ${targetRole} candidate.

Resume: ${JSON.stringify(data)}

Analyze ALL aspects: summary quality, skills relevance, project descriptions, experience bullet points, education formatting, ATS compatibility, missing sections, keyword density, and overall presentation.

Severity levels: "critical" (will get rejected), "warning" (hurts chances), "suggestion" (nice to have).

Return ONLY valid JSON (no markdown):
{
  "healthScore": <0-100>,
  "issues": [
    {
      "section": "Summary|Skills|Experience|Projects|Education|Formatting|ATS|Overall",
      "severity": "critical|warning|suggestion",
      "problem": "...",
      "fix": "..."
    }
  ],
  "strengths": ["...", "..."],
  "overallFeedback": "<2-3 sentence overall assessment>"
}`;

  const raw = await generateText(prompt);
  if (raw) {
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed = JSON.parse(cleaned);
      if (typeof parsed.healthScore === "number") return parsed;
    } catch {
      logger.warn("Failed to parse resume doctor response");
    }
  }

  // Rule-based fallback
  const issues: Array<{ section: string; severity: string; problem: string; fix: string }> = [];
  const strengths: string[] = [];
  let score = 50;

  if (!data.personalInfo?.summary) {
    issues.push({ section: "Summary", severity: "critical", problem: "No professional summary found.", fix: `Add a 2-3 sentence summary highlighting your ${targetRole} expertise and top skills.` });
  } else {
    strengths.push("Professional summary is present");
    score += 10;
  }
  if ((data.technicalSkills ?? []).length < 5) {
    issues.push({ section: "Skills", severity: "warning", problem: "Fewer than 5 technical skills listed.", fix: `List 8-12 relevant technical skills for ${targetRole} including tools, languages, and frameworks.` });
  } else {
    strengths.push("Good technical skills coverage");
    score += 10;
  }
  if ((data.projects ?? []).length === 0) {
    issues.push({ section: "Projects", severity: "critical", problem: "No projects found.", fix: "Add at least 2-3 relevant projects with descriptions, tech stack, and measurable outcomes." });
  } else if ((data.projects ?? []).length < 2) {
    issues.push({ section: "Projects", severity: "warning", problem: "Only one project listed.", fix: "Add 2-3 more projects to demonstrate breadth and depth of your skills." });
    score += 5;
  } else {
    strengths.push("Multiple projects showcased");
    score += 15;
  }
  if (!data.personalInfo?.linkedin) {
    issues.push({ section: "Formatting", severity: "suggestion", problem: "LinkedIn URL missing.", fix: "Add your LinkedIn profile URL to increase credibility and networking visibility." });
  } else {
    score += 5;
  }
  if (!data.personalInfo?.github) {
    issues.push({ section: "Formatting", severity: "suggestion", problem: "GitHub URL missing.", fix: "Add your GitHub profile URL — especially important for technical roles." });
  } else {
    strengths.push("GitHub profile linked");
    score += 5;
  }
  if ((data.education ?? []).length === 0) {
    issues.push({ section: "Education", severity: "warning", problem: "No education details found.", fix: "Add your degree, institution, graduation year, and CGPA if above 7.0." });
  } else {
    strengths.push("Education section present");
    score += 5;
  }

  return {
    healthScore: Math.min(score, 100),
    issues,
    strengths,
    overallFeedback: `Your resume for ${targetRole} has a health score of ${Math.min(score, 100)}/100. ${issues.filter((i) => i.severity === "critical").length > 0 ? "There are critical issues that should be addressed immediately." : "The foundation is solid."} Focus on the critical and warning items first to maximize your ATS pass rate.`,
  };
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
