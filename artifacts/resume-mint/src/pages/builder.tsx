import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navbar } from "@/components/Navbar";
import { useGetResume, useUpdateResume, useEnhanceResume, getListResumesQueryKey, getGetResumeQueryKey } from "@workspace/api-client-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, GraduationCap, Code, Wrench, FolderOpen,
  Briefcase, Building2, Award, Target, Loader2,
  Plus, Trash2, ArrowRight, ArrowLeft, Eye, Sparkles,
  Save, CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type PersonalInfo = {
  fullName: string; email: string; phone: string; location: string;
  linkedin: string; github: string; portfolio: string; summary: string;
};
type Education = { degree: string; college: string; year: string; cgpa: string };
type Project = { name: string; description: string; technologies: string; githubLink: string };
type Experience = { company: string; role: string; duration: string; responsibilities: string };
type Internship = { company: string; role: string; duration: string; details: string };
type Certification = { name: string; issuer: string; year: string };
type Achievement = { title: string; description: string };

type ResumeFormData = {
  personalInfo: PersonalInfo;
  education: Education[];
  technicalSkills: string[];
  softSkills: string[];
  tools: string[];
  projects: Project[];
  experience: Experience[];
  internships: Internship[];
  certifications: Certification[];
  achievements: Achievement[];
  targetRole: string;
  template: string;
};

const EMPTY_FORM: ResumeFormData = {
  personalInfo: { fullName: "", email: "", phone: "", location: "", linkedin: "", github: "", portfolio: "", summary: "" },
  education: [{ degree: "", college: "", year: "", cgpa: "" }],
  technicalSkills: [],
  softSkills: [],
  tools: [],
  projects: [{ name: "", description: "", technologies: "", githubLink: "" }],
  experience: [],
  internships: [],
  certifications: [],
  achievements: [],
  targetRole: "",
  template: "ats-professional",
};

const filterEmpty = (arr?: string[]) => (arr ?? []).filter(s => s.trim() !== "");

const TEMPLATES = [
  { id: "ats-professional", label: "ATS Professional", desc: "Clean, ATS-optimized" },
  { id: "modern-corporate", label: "Modern Corporate", desc: "Two-column, modern" },
  { id: "executive", label: "Executive", desc: "Premium, traditional" },
  { id: "minimal", label: "Minimal", desc: "Elegant, serif" },
  { id: "creative", label: "Creative", desc: "Colorful, modern" },
];

// ─── Step Config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 0, label: "Personal Info", icon: User },
  { id: 1, label: "Education", icon: GraduationCap },
  { id: 2, label: "Tech Skills", icon: Code },
  { id: 3, label: "Soft Skills & Tools", icon: Wrench },
  { id: 4, label: "Projects", icon: FolderOpen },
  { id: 5, label: "Experience", icon: Briefcase },
  { id: 6, label: "Internships", icon: Building2 },
  { id: 7, label: "Certifications & Achievements", icon: Award },
  { id: 8, label: "Target Role & Template", icon: Target },
];

// ─── Tag/Chip input ─────────────────────────────────────────────────────────

