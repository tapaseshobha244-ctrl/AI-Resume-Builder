import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import {
  useGetResume, useGenerateProjectSuggestions, getGetResumeQueryKey,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Code2, Loader2, Sparkles, Star, Zap, Trophy, Github } from "lucide-react";

type ProjectIdea = {
  name: string;
  description: string;
  features: string[];
  techStack: string[];
  difficulty: string;
  resumeImpact: number;
};

const DIFFICULTY_CONFIG = {
  beginner: { label: "Beginner", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  intermediate: { label: "Intermediate", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  advanced: { label: "Advanced", icon: Trophy, color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
};

function ImpactBar({ score }: { score: number }) {
  const width = `${(score / 10) * 100}%`;
  const color = score >= 8 ? "bg-emerald-500" : score >= 6 ? "bg-amber-500" : "bg-muted-foreground";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width }} />
      </div>
      <span className="text-xs font-medium text-muted-foreground w-8 text-right">{score}/10</span>
    </div>
  );
}

function ProjectCard({ project }: { project: ProjectIdea }) {
  const diff = DIFFICULTY_CONFIG[project.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.beginner;
  const Icon = diff.icon;

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${diff.bg} ${diff.color} ${diff.border}`}>
            <Icon className="w-3 h-3" />
            {diff.label}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-0.5">Resume Impact</p>
          <ImpactBar score={project.resumeImpact} />
        </div>
      </div>

      <h3 className="font-semibold mb-1.5">{project.name}</h3>
      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{project.description}</p>

      {project.features.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Key Features</p>
          <ul className="space-y-0.5">
            {project.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/80">
                <span className="text-primary mt-0.5">•</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {project.techStack.map((tech, i) => (
          <Badge key={i} variant="secondary" className="text-xs">{tech}</Badge>
        ))}
      </div>

      <a
        href={`https://github.com/search?q=${encodeURIComponent(project.name)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Github className="w-3.5 h-3.5" /> Search on GitHub
      </a>
    </div>
  );
}

function ProjectSuggestionsContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [targetRole, setTargetRole] = useState("");
  const [branch, setBranch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [result, setResult] = useState<{ projects: ProjectIdea[] } | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", {
    query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId },
  });

  const mutation = useGenerateProjectSuggestions();

  const handleGenerate = () => {
    if (!targetRole.trim()) { toast.error("Enter a target role"); return; }
    const skills = [
      ...((resume?.data as { technicalSkills?: string[] } | undefined)?.technicalSkills ?? []),
      ...((resume?.data as { tools?: string[] } | undefined)?.tools ?? []),
    ];
    setGenerating(true);
    mutation.mutate(
      { data: { skills, targetRole, branch: branch.trim() || null } },
      {
        onSuccess: (data) => { setResult(data as { projects: ProjectIdea[] }); setGenerating(false); },
        onError: () => { toast.error("Generation failed"); setGenerating(false); },
      }
    );
  };

  const filtered = filter === "all"
    ? (result?.projects ?? [])
    : (result?.projects ?? []).filter((p) => p.difficulty === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto pt-6">
          <Link href={`/career-dashboard/${resumeId}`}>
            <Button variant="ghost" size="sm" className="gap-1.5 mb-6 -ml-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" /> Career Hub
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Project Suggestions</h1>
              <p className="text-sm text-muted-foreground">Portfolio-worthy project ideas tailored to your skill set</p>
            </div>
          </div>

          {isLoading ? <Skeleton className="h-24 rounded-xl" /> : (
            <div className="rounded-xl border border-border bg-card p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Target Job Role *</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. Full-Stack Developer, Data Scientist"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Branch / Specialization (optional)</Label>
                  <Input
                    className="mt-1.5"
                    placeholder="e.g. Computer Science, Electrical Engineering"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleGenerate} disabled={generating || !targetRole.trim()} className="gap-2 mt-4">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate 6 Project Ideas
              </Button>
              {generating && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Crafting project ideas for your skill profile…
                </p>
              )}
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{result.projects.length} project ideas generated</p>
                <div className="flex gap-2">
                  {["all", "beginner", "intermediate", "advanced"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setFilter(d)}
                      className={`text-xs px-3 py-1 rounded-full font-medium border transition-all ${
                        filter === d
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No projects at this difficulty level</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filtered.map((project, i) => <ProjectCard key={i} project={project} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProjectSuggestions() {
  return <ProtectedRoute><ProjectSuggestionsContent /></ProtectedRoute>;
}
