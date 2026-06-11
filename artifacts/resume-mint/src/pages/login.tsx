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

export default function Login() {
  const { signInWithGoogle, signInWithEmail, user, loading } = useAuthContext();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const { resetPassword } = useAuthContext();

  if (!loading && user) {
    setLocation("/dashboard");
    return null;
  }

  const handleGoogle = async () => {
    try {
      setSubmitting(true);
      await signInWithGoogle();
      setLocation("/dashboard");
    } catch (e: unknown) {
      toast.error("Google sign-in failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      setSubmitting(true);
      await signInWithEmail(email, password);
      setLocation("/dashboard");
    } catch (e: unknown) {
      toast.error("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Enter your email first"); return; }
    try {
      setSubmitting(true);
      await resetPassword(email);
      toast.success("Password reset email sent!");
      setForgotMode(false);
    } catch {
      toast.error("Could not send reset email. Check your address.");
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
          <h1 className="font-display text-xl font-bold mb-1 text-center">
            {forgotMode ? "Reset password" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {forgotMode ? "Enter your email to receive a reset link" : "Sign in to your account"}
          </p>

          {!forgotMode && (
            <>
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2 mb-4"
                onClick={handleGoogle}
                disabled={submitting}
                data-testid="button-google-signin"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SiGoogle className="w-4 h-4" />}
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>
            </>
          )}

          <form onSubmit={forgotMode ? handleForgot : handleEmail} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                data-testid="input-email"
                required
              />
            </div>
            {!forgotMode && (
              <div>
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    data-testid="input-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  className="text-xs text-primary hover:underline mt-1 block"
                  data-testid="button-forgot-password"
                >
                  Forgot password?
                </button>
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={submitting}
              data-testid="button-signin-submit"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {forgotMode ? "Send reset link" : "Sign in"}
            </Button>
            {forgotMode && (
              <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotMode(false)}>
                Back to sign in
              </Button>
            )}
          </form>
        </div>

        {!forgotMode && (
          <p className="text-sm text-muted-foreground text-center mt-6">
            No account?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline font-medium" data-testid="link-register">Create one</a>
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
