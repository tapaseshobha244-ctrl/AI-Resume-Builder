import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  useListResumes,
  useCreateResume,
  useDeleteResume,
  getListResumesQueryKey,
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
  Plus, FileText, Edit3, Trash2, Download, Eye,
  Clock, LayoutTemplate, Sparkles
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const TEMPLATE_LABELS: Record<string, string> = {
  "ats-professional": "ATS Pro",
  "modern-corporate": "Modern",
  "executive": "Executive",
  "minimal": "Minimal",
  "creative": "Creative",
};

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

  const handleCreate = async () => {
    if (!user) return;
    createMutation.mutate(
      { data: { userId: user.uid, title: "Untitled Resume" } },
      {
        onSuccess: (resume) => {
          queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user.uid }) });
          setLocation(`/builder/${resume.id}`);
        },
        onError: () => toast.error("Failed to create resume"),
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
        onError: () => toast.error("Failed to delete"),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pt-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                Welcome back, {user?.displayName?.split(" ")[0] ?? "there"}
              </h1>
              <p className="text-muted-foreground mt-1">Manage your resumes and create new ones.</p>
            </div>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending}
              className="gap-2 self-start sm:self-auto"
              data-testid="button-create-resume"
            >
              <Plus className="w-4 h-4" />
              New Resume
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Total Resumes", value: isLoading ? "—" : String(resumes?.length ?? 0), icon: FileText },
              { label: "AI Enhanced", value: isLoading ? "—" : String(resumes?.filter(r => (r.data as { personalInfo?: { summary?: string } })?.personalInfo?.summary).length ?? 0), icon: Sparkles },
              { label: "Templates Used", value: isLoading ? "—" : String(new Set(resumes?.map(r => r.template)).size ?? 0), icon: LayoutTemplate },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                  <Icon className="w-3.5 h-3.5" />{label}
                </div>
                <div className="font-display text-2xl font-bold" data-testid={`stat-${label.toLowerCase().replace(/ /g, "-")}`}>{value}</div>
              </div>
            ))}
          </div>

          {/* Resume grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : !resumes?.length ? (
            <div className="text-center py-20 border border-dashed border-border/60 rounded-2xl">
              <div className="w-14 h-14 rounded-xl bg-card border border-border/60 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">No resumes yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Create your first resume to get started.</p>
              <Button onClick={handleCreate} className="gap-2" data-testid="button-create-first">
                <Plus className="w-4 h-4" /> Create resume
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="group rounded-xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-all"
                  data-testid={`card-resume-${resume.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    {resume.template && (
                      <Badge variant="secondary" className="text-xs">
                        {TEMPLATE_LABELS[resume.template] ?? resume.template}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1 truncate" data-testid={`text-resume-title-${resume.id}`}>
                    {resume.title}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mb-4">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                  </p>
                  {resume.atsScore != null && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-xs text-muted-foreground">ATS Score</div>
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${resume.atsScore}%` }} />
                      </div>
                      <div className="text-xs font-medium text-primary">{resume.atsScore}</div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/builder/${resume.id}`}>
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" data-testid={`button-edit-${resume.id}`}>
                        <Edit3 className="w-3 h-3" /> Edit
                      </Button>
                    </Link>
                    <Link href={`/preview/${resume.id}`}>
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs" data-testid={`button-preview-${resume.id}`}>
                        <Eye className="w-3 h-3" /> Preview
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="px-2 text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(resume.id)}
                      data-testid={`button-delete-${resume.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="rounded-xl border border-dashed border-border/60 bg-card/50 p-5 flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-card transition-all cursor-pointer min-h-[180px]"
                data-testid="button-add-resume-card"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium">New resume</span>
              </button>
            </div>
          )}
        </div>
      </main>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete resume?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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
