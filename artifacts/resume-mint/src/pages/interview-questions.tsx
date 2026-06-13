import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import {
  useGetResume, useGenerateInterviewQuestions, getGetResumeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft, MessageSquare, Loader2, Sparkles, ChevronDown,
  ChevronUp, Copy, Check, Users, Code2, Brain, FolderCode,
} from "lucide-react";

type Question = {
  question: string;
  category: string;
  answer: string;
  tip?: string | null;
};

const CATEGORIES = [
  { key: "hr", label: "HR Questions", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { key: "technical", label: "Technical", icon: Code2, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { key: "behavioral", label: "Behavioral", icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { key: "project", label: "Project-Based", icon: FolderCode, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
];

function QuestionCard({ q, idx }: { q: Question; idx: number }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(`Q: ${q.question}\n\nModel Answer: ${q.answer}${q.tip ? `\n\nTip: ${q.tip}` : ""}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card transition-all">
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setOpen(!open)}
      >
        <span className="shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground mt-0.5">
          {idx + 1}
        </span>
        <span className="text-sm font-medium flex-1 leading-relaxed">{q.question}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-border/60 pt-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">Model Answer</p>
            <p className="text-sm leading-relaxed text-foreground/90">{q.answer}</p>
          </div>
          {q.tip && (
            <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2">
              <p className="text-xs text-primary font-medium">💡 Tip: {q.tip}</p>
            </div>
          )}
          <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground" onClick={copy}>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy Q&A"}
          </Button>
        </div>
      )}
    </div>
  );
}

function InterviewQuestionsContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [targetRole, setTargetRole] = useState("");
  const [activeCategory, setActiveCategory] = useState("hr");
  const [result, setResult] = useState<{ questions: Question[] } | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", {
    query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId },
  });

  const mutation = useGenerateInterviewQuestions();

  const handleGenerate = () => {
    if (!resume || !targetRole.trim()) { toast.error("Enter a target role"); return; }
    setGenerating(true);
    mutation.mutate(
      { data: { data: resume.data as object, targetRole } },
      {
        onSuccess: (data) => { setResult(data); setGenerating(false); },
        onError: () => { toast.error("Generation failed"); setGenerating(false); },
      }
    );
  };

  const categoryQuestions = result?.questions.filter((q) => q.category === activeCategory) ?? [];

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
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Interview Question Generator</h1>
              <p className="text-sm text-muted-foreground">20 personalized questions with model answers</p>
            </div>
          </div>

          {isLoading ? <Skeleton className="h-24 rounded-xl" /> : (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <Label className="text-sm font-medium">Target Job Role</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  placeholder="e.g. Frontend Developer, Data Scientist, Product Manager"
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
                  Gemini AI is crafting 20 personalized questions…
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Category tabs */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const count = result.questions.filter((q) => q.category === cat.key).length;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        activeCategory === cat.key
                          ? `${cat.bg} ${cat.color} ${cat.border}`
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                      <Badge variant="secondary" className="text-xs ml-0.5 px-1.5 py-0 h-4">{count}</Badge>
                    </button>
                  );
                })}
              </div>

              {/* Questions */}
              <div className="space-y-2">
                {categoryQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-8 text-center">No questions in this category</p>
                ) : (
                  categoryQuestions.map((q, i) => <QuestionCard key={i} q={q} idx={i} />)
                )}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                {result.questions.length} questions generated · Click any question to see the model answer
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function InterviewQuestions() {
  return <ProtectedRoute><InterviewQuestionsContent /></ProtectedRoute>;
}
