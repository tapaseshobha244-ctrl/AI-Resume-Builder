import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useGetResume, getGetResumeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft, Target, Linkedin, Code2, Briefcase, Stethoscope,
  MessageSquare, ChevronRight, Sparkles, TrendingUp, Star,
} from "lucide-react";

function CircularProgress({ value, size = 80, stroke = 7, color }: {
  value: number; size?: number; stroke?: number; color: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-muted/30" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

const TOOLS = [
  {
    id: "ats",
    label: "ATS Score",
    description: "Check how your resume scores with Applicant Tracking Systems",
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    href: (id: string) => `/ats-score/${id}`,
    cta: "Analyze ATS",
  },
  {
    id: "interview",
    label: "Interview Prep",
    description: "Generate 20 questions across HR, Technical, Behavioral & Project categories",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    href: (id: string) => `/interview-questions/${id}`,
    cta: "Prep Now",
  },
  {
    id: "linkedin",
    label: "LinkedIn Profile",
    description: "AI-optimized headline, about section, and skills for your profile",
    icon: Linkedin,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    href: (id: string) => `/linkedin-profile/${id}`,
    cta: "Generate Profile",
  },
  {
    id: "projects",
    label: "Project Ideas",
    description: "Curated project suggestions tailored to your skills and target role",
    icon: Code2,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    href: (id: string) => `/project-suggestions/${id}`,
    cta: "Get Ideas",
  },
  {
    id: "jobs",
    label: "Job Matching",
    description: "Discover the best-fit roles with match scores and learning paths",
    icon: Briefcase,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    href: (id: string) => `/job-recommendations/${id}`,
    cta: "Explore Roles",
  },
  {
    id: "doctor",
    label: "Resume Doctor",
    description: "Get a full health report with issues, strengths, and specific fixes",
    icon: Stethoscope,
    color: "text-rose-500",
    bg: "bg-rose-500/10",
    href: (id: string) => `/resume-doctor/${id}`,
    cta: "Diagnose Resume",
  },
];

function CareerDashboardContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { data: resume, isLoading } = useGetResume(resumeId ?? "", {
    query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId },
  });

  const atsScore = resume?.atsScore;
  const data = resume?.data as Record<string, unknown> | undefined;
  const hasProfile = !!(data?.personalInfo as Record<string, unknown> | undefined)?.summary;
  const skillCount = ((data?.technicalSkills as string[] | undefined) ?? []).length + ((data?.tools as string[] | undefined) ?? []).length;
  const projectCount = ((data?.projects as unknown[] | undefined) ?? []).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto pt-6">
          <Link href={`/builder/${resumeId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Back to builder
            </Button>
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Career Intelligence Hub</h1>
              <p className="text-sm text-muted-foreground">All your AI career tools in one place</p>
            </div>
          </div>

          {isLoading ? (
            <div className="mt-8 space-y-4">
              <Skeleton className="h-32 rounded-2xl" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
              </div>
            </div>
          ) : (
            <>
              {/* Career health overview */}
              <div className="mt-6 rounded-2xl border border-border bg-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Resume at a Glance</h2>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {resume?.title ?? "Untitled Resume"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "ATS Score", value: atsScore != null ? `${atsScore}` : "—", sub: atsScore != null ? (atsScore >= 75 ? "Excellent" : atsScore >= 50 ? "Good" : "Needs work") : "Not analyzed", color: atsScore != null ? (atsScore >= 75 ? "#10b981" : atsScore >= 50 ? "#f59e0b" : "#ef4444") : "#94a3b8" },
                    { label: "Skills", value: String(skillCount), sub: skillCount >= 8 ? "Strong" : skillCount >= 4 ? "Moderate" : "Add more", color: skillCount >= 8 ? "#10b981" : skillCount >= 4 ? "#f59e0b" : "#ef4444" },
                    { label: "Projects", value: String(projectCount), sub: projectCount >= 3 ? "Impressive" : projectCount >= 1 ? "Decent" : "Add projects", color: projectCount >= 3 ? "#10b981" : projectCount >= 1 ? "#f59e0b" : "#ef4444" },
                    { label: "Profile", value: hasProfile ? "✓" : "—", sub: hasProfile ? "Summary ready" : "No summary", color: hasProfile ? "#10b981" : "#ef4444" },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label} className="text-center">
                      <div className="relative inline-flex items-center justify-center mb-2">
                        <CircularProgress value={label === "ATS Score" && atsScore != null ? atsScore : label === "Skills" ? Math.min(skillCount * 10, 100) : label === "Projects" ? Math.min(projectCount * 33, 100) : hasProfile ? 100 : 0} size={64} stroke={5} color={color} />
                        <span className="absolute font-display font-bold text-sm" style={{ color }}>{value}</span>
                      </div>
                      <div className="text-xs font-medium">{label}</div>
                      <div className="text-xs text-muted-foreground">{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip banner */}
              {!atsScore && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 mb-6">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground/80">
                    <strong className="text-foreground">Tip:</strong> Start with the ATS Score Analyzer to see how your resume performs, then use the other tools to strengthen your application.
                  </p>
                </div>
              )}

              {/* Tools grid */}
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                AI Career Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <Link key={tool.id} href={tool.href(resumeId ?? "")}>
                      <div className="group rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer h-full flex flex-col">
                        <div className={`w-10 h-10 rounded-xl ${tool.bg} flex items-center justify-center mb-3`}>
                          <Icon className={`w-5 h-5 ${tool.color}`} />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{tool.label}</h3>
                        <p className="text-xs text-muted-foreground flex-1 mb-4">{tool.description}</p>
                        <div className={`flex items-center gap-1 text-xs font-medium ${tool.color} group-hover:gap-2 transition-all`}>
                          {tool.cta} <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Link href={`/builder/${resumeId}`}>
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Resume
                  </Button>
                </Link>
                <Link href={`/preview/${resumeId}`}>
                  <Button className="gap-2">
                    <Sparkles className="w-4 h-4" /> Preview & Download
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CareerDashboard() {
  return <ProtectedRoute><CareerDashboardContent /></ProtectedRoute>;
}
