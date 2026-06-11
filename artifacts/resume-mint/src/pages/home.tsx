import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import {
  CheckCircle2, Zap, Shield, Download, BarChart3, Sparkles,
  ChevronRight, Star, FileText, Target, Brain, ArrowRight
} from "lucide-react";

const features = [
  { icon: Brain, title: "AI-Powered Writing", desc: "Gemini AI enhances your resume with professional language and ATS-optimized keywords tailored to your target role." },
  { icon: Target, title: "ATS Score Analyzer", desc: "Instantly check how well your resume performs against Applicant Tracking Systems with actionable improvement suggestions." },
  { icon: FileText, title: "5 Professional Templates", desc: "Choose from ATS Professional, Modern Corporate, Executive, Minimal, and Creative layouts." },
  { icon: Download, title: "Instant PDF Export", desc: "Download a pixel-perfect PDF resume instantly — no watermarks, no limits." },
  { icon: Sparkles, title: "Cover Letter Generator", desc: "Generate a tailored cover letter for any company and role in seconds using your resume data." },
  { icon: Shield, title: "Secure & Private", desc: "Your data is protected with Firebase Authentication. Only you can access your resumes." },
];

const steps = [
  { num: "01", title: "Fill your details", desc: "Complete our guided 9-step form with your personal info, skills, projects, and experience." },
  { num: "02", title: "Enhance with AI", desc: "Let Gemini AI rewrite and optimize your content for your target role and ATS systems." },
  { num: "03", title: "Preview & customize", desc: "Pick a template, customize fonts and layout, and see live updates in real time." },
  { num: "04", title: "Download your resume", desc: "Export a high-quality PDF instantly and start applying — completely free." },
];

const testimonials = [
  { name: "Priya S.", role: "Software Engineer at Zepto", text: "Got shortlisted for 3 companies within a week of using ResumeMint. The AI rewrites made a huge difference.", rating: 5 },
  { name: "Rahul M.", role: "Data Analyst, Fresher", text: "As a fresher I had no idea how to write a resume. This tool made it incredibly easy and professional.", rating: 5 },
  { name: "Ananya K.", role: "UI/UX Designer at Flipkart", text: "The templates are stunning. The ATS score feature helped me understand exactly what recruiters look for.", rating: 5 },
];

const faqs = [
  { q: "Is ResumeMint AI free to use?", a: "Yes — all features including AI enhancement, ATS scoring, cover letter generation, and PDF download are completely free." },
  { q: "How does the AI resume enhancement work?", a: "We use Google Gemini to rewrite your skills, project descriptions, and experience with professional language and ATS-friendly keywords for your target role." },
  { q: "What is an ATS score?", a: "ATS (Applicant Tracking System) score indicates how well your resume will perform when scanned by automated hiring software. Higher scores mean better visibility to recruiters." },
  { q: "Can I create multiple resumes?", a: "Absolutely. You can create, save, and manage as many resumes as you need from your dashboard." },
  { q: "What resume templates are available?", a: "We offer ATS Professional, Modern Corporate, Executive, Minimal, and Creative templates — all designed to be ATS-friendly and visually polished." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <Badge variant="secondary" className="mb-6 gap-1.5 text-xs font-medium px-3 py-1">
            <Sparkles className="w-3 h-3 text-primary" />
            Powered by Google Gemini AI
          </Badge>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Create a Professional<br />
            <span className="text-primary">ATS Resume</span> in Minutes
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered resume builder trusted by students, freshers, and professionals.
            Build, enhance, and download your perfect resume — free, always.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 gap-2 font-semibold" data-testid="button-hero-start">
                Create Resume <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#templates">
              <Button size="lg" variant="outline" className="px-8 gap-2" data-testid="button-view-templates">
                View Templates
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["100% Free", "No Credit Card", "Instant PDF", "ATS Optimized"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Everything you need to land the job</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">One platform to write, optimize, and deliver your best resume.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-all duration-200">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-card/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">How it works</h2>
            <p className="text-muted-foreground text-lg">From blank page to job-ready resume in 4 simple steps.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative">
                <div className="text-4xl font-display font-bold text-primary/20 mb-3">{num}</div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Resume templates</h2>
            <p className="text-muted-foreground text-lg">Professional designs that pass ATS and impress recruiters.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {["ATS Professional", "Modern Corporate", "Executive", "Minimal", "Creative"].map((name, i) => (
              <div key={name} className="aspect-[3/4] rounded-lg border border-border/60 bg-card flex flex-col items-center justify-end p-3 hover:border-primary/40 transition-all cursor-pointer group">
                <div className="flex-1 w-full rounded-sm bg-muted/30 mb-2 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
                </div>
                <span className="text-xs text-center font-medium text-muted-foreground group-hover:text-foreground transition-colors">{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/register">
              <Button size="lg" className="gap-2" data-testid="button-start-building">
                Start building free <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ATS Benefits */}
      <section className="py-24 px-4 bg-card/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 gap-1.5 text-xs">
                <BarChart3 className="w-3 h-3 text-primary" /> ATS Optimization
              </Badge>
              <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Beat the bots. Reach real recruiters.</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Over 75% of resumes are rejected by ATS before a human ever sees them. ResumeMint AI ensures your resume gets through with the right keywords, formatting, and structure.
              </p>
              <ul className="space-y-3">
                {["Keyword optimization for your target role", "ATS-safe formatting and fonts", "Section structure that scanners love", "Real-time score with missing keyword alerts"].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ATS Score</span>
                  <span className="text-2xl font-display font-bold text-primary">87/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: "87%" }} />
                </div>
                <div className="space-y-2 pt-2">
                  {["Keywords matched", "Format compliance", "Section completeness"].map((label, i) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <div className="flex items-center gap-1 text-primary">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="font-medium">{["92%", "100%", "89%"][i]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg mb-12">All features are free during our launch period.</p>
          <div className="rounded-2xl border border-primary/40 bg-card p-8 shadow-lg shadow-primary/5">
            <div className="inline-block bg-primary/10 text-primary text-sm font-semibold px-3 py-1 rounded-full mb-4">Currently Free</div>
            <div className="text-5xl font-display font-bold mb-2">₹0</div>
            <p className="text-muted-foreground mb-8">Everything included, no credit card required.</p>
            <ul className="space-y-3 text-left max-w-xs mx-auto mb-8">
              {["Unlimited resumes", "AI enhancement with Gemini", "ATS score analysis", "Cover letter generation", "5 professional templates", "Instant PDF download"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />{f}
                </li>
              ))}
            </ul>
            <Link href="/register">
              <Button size="lg" className="w-full max-w-xs gap-2" data-testid="button-pricing-start">
                Get started free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-card/30 border-y border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Loved by job seekers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, text, rating }) => (
              <div key={name} className="p-6 rounded-xl border border-border/60 bg-card">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-lg border border-border/60 bg-card overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-medium text-sm gap-3">
                  {q}
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 border-t border-border/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">Ready to get hired?</h2>
          <p className="text-muted-foreground mb-8">Build your resume in minutes and start applying today — completely free.</p>
          <Link href="/register">
            <Button size="lg" className="gap-2 px-8" data-testid="button-cta-start">
              Create your resume <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-display font-semibold">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span>ResumeMint AI</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ResumeMint AI. Built for job seekers.</p>
        </div>
      </footer>
    </div>
  );
}
