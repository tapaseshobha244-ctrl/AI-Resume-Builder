import { useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useGetResume, useUpdateResume, getGetResumeQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ATSProfessional } from "@/components/templates/ATSProfessional";
import { ModernCorporate } from "@/components/templates/ModernCorporate";
import { Minimal } from "@/components/templates/Minimal";
import {
  ArrowLeft, Download, Edit3, Target, FileText,
  Loader2, LayoutTemplate, Sparkles
} from "lucide-react";
import { toast } from "sonner";

const TEMPLATES = [
  { id: "ats-professional", label: "ATS Pro" },
  { id: "modern-corporate", label: "Modern" },
  { id: "executive", label: "Executive" },
  { id: "minimal", label: "Minimal" },
  { id: "creative", label: "Creative" },
];

function ResumeTemplate({ data, template }: { data: object; template: string }) {
  switch (template) {
    case "modern-corporate": return <ModernCorporate data={data as Parameters<typeof ModernCorporate>[0]["data"]} />;
    case "minimal": return <Minimal data={data as Parameters<typeof Minimal>[0]["data"]} />;
    default: return <ATSProfessional data={data as Parameters<typeof ATSProfessional>[0]["data"]} />;
  }
}

function PreviewContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", { query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId } });
  const updateMutation = useUpdateResume();

  const currentTemplate = activeTemplate ?? resume?.template ?? "ats-professional";

  const handleTemplateChange = (id: string) => {
    setActiveTemplate(id);
    if (resumeId) {
      updateMutation.mutate({ id: resumeId, data: { template: id } });
    }
  };

  const handleDownloadPDF = async () => {
    if (!resumeRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
      } else {
        let position = 0;
        let remaining = imgHeight;
        let page = 0;
        while (remaining > 0) {
          if (page > 0) pdf.addPage();
          pdf.addImage(imgData, "JPEG", 0, -position, imgWidth, imgHeight);
          position += pageHeight;
          remaining -= pageHeight;
          page++;
        }
      }

      const name = (resume?.data as { personalInfo?: { fullName?: string } })?.personalInfo?.fullName ?? "resume";
      pdf.save(`${name.replace(/\s+/g, "_")}_resume.pdf`);
      toast.success("PDF downloaded!");
    } catch (err) {
      toast.error("Failed to generate PDF. Please try again.");
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 pb-16">
        {/* Top bar */}
        <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-14 z-30">
          <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link href={`/builder/${resumeId}`}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs" data-testid="button-back-builder">
                  <ArrowLeft className="w-3.5 h-3.5" /> Edit
                </Button>
              </Link>
              <span className="text-sm font-medium truncate hidden sm:block max-w-48">{resume?.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/ats-score/${resumeId}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden sm:flex" data-testid="button-ats-score">
                  <Target className="w-3.5 h-3.5" /> ATS Score
                </Button>
              </Link>
              <Link href={`/cover-letter/${resumeId}`}>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs hidden sm:flex" data-testid="button-cover-letter">
                  <FileText className="w-3.5 h-3.5" /> Cover Letter
                </Button>
              </Link>
              <Button
                size="sm"
                className="gap-1.5 text-xs"
                onClick={handleDownloadPDF}
                disabled={downloading || isLoading}
                data-testid="button-download-pdf"
              >
                {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {downloading ? "Exporting..." : "Download PDF"}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-6 flex gap-6">
          {/* Template sidebar */}
          <div className="hidden lg:flex flex-col gap-1 w-40 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <LayoutTemplate className="w-3.5 h-3.5" /> Template
            </div>
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTemplateChange(t.id)}
                className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                  currentTemplate === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
                data-testid={`template-select-${t.id}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Resume preview */}
          <div className="flex-1 min-w-0">
            {/* Mobile template picker */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 lg:hidden">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateChange(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    currentTemplate === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <Skeleton className="w-full aspect-[8.5/11] rounded-lg" />
            ) : !resume ? (
              <div className="text-center py-20 text-muted-foreground">Resume not found</div>
            ) : (
              <div className="shadow-2xl rounded-lg overflow-hidden border border-border/40 bg-white" style={{ maxWidth: "850px" }}>
                <div ref={resumeRef} data-testid="resume-preview-container">
                  <ResumeTemplate data={resume.data as object} template={currentTemplate} />
                </div>
              </div>
            )}

            {/* Actions below */}
            {!isLoading && resume && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={handleDownloadPDF} disabled={downloading} className="gap-2" data-testid="button-download-bottom">
                  {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download PDF
                </Button>
                <Link href={`/builder/${resumeId}`}>
                  <Button variant="outline" className="gap-2" data-testid="button-edit-bottom">
                    <Edit3 className="w-4 h-4" /> Edit Resume
                  </Button>
                </Link>
                <Link href={`/ats-score/${resumeId}`}>
                  <Button variant="outline" className="gap-2" data-testid="button-ats-bottom">
                    <Target className="w-4 h-4" /> Check ATS Score
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Preview() {
  return <ProtectedRoute><PreviewContent /></ProtectedRoute>;
}
