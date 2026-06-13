import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import {
  useGetResume, useGenerateLinkedInProfile, getGetResumeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Linkedin, Loader2, Sparkles, Copy, Check, ExternalLink } from "lucide-react";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground shrink-0" onClick={copy}>
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

function ScoreMeter({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width={90} height={90} className="-rotate-90">
          <circle cx={45} cy={45} r={r} fill="none" stroke="currentColor" strokeWidth={7} className="text-muted/30" />
          <circle cx={45} cy={45} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-bold text-lg" style={{ color }}>{score}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">Optimization Score</span>
    </div>
  );
}

type ProfileResult = {
  headline: string;
  about: string;
  skills: string[];
  summary: string;
  score: number;
};

function LinkedInProfileContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<ProfileResult | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", {
    query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId },
  });

  const mutation = useGenerateLinkedInProfile();

  const handleGenerate = () => {
    if (!resume || !targetRole.trim()) { toast.error("Enter a target role"); return; }
    setGenerating(true);
    mutation.mutate(
      { data: { data: resume.data as object, targetRole } },
      {
        onSuccess: (data) => { setResult(data as ProfileResult); setGenerating(false); },
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
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-sky-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">LinkedIn Profile Generator</h1>
              <p className="text-sm text-muted-foreground">AI-optimized headline, about section, and skills</p>
            </div>
          </div>

          {isLoading ? <Skeleton className="h-24 rounded-xl" /> : (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <Label className="text-sm font-medium">Target Job Role</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  placeholder="e.g. Frontend Developer, Data Analyst, Full-Stack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  className="flex-1"
                />
                <Button onClick={handleGenerate} disabled={generating || !targetRole.trim()} className="gap-2 shrink-0">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Generate
                </Button>
              </div>
              {generating && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Creating your LinkedIn profile sections…
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Score + CTA */}
              <div className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row items-center gap-5">
                <ScoreMeter score={result.score} />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold mb-1">
                    {result.score >= 80 ? "🚀 Highly Optimized!" : result.score >= 60 ? "👍 Good Profile" : "⚠ Needs Improvement"}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {result.score >= 80
                      ? "Your LinkedIn profile is well-optimized for the target role. Copy sections and update your profile."
                      : result.score >= 60
                      ? "Your profile is decent. A few improvements would significantly boost your visibility."
                      : "Your profile needs more detail to attract recruiters. Follow the suggestions below."}
                  </p>
                  <a
                    href="https://www.linkedin.com/in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-500 hover:underline"
                  >
                    Update LinkedIn Profile <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Headline */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Headline</h3>
                  <CopyButton text={result.headline} />
                </div>
                <p className="text-sm font-medium bg-muted/50 rounded-lg px-4 py-3">{result.headline}</p>
                <p className="text-xs text-muted-foreground mt-2">{result.headline.length}/120 characters</p>
              </div>

              {/* About section */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">About Section (Summary)</h3>
                  <CopyButton text={result.summary} />
                </div>
                <div className="bg-muted/50 rounded-lg px-4 py-3">
                  {result.summary.split("\n\n").map((para, i) => (
                    <p key={i} className={`text-sm leading-relaxed ${i > 0 ? "mt-3" : ""}`}>{para}</p>
                  ))}
                </div>
              </div>

              {/* Short about */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Short Bio</h3>
                  <CopyButton text={result.about} />
                </div>
                <p className="text-sm leading-relaxed bg-muted/50 rounded-lg px-4 py-3">{result.about}</p>
              </div>

              {/* Skills */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm">Featured Skills ({result.skills.length})</h3>
                  <CopyButton text={result.skills.join(", ")} label="Copy all" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-3 py-1">{skill}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">Add these to the Skills section of your LinkedIn profile for better search ranking.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function LinkedInProfile() {
  return <ProtectedRoute><LinkedInProfileContent /></ProtectedRoute>;
}
