import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FileText, Eye, EyeOff, Loader2 } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { toast } from "sonner";

export default function Register() {
  const { signInWithGoogle, signUpWithEmail, user, loading } = useAuthContext();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) {
    setLocation("/dashboard");
    return null;
  }

  const handleGoogle = async () => {
    try {
      setSubmitting(true);
      await signInWithGoogle();
      setLocation("/dashboard");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    if (password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    try {
      setSubmitting(true);
      await signUpWithEmail(name, email, password);
      toast.success("Account created! Welcome to ResumeMint AI.");
      setLocation("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("email-already-in-use")) toast.error("Email already in use. Try signing in.");
      else toast.error("Could not create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-semibold text-xl">ResumeMint <span className="text-primary">AI</span></span>
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="font-display text-xl font-bold mb-1 text-center">Create your account</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Start building your professional resume for free
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 mb-4"
            onClick={handleGoogle}
            disabled={submitting}
            data-testid="button-google-signup"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SiGoogle className="w-4 h-4" />}
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">Full name</Label>
              <Input id="name" type="text" placeholder="Your name" value={name}
                onChange={(e) => setName(e.target.value)} className="mt-1" data-testid="input-name" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={(e) => setEmail(e.target.value)} className="mt-1" data-testid="input-email" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm">Password</Label>
              <div className="relative mt-1">
                <Input id="password" type={showPw ? "text" : "password"} placeholder="Min. 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10"
                  data-testid="input-password" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={submitting} data-testid="button-register-submit">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create account
            </Button>
          </form>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium" data-testid="link-login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
