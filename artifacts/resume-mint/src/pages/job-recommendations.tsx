import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import {
  useGetResume, useGenerateJobRecommendations, getGetResumeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Loader2, Sparkles, ChevronDown, ChevronUp, TrendingUp, BookOpen, AlertCircle } from "lucide-react";

type JobRole = {
  title: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  missingSkills: string[];
  learningPath: string[];
  salaryRange: string | null;
};

function MatchBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";
  const textColor = score >= 75 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-rose-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-sm font-bold ${textColor} w-12 text-right`}>{score}%</span>
    </div>
  );
}

function JobCard({ role, rank }: { role: JobRole; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 0);
  const matchLabel = role.matchScore >= 75 ? "Strong Match" : role.matchScore >= 50 ? "Good Match" : "Stretch Role";
  const matchBadge = role.matchScore >= 75 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : role.matchScore >= 50 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20";

  return (
    <div className={`rounded-xl border bg-card transition-all duration-200 ${expanded ? "border-primary/30 shadow-md" : "border-border hover:border-primary/20"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              #{rank + 1}
            </div>
            <div>
              <h3 className="font-semibold">{role.title}</h3>
              {role.salaryRange && (
                <p className="text-xs text-muted-foreground">{role.salaryRange}</p>
              )}
            </div>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${matchBadge}`}>{matchLabel}</span>
        </div>

        <MatchBar score={role.matchScore} />

        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{role.description}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-xs text-primary hover:underline mt-3 font-medium"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less details</> : <><ChevronDown className="w-3.5 h-3.5" /> See skills & path</>}
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          {/* Required skills */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {role.requiredSkills.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>

          {/* Missing skills */}
          {role.missingSkills.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 text-amber-500" /> Skills to Develop
              </p>
              <div className="flex flex-wrap gap-1.5">
                {role.missingSkills.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs border-amber-500/30 text-amber-600 dark:text-amber-400">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Learning path */}
          {role.learningPath.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-blue-500" /> Learning Path
              </p>
              <ol className="space-y-1.5">
                {role.learningPath.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-foreground/80">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function JobRecommendationsContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [result, setResult] = useState<{ roles: JobRole[] } | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", {
    query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId },
  });

  const mutation = useGenerateJobRecommendations();

  const handleGenerate = () => {
    if (!resume) return;
    setGenerating(true);
    mutation.mutate(
      { data: { data: resume.data as object } },
      {
        onSuccess: (data) => { setResult(data as { roles: JobRole[] }); setGenerating(false); },
        onError: () => { toast.error("Generation failed"); setGenerating(false); },
      }
    );
  };

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
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Job Role Recommendations</h1>
              <p className="text-sm text-muted-foreground">Best-fit roles ranked by your resume match score</p>
            </div>
          </div>

          {isLoading ? <Skeleton className="h-24 rounded-xl" /> : (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <p className="text-sm text-muted-foreground mb-4">
                AI will analyze your skills, education, and experience to recommend the most suitable career paths.
              </p>
              <Button onClick={handleGenerate} disabled={generating || !resume} className="gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                Analyze My Resume
              </Button>
              {generating && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Matching your profile to job roles…
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">{result.roles.length} roles ranked by match score</p>
              </div>
              {result.roles.map((role, i) => (
                <JobCard key={i} role={role} rank={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function JobRecommendations() {
  return <ProtectedRoute><JobRecommendationsContent /></ProtectedRoute>;
}
