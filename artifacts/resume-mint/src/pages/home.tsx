import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Target,
  Zap,
  Check,
  Star,
  Shield,
  Download,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Writing",
    desc: "Gemini AI enhances your resume with ATS-friendly language, strong action verbs, and relevant keywords.",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
  },
  {
    icon: Target,
    title: "ATS Score Analyzer",
    desc: "Get a real-time ATS compatibility score and specific suggestions to pass automated screening systems.",
    color: "text-primary",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  {
    icon: FileText,
    title: "3 Pro Templates",
    desc: "ATS Professional, Modern Corporate, and Minimal — all designed to impress recruiters at top companies.",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  {
    icon: Zap,
    title: "Instant PDF Export",
    desc: "Download a pixel-perfect PDF resume in one click. No watermarks, no paywalls — always free.",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Fill your details",
    desc: "Enter your education, experience, skills, and projects in our guided multi-step form.",
  },
  {
    num: "02",
    title: "AI enhancement",
    desc: "Click 'Enhance with AI' and Gemini rewrites your content for maximum ATS compatibility.",
  },
  {
    num: "03",
    title: "Pick a template",
    desc: "Choose from three professionally designed templates that work with any ATS system.",
  },
  {
    num: "04",
    title: "Download & apply",
    desc: "Export a clean, pixel-perfect PDF and start applying to your dream jobs immediately.",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Software Engineer at Google",
    text: "Got my ATS score from 42 to 91 in 10 minutes. Landed 3 interviews in the first week.",
    avatar: "PS",
  },
  {
    name: "Rahul Mehta",
    role: "Product Manager at Flipkart",
    text: "The AI enhancement made my resume sound so much more professional. Highly recommend!",
    avatar: "RM",
  },
  {
    name: "Ananya Singh",
    role: "Data Scientist at Razorpay",
    text: "As a fresher, I had no idea how to structure my resume. ResumeMint AI made it easy.",
    avatar: "AS",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-28 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Google Gemini AI
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.12] tracking-tight mb-6">
            Build an <span className="gradient-text">ATS-Optimized</span> Resume{" "}
            <br className="hidden sm:block" />
            that gets you hired
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered resume builder for students, freshers, and professionals.
            Beat ATS systems, impress recruiters, and land more interviews —
            100% free.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/register">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-semibold shadow-md gap-2 group"
                data-testid="cta-create-resume"
              >
                Create my resume
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base font-medium gap-2"
              >
                See how it works
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {[
              "100% Free",
              "No credit card",
              "Instant PDF",
              "ATS-Optimized",
              "AI-Enhanced",
            ].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-primary" />
                {badge}
              </div>
            ))}
          </div>
        </div>

        {/* Hero preview card */}
        <div className="max-w-3xl mx-auto mt-16">
          <div className="relative rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4 rounded-md bg-background border border-border h-6 flex items-center px-3">
                <span className="text-xs text-muted-foreground">
                  resumemint.app/builder
                </span>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  Personal Information
                </div>
                {[
                  "Full Name",
                  "Email Address",
                  "Phone Number",
                  "LinkedIn Profile",
                ].map((label) => (
                  <div key={label} className="space-y-1">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="h-8 rounded-md bg-muted/60 border border-border" />
                  </div>
                ))}
                <div className="pt-2 flex gap-2">
                  <div className="h-8 rounded-md bg-primary/10 border border-primary/20 flex-1 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary font-medium">
                      Enhance with AI
                    </span>
                  </div>
                  <div className="h-8 rounded-md bg-muted border border-border w-24 flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      Save draft
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                  ATS Score
                </div>
                <div className="rounded-xl bg-muted/50 border border-border p-4 text-center">
                  <div className="font-display text-4xl font-bold text-primary mb-1">
                    87
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">
                    ATS Compatible
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: "87%" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  {["Summary ✓", "Keywords ✓", "Skills ✓"].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to land the job
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              From AI writing to ATS analysis — all the tools in one place,
              completely free.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-card p-6 card-hover"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Get interview-ready in minutes
            </h2>
            <p className="text-muted-foreground text-lg">
              Four simple steps to your perfect resume.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-4">
                <div className="font-display text-2xl font-bold text-primary/30 leading-none w-10 shrink-0 pt-0.5">
                  {num}
                </div>
                <div>
                  <h3 className="font-semibold mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Templates ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Professional templates for every role
            </h2>
            <p className="text-muted-foreground text-lg">
              Each template is designed to pass ATS filters and impress hiring
              managers.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                name: "ATS Professional",
                tag: "Most Popular",
                desc: "Clean, structured layout optimized for ATS parsing",
                badge: "bg-primary text-primary-foreground",
              },
              {
                name: "Modern Corporate",
                tag: "Recommended",
                desc: "Contemporary design for tech and corporate roles",
                badge: "bg-blue-500 text-white",
              },
              {
                name: "Minimal",
                tag: "Clean",
                desc: "Simple elegance for creative and consulting roles",
                badge: "bg-slate-500 text-white",
              },
            ].map(({ name, tag, desc, badge }) => (
              <div
                key={name}
                className="rounded-xl border border-border bg-card overflow-hidden card-hover group"
              >
                <div className="aspect-[3/4] bg-muted/50 relative flex items-center justify-center">
                  <div className="w-3/4 h-4/5 bg-background border border-border rounded-lg shadow-sm p-3 space-y-2">
                    <div className="h-2 bg-primary rounded w-2/3" />
                    <div className="h-1.5 bg-muted rounded w-1/2" />
                    <div className="border-t border-border pt-2 space-y-1.5">
                      {[80, 60, 70, 55, 65, 45].map((w, i) => (
                        <div
                          key={i}
                          className="h-1 bg-muted rounded"
                          style={{ width: `${w}%` }}
                        />
                      ))}
                    </div>
                  </div>
                  <span
                    className={`absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium ${badge}`}
                  >
                    {tag}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-sm mb-1">{name}</h3>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/register">
              <Button className="gap-2 font-medium">
                Try all templates free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Loved by job seekers everywhere
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, text, avatar }) => (
              <div
                key={name}
                className="rounded-xl border border-border bg-card p-6 card-hover"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed mb-5">
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {avatar}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{name}</div>
                    <div className="text-xs text-muted-foreground">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-muted/30 border-y border-border">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Shield className="w-3.5 h-3.5" /> Always free, no strings attached
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            ResumeMint AI is 100% free — forever.
          </p>
          <div className="rounded-2xl border border-primary/20 bg-card shadow-lg p-8 text-left">
            <div className="font-display text-4xl font-bold mb-1">₹0</div>
            <div className="text-muted-foreground text-sm mb-6">
              per month, forever
            </div>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited resumes",
                "3 professional templates",
                "AI-powered content enhancement",
                "ATS score analysis",
                "Cover letter generator",
                "Instant PDF download",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/register">
              <Button
                size="lg"
                className="w-full h-12 text-base font-semibold gap-2 group"
              >
                Get started for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight">
            Your dream job is one
            <br className="hidden sm:block" />
            <span className="gradient-text"> resume away</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Join thousands of job seekers who've landed interviews at top
            companies using ResumeMint AI.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="h-12 px-10 text-base font-semibold shadow-lg gap-2 group"
            >
              Build your resume now
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Free forever · No credit card · 2 minutes to start
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary flex items-center justify-center">
              <FileText className="w-3 h-3 text-primary-foreground" />
            </div>
            <span className="font-medium text-foreground">
              ResumeMint AI By Tanu
            </span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Privacy
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Terms
            </span>
            <span className="hover:text-foreground cursor-pointer transition-colors">
              Contact
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