function TagInput({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput("");
  };
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex flex-wrap gap-1.5 mt-1.5 mb-2">
        {values.map((v, i) => (
          <Badge key={i} variant="secondary" className="gap-1 pr-1">
            {v}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="rounded-full hover:bg-muted ml-0.5">
              <span className="sr-only">remove</span>×
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}...`}
          className="flex-1"
        />
        <Button type="button" size="sm" variant="outline" onClick={add}>Add</Button>
      </div>
    </div>
  );
}

// ─── Step components ─────────────────────────────────────────────────────────

function StepPersonal({ data, onChange }: { data: PersonalInfo; onChange: (d: PersonalInfo) => void }) {
  const f = (k: keyof PersonalInfo) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange({ ...data, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" value={data.fullName} onChange={f("fullName")} placeholder="Jane Doe" required />
        <Field label="Email" value={data.email} onChange={f("email")} placeholder="jane@email.com" type="email" required />
        <Field label="Phone" value={data.phone} onChange={f("phone")} placeholder="+91 9876543210" />
        <Field label="Location" value={data.location} onChange={f("location")} placeholder="Bangalore, India" />
        <Field label="LinkedIn URL" value={data.linkedin} onChange={f("linkedin")} placeholder="linkedin.com/in/jane" />
        <Field label="GitHub URL" value={data.github} onChange={f("github")} placeholder="github.com/jane" />
        <Field label="Portfolio URL" value={data.portfolio} onChange={f("portfolio")} placeholder="janedoe.dev" />
      </div>
      <div>
        <Label className="text-sm font-medium">Professional Summary <span className="text-muted-foreground font-normal">(optional — AI can generate this)</span></Label>
        <Textarea
          value={data.summary}
          onChange={f("summary")}
          placeholder="A brief 2-3 sentence professional summary..."
          className="mt-1.5 min-h-[80px] resize-none"
        />
      </div>
    </div>
  );
}

function StepEducation({ data, onChange }: { data: Education[]; onChange: (d: Education[]) => void }) {
  const update = (i: number, k: keyof Education, v: string) => {
    const next = [...data];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  return (
    <div className="space-y-4">
      {data.map((ed, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Education {i + 1}</span>
            {data.length > 1 && (
              <Button size="sm" variant="ghost" onClick={() => onChange(data.filter((_, j) => j !== i))} className="text-destructive h-7 px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Degree / Program" value={ed.degree} onChange={(e) => update(i, "degree", e.target.value)} placeholder="B.Tech Computer Science" required />
            <Field label="College / University" value={ed.college} onChange={(e) => update(i, "college", e.target.value)} placeholder="IIT Bombay" required />
            <Field label="Year" value={ed.year} onChange={(e) => update(i, "year", e.target.value)} placeholder="2020-2024" />
            <Field label="CGPA / Percentage" value={ed.cgpa} onChange={(e) => update(i, "cgpa", e.target.value)} placeholder="8.5 / 10" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5"
        onClick={() => onChange([...data, { degree: "", college: "", year: "", cgpa: "" }])}>
        <Plus className="w-3.5 h-3.5" /> Add Education
      </Button>
    </div>
  );
}

function StepProjects({ data, onChange }: { data: Project[]; onChange: (d: Project[]) => void }) {
  const update = (i: number, k: keyof Project, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <div className="space-y-4">
      {data.map((pr, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Project {i + 1}</span>
            {data.length > 1 && (
              <Button size="sm" variant="ghost" onClick={() => onChange(data.filter((_, j) => j !== i))} className="text-destructive h-7 px-2">
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Project Name" value={pr.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="E-Commerce App" required />
            <Field label="Technologies" value={pr.technologies} onChange={(e) => update(i, "technologies", e.target.value)} placeholder="React, Node.js, MongoDB" />
            <Field label="GitHub Link" value={pr.githubLink} onChange={(e) => update(i, "githubLink", e.target.value)} placeholder="github.com/you/project" />
          </div>
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea value={pr.description} onChange={(e) => update(i, "description", e.target.value)}
              placeholder="What the project does, your role, key outcomes..." className="mt-1.5 min-h-[72px] resize-none" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5"
        onClick={() => onChange([...data, { name: "", description: "", technologies: "", githubLink: "" }])}>
        <Plus className="w-3.5 h-3.5" /> Add Project
      </Button>
    </div>
  );
}

function StepExperience({ data, onChange }: { data: Experience[]; onChange: (d: Experience[]) => void }) {
  const update = (i: number, k: keyof Experience, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <div className="text-center py-8 rounded-lg border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground mb-3">No work experience yet</p>
        </div>
      )}
      {data.map((ex, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Experience {i + 1}</span>
            <Button size="sm" variant="ghost" onClick={() => onChange(data.filter((_, j) => j !== i))} className="text-destructive h-7 px-2">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Company" value={ex.company} onChange={(e) => update(i, "company", e.target.value)} placeholder="Google" required />
            <Field label="Role / Designation" value={ex.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="Senior Software Engineer" required />
            <Field label="Duration" value={ex.duration} onChange={(e) => update(i, "duration", e.target.value)} placeholder="Jan 2022 – Present" />
          </div>
          <div>
            <Label className="text-sm font-medium">Responsibilities</Label>
            <Textarea value={ex.responsibilities} onChange={(e) => update(i, "responsibilities", e.target.value)}
              placeholder="List your key responsibilities and achievements..." className="mt-1.5 min-h-[80px] resize-none" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5"
        onClick={() => onChange([...data, { company: "", role: "", duration: "", responsibilities: "" }])}>
        <Plus className="w-3.5 h-3.5" /> Add Experience
      </Button>
    </div>
  );
}

function StepInternships({ data, onChange }: { data: Internship[]; onChange: (d: Internship[]) => void }) {
  const update = (i: number, k: keyof Internship, v: string) => {
    const next = [...data]; next[i] = { ...next[i], [k]: v }; onChange(next);
  };
  return (
    <div className="space-y-4">
      {data.length === 0 && (
        <div className="text-center py-8 rounded-lg border border-dashed border-border/60">
          <p className="text-sm text-muted-foreground mb-3">No internships yet</p>
        </div>
      )}
      {data.map((int, i) => (
        <div key={i} className="rounded-lg border border-border/60 p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-muted-foreground">Internship {i + 1}</span>
            <Button size="sm" variant="ghost" onClick={() => onChange(data.filter((_, j) => j !== i))} className="text-destructive h-7 px-2">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Company" value={int.company} onChange={(e) => update(i, "company", e.target.value)} placeholder="Startup Inc." required />
            <Field label="Role" value={int.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="Frontend Intern" required />
            <Field label="Duration" value={int.duration} onChange={(e) => update(i, "duration", e.target.value)} placeholder="May 2023 – Jul 2023" />
          </div>
          <div>
            <Label className="text-sm font-medium">Details / Work done</Label>
            <Textarea value={int.details} onChange={(e) => update(i, "details", e.target.value)}
              placeholder="What you worked on..." className="mt-1.5 min-h-[72px] resize-none" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="gap-1.5"
        onClick={() => onChange([...data, { company: "", role: "", duration: "", details: "" }])}>
        <Plus className="w-3.5 h-3.5" /> Add Internship
      </Button>
    </div>
  );
}

function StepCertsAndAchievements({
  certs, achievements, onCerts, onAchievements,
}: {
  certs: Certification[]; achievements: Achievement[];
  onCerts: (d: Certification[]) => void; onAchievements: (d: Achievement[]) => void;
}) {
  const updateCert = (i: number, k: keyof Certification, v: string) => {
    const next = [...certs]; next[i] = { ...next[i], [k]: v }; onCerts(next);
  };
  const updateAch = (i: number, k: keyof Achievement, v: string) => {
    const next = [...achievements]; next[i] = { ...next[i], [k]: v }; onAchievements(next);
  };
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Certifications</h3>
        <div className="space-y-3">
          {certs.map((c, i) => (
            <div key={i} className="rounded-lg border border-border/60 p-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Certification Name" value={c.name} onChange={(e) => updateCert(i, "name", e.target.value)} placeholder="AWS Cloud Practitioner" required />
              <Field label="Issuer" value={c.issuer} onChange={(e) => updateCert(i, "issuer", e.target.value)} placeholder="Amazon" />
              <div className="flex gap-2 items-end">
                <div className="flex-1"><Field label="Year" value={c.year} onChange={(e) => updateCert(i, "year", e.target.value)} placeholder="2023" /></div>
                <Button size="sm" variant="ghost" onClick={() => onCerts(certs.filter((_, j) => j !== i))} className="text-destructive h-9 px-2 mb-0.5">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5"
            onClick={() => onCerts([...certs, { name: "", issuer: "", year: "" }])}>
            <Plus className="w-3.5 h-3.5" /> Add Certification
          </Button>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold mb-3">Achievements</h3>
        <div className="space-y-3">
          {achievements.map((a, i) => (
            <div key={i} className="rounded-lg border border-border/60 p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Title" value={a.title} onChange={(e) => updateAch(i, "title", e.target.value)} placeholder="National Hackathon Winner" required />
              <div className="flex gap-2 items-end">
                <div className="flex-1"><Field label="Description" value={a.description} onChange={(e) => updateAch(i, "description", e.target.value)} placeholder="Won 1st place out of 500 teams" /></div>
                <Button size="sm" variant="ghost" onClick={() => onAchievements(achievements.filter((_, j) => j !== i))} className="text-destructive h-9 px-2 mb-0.5">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1.5"
            onClick={() => onAchievements([...achievements, { title: "", description: "" }])}>
            <Plus className="w-3.5 h-3.5" /> Add Achievement
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, required, type = "text" }: {
  label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean; type?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}{required && <span className="text-destructive ml-0.5">*</span>}</Label>
      <Input type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

function BuilderContent() {
  const { resumeId } = useParams<{ resumeId: string }>();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ResumeFormData>(EMPTY_FORM);
  const [title, setTitle] = useState("Untitled Resume");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [enhancing, setEnhancing] = useState(false);

  const { data: resume, isLoading } = useGetResume(resumeId ?? "", { query: { queryKey: getGetResumeQueryKey(resumeId ?? ""), enabled: !!resumeId } });
  const updateMutation = useUpdateResume();
  const enhanceMutation = useEnhanceResume();

  // Load resume data into form — filter empty strings from tag arrays
  useEffect(() => {
    if (!resume) return;
    setTitle(resume.title ?? "Untitled Resume");
    const d = (resume.data ?? {}) as Partial<ResumeFormData>;
    setForm({
      personalInfo: d.personalInfo ?? EMPTY_FORM.personalInfo,
      education: d.education?.filter(e => e.degree || e.college).length ? d.education! : EMPTY_FORM.education,
      technicalSkills: filterEmpty(d.technicalSkills),
      softSkills: filterEmpty(d.softSkills),
      tools: filterEmpty(d.tools),
      projects: d.projects?.filter(p => p.name).length ? d.projects! : EMPTY_FORM.projects,
      experience: d.experience ?? [],
      internships: d.internships ?? [],
      certifications: d.certifications ?? [],
      achievements: d.achievements ?? [],
      targetRole: d.targetRole ?? "",
      template: (resume.template ?? "ats-professional"),
    });
  }, [resume]);

  const save = useCallback(async (data?: Partial<ResumeFormData>) => {
    if (!resumeId) return;
    setSaving(true);
    const merged = { ...form, ...(data ?? {}) };
    // Filter empty strings from tag arrays before saving
    const clean: ResumeFormData = {
      ...merged,
      technicalSkills: filterEmpty(merged.technicalSkills),
      softSkills: filterEmpty(merged.softSkills),
      tools: filterEmpty(merged.tools),
    };
    updateMutation.mutate(
      { id: resumeId, data: { title, data: clean, template: clean.template } },
      {
        onSuccess: () => {
          setSaved(true);
          if (user?.uid) queryClient.invalidateQueries({ queryKey: getListResumesQueryKey({ userId: user.uid }) });
          setTimeout(() => setSaved(false), 2000);
          setSaving(false);
        },
        onError: () => { toast.error("Failed to save"); setSaving(false); },
      }
    );
  }, [form, title, resumeId, updateMutation, queryClient, user?.uid]);  // eslint-disable-line

  const handleEnhance = () => {
    if (!form.targetRole.trim()) { toast.error("Set a target role in Step 9 first"); return; }
    setEnhancing(true);
    enhanceMutation.mutate(
      { data: { data: form as object, targetRole: form.targetRole } },
      {
        onSuccess: (result) => {
          const enhanced = result.data as ResumeFormData;
          setForm((prev) => ({ ...prev, ...enhanced }));
          save(enhanced);
          toast.success("Resume enhanced with AI!");
          setEnhancing(false);
        },
        onError: () => { toast.error("AI enhancement failed"); setEnhancing(false); },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background"><Navbar />
        <main className="pt-20 flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  const StepIcon = STEPS[step].icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-14 pb-16">
        {/* Top bar */}
        <div className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-14 z-30">
          <div className="max-w-5xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7" data-testid="button-back-dashboard">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => save()}
                className="bg-transparent text-sm font-medium truncate outline-none hover:bg-muted/30 rounded px-1 py-0.5 min-w-0 w-40"
                data-testid="input-resume-title"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs hidden sm:flex"
                onClick={handleEnhance}
                disabled={enhancing}
                data-testid="button-enhance-ai"
              >
                {enhancing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Enhance
              </Button>
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => save()} disabled={saving} data-testid="button-save">
                {saved ? <CheckCircle2 className="w-3 h-3" /> : saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                {saved ? "Saved" : "Save"}
              </Button>
              <Link href={`/preview/${resumeId}`}>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs hidden sm:flex" data-testid="button-preview">
                  <Eye className="w-3 h-3" /> Preview
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-6 flex gap-6">
          {/* Sidebar steps */}
          <div className="hidden lg:flex flex-col gap-1 w-44 shrink-0 pt-1">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => { save(); setStep(s.id); }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-all ${
                    step === s.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                  data-testid={`step-nav-${s.id}`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main form */}
          <div className="flex-1 min-w-0">
            {/* Mobile step progress */}
            <div className="flex gap-1 mb-4 lg:hidden overflow-x-auto pb-1">
              {STEPS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { save(); setStep(s.id); }}
                  className={`h-1.5 rounded-full transition-all shrink-0 ${
                    step === s.id ? "bg-primary w-8" : "bg-muted w-4"
                  }`}
                />
              ))}
            </div>

            <div className="rounded-xl border border-border/60 bg-card p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <StepIcon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">{STEPS[step].label}</h2>
                  <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</p>
                </div>
              </div>

              {step === 0 && (
                <StepPersonal data={form.personalInfo} onChange={(v) => setForm((p) => ({ ...p, personalInfo: v }))} />
              )}
              {step === 1 && (
                <StepEducation data={form.education} onChange={(v) => setForm((p) => ({ ...p, education: v }))} />
              )}
              {step === 2 && (
                <TagInput label="Technical Skills" values={form.technicalSkills} placeholder="e.g. Python, React, SQL"
                  onChange={(v) => setForm((p) => ({ ...p, technicalSkills: v }))} />
              )}
              {step === 3 && (
                <div className="space-y-6">
                  <TagInput label="Soft Skills" values={form.softSkills} placeholder="e.g. Leadership, Communication"
                    onChange={(v) => setForm((p) => ({ ...p, softSkills: v }))} />
                  <TagInput label="Tools & Technologies" values={form.tools} placeholder="e.g. Git, Docker, Figma"
                    onChange={(v) => setForm((p) => ({ ...p, tools: v }))} />
                </div>
              )}
              {step === 4 && (
                <StepProjects data={form.projects} onChange={(v) => setForm((p) => ({ ...p, projects: v }))} />
              )}
              {step === 5 && (
                <StepExperience data={form.experience} onChange={(v) => setForm((p) => ({ ...p, experience: v }))} />
              )}
              {step === 6 && (
                <StepInternships data={form.internships} onChange={(v) => setForm((p) => ({ ...p, internships: v }))} />
              )}
              {step === 7 && (
                <StepCertsAndAchievements
                  certs={form.certifications} achievements={form.achievements}
                  onCerts={(v) => setForm((p) => ({ ...p, certifications: v }))}
                  onAchievements={(v) => setForm((p) => ({ ...p, achievements: v }))}
                />
              )}
              {step === 8 && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium">Target Job Role</Label>
                    <Input
                      value={form.targetRole}
                      onChange={(e) => setForm((p) => ({ ...p, targetRole: e.target.value }))}
                      placeholder="e.g. Software Engineer, Product Manager"
                      className="mt-1.5"
                      data-testid="input-target-role"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Used to optimize your resume with AI and for ATS scoring.</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Template</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setForm((p) => ({ ...p, template: t.id }))}
                          className={`rounded-lg border p-3 text-sm font-medium text-left transition-all ${
                            form.template === t.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/60 hover:border-primary/40"
                          }`}
                          data-testid={`template-option-${t.id}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button onClick={handleEnhance} disabled={enhancing || !form.targetRole.trim()} className="gap-2" data-testid="button-enhance-ai-step9">
                      {enhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Enhance with AI
                    </Button>
                    <Link href={`/ats-score/${resumeId}`}>
                      <Button variant="outline" className="gap-2" data-testid="button-goto-ats">
                        Check ATS Score
                      </Button>
                    </Link>
                    <Link href={`/cover-letter/${resumeId}`}>
                      <Button variant="outline" className="gap-2" data-testid="button-goto-cover-letter">
                        Generate Cover Letter
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Nav buttons */}
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={step === 0}
                onClick={() => { save(); setStep((s) => s - 1); }}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => { save(); setStep((s) => s + 1); }}
                  data-testid="button-next-step"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Link href={`/preview/${resumeId}`}>
                  <Button size="sm" className="gap-1.5" onClick={() => save()} data-testid="button-view-preview">
                    <Eye className="w-3.5 h-3.5" /> View Preview
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Builder() {
  return <ProtectedRoute><BuilderContent /></ProtectedRoute>;
}
