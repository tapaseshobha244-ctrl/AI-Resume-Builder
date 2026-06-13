import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import {
  useGetResume, useRunResumeDoctor, getGetResumeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, Stethoscope, Loader2, Sparkles, CheckCircle2,
  XCircle, AlertTriangle, Lightbulb, Edit3,
} from "lucide-react";

type ResumeIssue = {
  section: string;
  severity: string;
  problem: string;
  fix: string;
};

type DoctorResult = {
  healthScore: number;
  issues: ResumeIssue[];
  strengths: string[];
  overallFeedback: string;
};

function HealthMeter({ score }: { score: number }) {
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  const label = score >= 75 ? "Healthy" : score >= 50 ? "Fair" : "Needs Attention";
  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={120} height={120} className="-rotate-90">
          <circle cx={60} cy={60} r={r} fill="none" stroke="currentColor" strokeWidth={9} className="text-muted/30" />
          <circle cx={60} cy={60} r={r} fill="none" stroke={color} strokeWidth={9}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.9s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-bold text-2xl" style={{ color }}>{score}</span>
          <span className="text-xs text-muted-foreground">/100</span>
        </div>
      </div>
      <span className="font-semibold mt-2" style={{ color }}>{label}</span>
      <span className="text-xs text-muted-foreground">Resume Health Score</span>
    </div>
  );
}

const SEVERITY_CONFIG = {
  critical: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/5", border: "border-red-500/20", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/20", label: "Warning" },
  suggestion: { icon: Lightbulb, color: "text-blue-500", bg: "bg-blue-500/5", border: "border-blue-500/20", label: "Suggestion" },
};

function IssueCard({ issue }: { issue: ResumeIssue }) {
  const cfg = SEVERITY_CONFIG[issue.severity as keyof typeof SEVERITY_CONFIG] ?? SEVERITY_CONFIG.suggestion;
  const Icon = cfg.icon;

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 ${cfg.color} mt-0.5 shrink-0`} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-muted-foreground">{issue.section}</span>
          </div>
          <p className="text-sm font-medium mb-1">{issue.problem}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground/70">Fix: </span>{issue.fix}
          </p>
        </div>
      </div>
    </div>
  );
}

function ResumeDoctorContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<DoctorResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", {
    query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId },
  });

  const mutation = useRunResumeDoctor();

  const handleAnalyze = () => {
    if (!resume || !targetRole.trim()) { toast.error("Enter a target role"); return; }
    setAnalyzing(true);
    mutation.mutate(
      { data: { data: resume.data as object, targetRole } },
      {
        onSuccess: (data) => { setResult(data as DoctorResult); setAnalyzing(false); },
        onError: () => { toast.error("Analysis failed"); setAnalyzing(false); },
      }
    );
  };

  const criticalCount = result?.issues.filter((i) => i.severity === "critical").length ?? 0;
  const warningCount = result?.issues.filter((i) => i.severity === "warning").length ?? 0;
  const suggestionCount = result?.issues.filter((i) => i.severity === "suggestion").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto pt-6">
          <Link href={`/career-dashboard/${resumeId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Career Hub
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Resume Doctor</h1>
              <p className="text-sm text-muted-foreground">Full health report with specific issues and fixes</p>
            </div>
          </div>

          {isLoading ? <Skeleton className="h-24 rounded-xl" /> : (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <Label className="text-sm font-medium">Target Job Role</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  placeholder="e.g. Software Engineer, Data Analyst, UX Designer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  className="flex-1"
                />
                <Button onClick={handleAnalyze} disabled={analyzing || !targetRole.trim()} className="gap-2 shrink-0">
                  {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Diagnose
                </Button>
              </div>
              {analyzing && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Performing deep resume analysis…
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {/* Score + summary */}
              <div className="rounded-xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center gap-6">
                <HealthMeter score={result.healthScore} />
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-sm leading-relaxed text-foreground/80 mb-4">{result.overallFeedback}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {criticalCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                        <XCircle className="w-3 h-3" /> {criticalCount} Critical
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" /> {warningCount} Warnings
                      </span>
                    )}
                    {suggestionCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        <Lightbulb className="w-3 h-3" /> {suggestionCount} Suggestions
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 mb-3 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> What's Working ({result.strengths.length})
                  </h3>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues */}
              {result.issues.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Issues Found ({result.issues.length})</h3>
                  <div className="space-y-2">
                    {/* Critical first */}
                    {result.issues
                      .slice()
                      .sort((a, b) => {
                        const order = { critical: 0, warning: 1, suggestion: 2 };
                        return (order[a.severity as keyof typeof order] ?? 2) - (order[b.severity as keyof typeof order] ?? 2);
                      })
                      .map((issue, i) => <IssueCard key={i} issue={issue} />)}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="flex gap-3">
                <Link href={`/builder/${resumeId}`}>
                  <Button className="gap-2">
                    <Edit3 className="w-4 h-4" /> Fix My Resume
                  </Button>
                </Link>
                <Link href={`/ats-score/${resumeId}`}>
                  <Button variant="outline" className="gap-2">
                    <Sparkles className="w-4 h-4" /> Check ATS Score
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ResumeDoctor() {
  return <ProtectedRoute><ResumeDoctorContent /></ProtectedRoute>;
}
