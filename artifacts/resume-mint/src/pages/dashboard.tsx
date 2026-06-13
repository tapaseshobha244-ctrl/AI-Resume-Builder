import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useListResumes, useCreateResume, useDeleteResume, getListResumesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Plus, FileText, Edit3, Trash2, Eye, Clock, Sparkles, LayoutTemplate, Loader2,
  MoreHorizontal, Target, MessageSquare, Linkedin, Code2, Briefcase, Stethoscope,
  TrendingUp, ChevronRight,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

const TEMPLATE_LABELS: Record<string, { label: string; color: string }> = {
  "ats-professional": { label: "ATS Pro", color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800" },
  "modern-corporate": { label: "Modern", color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800" },
  "minimal": { label: "Minimal", color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/30 dark:text-slate-400 dark:border-slate-700" },
  "executive": { label: "Executive", color: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-800" },
  "creative": { label: "Creative", color: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800" },
};

function AtsBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs text-muted-foreground shrink-0">ATS</span>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-semibold ${score >= 80 ? "text-emerald-600 dark:text-emerald-400" : score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>{score}</span>
    </div>
  );
}

function DashboardContent() {
  const { user } = useAuthContext();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: resumes, isLoading } = useListResumes(
    { userId: user?.uid ?? "" },
    { query: { enabled: !!user?.uid, queryKey: getListResumesQueryKey({ userId: user?.uid ?? "" }) } }
  );

  const createMutation = useCreateResume();
  const deleteMutation = useDeleteResume();

  const handleCreate = () => {
    if (!user) return;
    createMutation.mutate(
      { data: { userId: user.uid, title: "Untitled Resume" } },
      {
        onSuccess: (resume) => {
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user.uid }) });
          setLocation(`/builder/${resume.id}`);
        },
        onError: () => toast.error("Failed to create resume. Please try again."),
      }
    );
  };

  const handleDelete = () => {
    if (!deleteId || !user) return;
    deleteMutation.mutate(
      { id: deleteId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user.uid }) });
          toast.success("Resume deleted");
          setDeleteId(null);
        },
        onError: () => toast.error("Failed to delete resume"),
      }
    );
  };

  const totalResumes = resumes?.length ?? 0;
  const aiEnhanced = resumes?.filter(r => (r.data as { personalInfo?: { summary?: string } })?.personalInfo?.summary).length ?? 0;
  const templatesUsed = new Set(resumes?.map(r => r.template).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-14">
        {/* Page header */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-14 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold">
                {user?.displayName ? `${user.displayName.split(" ")[0]}'s resumes` : "My resumes"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isLoading ? "Loading..." : `${totalResumes} resume${totalResumes !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="gap-2 self-start sm:self-auto shadow-sm"
              data-testid="button-create-resume"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New resume
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total", value: isLoading ? "—" : String(totalResumes), icon: FileText, color: "text-primary" },
              { label: "AI Enhanced", value: isLoading ? "—" : String(aiEnhanced), icon: Sparkles, color: "text-violet-500" },
              { label: "Templates", value: isLoading ? "—" : String(templatesUsed), icon: LayoutTemplate, color: "text-blue-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-border bg-card px-4 py-4 sm:px-5">
                <div className={`${color} mb-2`}><Icon className="w-4 h-4" /></div>
                <div className="font-display text-2xl font-bold leading-none mb-1">{value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            ))}
          </div>

          {/* Resume grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-52 rounded-xl" />
              ))}
            </div>
          ) : !resumes?.length ? (
            <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-border rounded-2xl text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-base mb-1">No resumes yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                Create your first resume and let AI help you land your dream job.
              </p>
              <Button onClick={handleCreate} className="gap-2" data-testid="button-create-first">
                <Plus className="w-4 h-4" />
                Create first resume
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => {
                const templateInfo = TEMPLATE_LABELS[resume.template ?? ""] ?? { label: resume.template ?? "Default", color: "bg-muted text-muted-foreground border-border" };
                return (
                  <div
                    key={resume.id}
                    className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md transition-all duration-200"
                    data-testid={`card-resume-${resume.id}`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        {resume.template && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${templateInfo.color}`}>
                            {templateInfo.label}
                          </span>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-md flex items-center justify-center hover:bg-muted">
                              <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem asChild>
                              <Link href={`/builder/${resume.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/preview/${resume.id}`} className="flex items-center gap-2 cursor-pointer">
                                <Eye className="w-3.5 h-3.5" /> Preview & Download
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteId(resume.id)}
                              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Title & time */}
                    <h3 className="font-semibold text-sm mb-1 truncate pr-2" data-testid={`text-resume-title-${resume.id}`}>
                      {resume.title}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                    </div>

                    {resume.atsScore != null && <AtsBar score={resume.atsScore} />}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/builder/${resume.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" data-testid={`button-edit-${resume.id}`}>
                          <Edit3 className="w-3 h-3" /> Edit
                        </Button>
                      </Link>
                      <Link href={`/preview/${resume.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" data-testid={`button-preview-${resume.id}`}>
                          <Eye className="w-3 h-3" /> Preview
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30"
                        onClick={() => setDeleteId(resume.id)}
                        data-testid={`button-delete-${resume.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {/* Career AI Tools quick-links */}
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs text-muted-foreground mr-1">AI Tools:</span>
                        {[
                          { icon: Target, href: `/ats-score/${resume.id}`, tip: "ATS Score", color: "text-emerald-500 hover:bg-emerald-500/10" },
                          { icon: Stethoscope, href: `/resume-doctor/${resume.id}`, tip: "Resume Doctor", color: "text-rose-500 hover:bg-rose-500/10" },
                          { icon: MessageSquare, href: `/interview-questions/${resume.id}`, tip: "Interview Prep", color: "text-blue-500 hover:bg-blue-500/10" },
                          { icon: Linkedin, href: `/linkedin-profile/${resume.id}`, tip: "LinkedIn", color: "text-sky-500 hover:bg-sky-500/10" },
                          { icon: Code2, href: `/project-suggestions/${resume.id}`, tip: "Projects", color: "text-violet-500 hover:bg-violet-500/10" },
                          { icon: Briefcase, href: `/job-recommendations/${resume.id}`, tip: "Jobs", color: "text-orange-500 hover:bg-orange-500/10" },
                        ].map(({ icon: Icon, href, tip, color }) => (
                          <Link key={href} href={href} title={tip}>
                            <button className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </button>
                          </Link>
                        ))}
                        <Link href={`/career-dashboard/${resume.id}`} className="ml-auto">
                          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors px-1">
                            All tools <ChevronRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* New resume card */}
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="rounded-xl border-2 border-dashed border-border bg-transparent p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/3 transition-all cursor-pointer min-h-[200px] group"
                data-testid="button-add-resume-card"
              >
                <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  {createMutation.isPending ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                  New resume
                </div>
              </button>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resume?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The resume and all its data will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Dashboard() {
  return <ProtectedRoute><DashboardContent /></ProtectedRoute>;
}
