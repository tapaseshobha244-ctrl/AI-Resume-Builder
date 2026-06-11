import { Link } from "wouter";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Lock, LayoutDashboard } from "lucide-react";

export default function Payment() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Payment System</h1>
          <div className="rounded-xl border border-border/60 bg-card p-6 mb-6">
            <p className="text-muted-foreground leading-relaxed">
              Payment system will be enabled in future updates.
            </p>
            <p className="text-sm text-primary mt-3 font-medium">
              All features are currently free — enjoy unlimited access!
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="gap-2 w-full" data-testid="button-go-dashboard">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
