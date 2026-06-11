import { Link, useLocation } from "wouter";
import { useAuthContext } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LayoutDashboard, LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function Logo() {
  return (
    <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shadow-sm">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-primary-foreground">
        <path d="M3 2h7l3 3v9H3V2z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M10 2v3h3M5 7h6M5 9.5h6M5 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

export function Navbar() {
  const { user, signOut } = useAuthContext();
  const { toggleTheme, theme } = useTheme();
  const [location] = useLocation();
  const isLanding = location === "/";

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <Logo />
          <span className="font-display font-semibold text-base tracking-tight hidden sm:block">
            ResumeMint <span className="text-primary">AI</span>
          </span>
        </Link>

        {/* Nav links — authenticated */}
        {user && (
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/dashboard">
              <Button
                variant={location === "/dashboard" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 gap-1.5"
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-1.5 ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-md"
            aria-label="Toggle theme"
            data-testid="button-toggle-theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 pl-1.5 pr-2 rounded-md"
                  data-testid="button-user-menu"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] font-semibold bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {user.displayName?.split(" ")[0] ?? user.email?.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold truncate">{user.displayName ?? "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={signOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  data-testid="button-signout"
                >
                  <LogOut className="h-3.5 w-3.5 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : isLanding ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-8 text-sm font-medium" data-testid="link-login">
                  Sign in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="h-8 text-sm font-medium shadow-sm" data-testid="link-register">
                  Get started free
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
