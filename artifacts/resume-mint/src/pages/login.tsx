import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuthContext, getFirebaseAuthError } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { toast } from "sonner";

export default function Login() {
  const { signInWithGoogle, signInWithEmail, user, loading, isConfigured, resetPassword } = useAuthContext();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) return null;
  if (user) return null;

  const handleGoogle = async () => {
    if (!isConfigured) { toast.error(getFirebaseAuthError("auth/not-configured")); return; }
    try {
      setSubmitting(true);
      // signInWithRedirect navigates the page to Google — it doesn't return here.
      // When the user comes back, onAuthStateChanged fires and navigates to /dashboard.
      await signInWithGoogle();
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      if (code !== "auth/popup-closed-by-user" && code !== "auth/cancelled-popup-request" && code !== "auth/redirect-cancelled-by-user") {
        toast.error(getFirebaseAuthError(code));
      }
      setSubmitting(false);
    }
    // Don't call setSubmitting(false) on success — page is navigating away
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) { toast.error(getFirebaseAuthError("auth/not-configured")); return; }
    if (!email || !password) return;
    try {
      setSubmitting(true);
      await signInWithEmail(email, password);
      setLocation("/dashboard");
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      toast.error(getFirebaseAuthError(code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfigured) { toast.error(getFirebaseAuthError("auth/not-configured")); return; }
    if (!email) { toast.error("Enter your email address first"); return; }
    try {
      setSubmitting(true);
      await resetPassword(email);
      toast.success("Password reset email sent! Check your inbox.");
      setForgotMode(false);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? "";
      toast.error(getFirebaseAuthError(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 justify-center mb-8 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
              <path d="M3 2h7l3 3v9H3V2z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 2v3h3M5 7h6M5 9.5h6M5 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            ResumeMint <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Firebase config warning */}
        {!isConfigured && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 mb-4 text-sm text-amber-800 dark:text-amber-200">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Firebase is not configured. Add <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_FIREBASE_API_KEY</code> and <code className="font-mono text-xs bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_FIREBASE_APP_ID</code> to enable auth.</span>
          </div>
        )}

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
          <h1 className="font-display text-2xl font-bold mb-1.5 text-center">
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
                className="w-full gap-2.5 h-10 font-medium"
                onClick={handleGoogle}
                disabled={submitting || !isConfigured}
                data-testid="button-google-signin"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SiGoogle className="w-3.5 h-3.5" />
                )}
                Continue with Google
              </Button>
              <div className="flex items-center gap-3 my-5">
                <Separator className="flex-1" />
                <span className="text-xs text-muted-foreground px-1">or</span>
                <Separator className="flex-1" />
              </div>
            </>
          )}

          <form onSubmit={forgotMode ? handleForgot : handleEmail} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={submitting}
                data-testid="input-email"
                required
              />
            </div>
            {!forgotMode && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <button
                    type="button"
                    onClick={() => setForgotMode(true)}
                    className="text-xs text-primary hover:underline"
                    data-testid="button-forgot-password"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    autoComplete="current-password"
                    disabled={submitting}
                    data-testid="input-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    data-testid="button-toggle-password"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            <Button
              type="submit"
              className="w-full h-10 font-medium"
              disabled={submitting || !isConfigured}
              data-testid="button-signin-submit"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {forgotMode ? "Send reset link" : "Sign in"}
            </Button>
            {forgotMode && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setForgotMode(false)}
              >
                ← Back to sign in
              </Button>
            )}
          </form>
        </div>

        {!forgotMode && (
          <p className="text-sm text-muted-foreground text-center mt-5">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium" data-testid="link-register">
              Create one free
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
