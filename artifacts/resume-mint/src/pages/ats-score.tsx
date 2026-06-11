import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useGetResume, useGetAtsScore, useUpdateResume, getListResumesQueryKey, getGetResumeQueryKey } from "@workspace/api-client-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Lightbulb, ArrowLeft, Loader2, Target, Sparkles } from "lucide-react";
import { toast } from "sonner";

function AtsScoreContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<{ score: number; missingKeywords: string[]; suggestions: string[]; strengths: string[] } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", { query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId } });
  const atsMutation = useGetAtsScore();
  const updateMutation = useUpdateResume();

  const handleAnalyze = () => {
    if (!resume || !targetRole.trim()) { toast.error("Enter a target role"); return; }
    setAnalyzing(true);
    atsMutation.mutate(
      { data: { data: resume.data as object, targetRole } },
      {
        onSuccess: (data) => {
          setResult(data);
          // Save the score to the resume
          updateMutation.mutate({ id: resumeId!, data: { atsScore: data.score } });
          if (user?.uid) queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user.uid }) });
          setAnalyzing(false);
        },
        onError: () => { toast.error("Analysis failed"); setAnalyzing(false); },
      }
    );
  };

  const scoreColor = result
    ? result.score >= 75 ? "text-green-500" : result.score >= 50 ? "text-yellow-500" : "text-red-500"
    : "text-primary";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-3xl mx-auto pt-6">
          <Link href={`/builder/${resumeId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground" data-testid="button-back">
              <ArrowLeft className="w-4 h-4" /> Back to builder
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">ATS Score Analyzer</h1>
              <p className="text-sm text-muted-foreground">Check how your resume performs against Applicant Tracking Systems</p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <>
              <div className="rounded-xl border border-border/60 bg-card p-6 mb-6">
                <Label className="text-sm font-medium">Target Job Role</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    placeholder="e.g. Frontend Developer, Data Analyst, Product Manager"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                    className="flex-1"
                    data-testid="input-target-role"
                  />
                  <Button onClick={handleAnalyze} disabled={analyzing || !targetRole.trim()} className="gap-2 shrink-0" data-testid="button-analyze">
                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Analyze
                  </Button>
                </div>
              </div>

              {result && (
                <div className="space-y-5" data-testid="section-ats-results">
                  {/* Score */}
                  <div className="rounded-xl border border-border/60 bg-card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold">Overall ATS Score</h2>
                      <span className={`font-display text-4xl font-bold ${scoreColor}`} data-testid="text-ats-score">{result.score}</span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden mb-2">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${result.score >= 75 ? "bg-green-500" : result.score >= 50 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${result.score}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Needs work</span><span>Good</span><span>Excellent</span>
                    </div>
                    <Badge variant="secondary" className="mt-3">
                      {result.score >= 75 ? "✓ ATS-Friendly" : result.score >= 50 ? "⚠ Needs Improvement" : "✗ Not ATS-Ready"}
                    </Badge>
                  </div>

                  {/* Strengths */}
                  {result.strengths.length > 0 && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-5">
                      <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2 mb-3">
                        <CheckCircle2 className="w-4 h-4" /> Strengths ({result.strengths.length})
                      </h3>
                      <ul className="space-y-1.5">
                        {result.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Keywords */}
                  {result.missingKeywords.length > 0 && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5">
                      <h3 className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-3">
                        <XCircle className="w-4 h-4" /> Missing Keywords ({result.missingKeywords.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missingKeywords.map((kw, i) => (
                          <Badge key={i} variant="secondary" className="text-xs border border-red-500/20 text-red-600 dark:text-red-400" data-testid={`badge-missing-keyword-${i}`}>
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {result.suggestions.length > 0 && (
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
                      <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 flex items-center gap-2 mb-3">
                        <Lightbulb className="w-4 h-4" /> Improvement Suggestions ({result.suggestions.length})
                      </h3>
                      <ul className="space-y-1.5">
                        {result.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-yellow-500 mt-0.5 shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Link href={`/builder/${resumeId}`}>
                      <Button variant="outline" className="gap-2" data-testid="button-improve-resume">
                        Improve Resume
                      </Button>
                    </Link>
                    <Link href={`/cover-letter/${resumeId}`}>
                      <Button variant="outline" className="gap-2" data-testid="button-go-cover-letter">
                        Generate Cover Letter
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AtsScore() {
  return <ProtectedRoute><AtsScoreContent /></ProtectedRoute>;
}
