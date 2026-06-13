import "@/lib/api-setup";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Builder from "@/pages/builder";
import Preview from "@/pages/preview";
import AtsScore from "@/pages/ats-score";
import CoverLetter from "@/pages/cover-letter";
import CareerDashboard from "@/pages/career-dashboard";
import InterviewQuestions from "@/pages/interview-questions";
import LinkedInProfile from "@/pages/linkedin-profile";
import ProjectSuggestions from "@/pages/project-suggestions";
import JobRecommendations from "@/pages/job-recommendations";
import ResumeDoctor from "@/pages/resume-doctor";
import Payment from "@/pages/payment";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/builder/:resumeId" component={Builder} />
      <Route path="/preview/:resumeId" component={Preview} />
      <Route path="/ats-score/:resumeId" component={AtsScore} />
      <Route path="/cover-letter/:resumeId" component={CoverLetter} />
      <Route path="/career-dashboard/:resumeId" component={CareerDashboard} />
      <Route path="/interview-questions/:resumeId" component={InterviewQuestions} />
      <Route path="/linkedin-profile/:resumeId" component={LinkedInProfile} />
      <Route path="/project-suggestions/:resumeId" component={ProjectSuggestions} />
      <Route path="/job-recommendations/:resumeId" component={JobRecommendations} />
      <Route path="/resume-doctor/:resumeId" component={ResumeDoctor} />
      <Route path="/payment" component={Payment} />
      <Route path="/admin" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
            <SonnerToaster position="top-right" richColors />
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
