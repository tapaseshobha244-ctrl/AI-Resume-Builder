import { useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useGetResume, useGenerateCoverLetter, getGetResumeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2, Copy, Check, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

function CoverLetterContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const [targetRole, setTargetRole] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", { query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId } });
  const generateMutation = useGenerateCoverLetter();

  const handleGenerate = () => {
    if (!resume) return;
    if (!targetRole.trim()) { toast.error("Enter a target role"); return; }
    if (!companyName.trim()) { toast.error("Enter a company name"); return; }
    setGenerating(true);
    generateMutation.mutate(
      { data: { data: resume.data as object, targetRole, companyName } },
      {
        onSuccess: (data) => { setCoverLetter(data.content); setGenerating(false); },
        onError: () => { toast.error("Generation failed"); setGenerating(false); },
      }
    );
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = coverLetter.trim().split(/\s+/).filter(Boolean).length;

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
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Cover Letter Generator</h1>
              <p className="text-sm text-muted-foreground">AI-powered cover letter tailored to your role and company</p>
            </div>
          </div>

          {isLoading ? (
            <Skeleton className="h-32 rounded-xl" />
          ) : (
            <>
              <div className="rounded-xl border border-border/60 bg-card p-6 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="text-sm font-medium">Target Role</Label>
                    <Input
                      placeholder="e.g. Software Engineer"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="mt-1.5"
                      data-testid="input-target-role"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Company Name</Label>
                    <Input
                      placeholder="e.g. Google"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1.5"
                      data-testid="input-company-name"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !targetRole.trim() || !companyName.trim()}
                  className="gap-2"
                  data-testid="button-generate"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Generating..." : "Generate Cover Letter"}
                </Button>
              </div>

              {coverLetter && (
                <div className="rounded-xl border border-border/60 bg-card p-6" data-testid="section-cover-letter">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="font-semibold">Your Cover Letter</h2>
                      <p className="text-xs text-muted-foreground">{wordCount} words</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5" data-testid="button-copy">
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? "Copied" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating} className="gap-1.5" data-testid="button-regenerate">
                        {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        Regenerate
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="min-h-[360px] font-sans text-sm leading-relaxed resize-none"
                    data-testid="textarea-cover-letter"
                  />
                  <p className="text-xs text-muted-foreground mt-3">You can edit the letter above before copying it.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CoverLetter() {
  return <ProtectedRoute><CoverLetterContent /></ProtectedRoute>;
}
