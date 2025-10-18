import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import WorkspaceSelect from "./pages/WorkspaceSelect";
import WorkspaceNew from "./pages/WorkspaceNew";
import WorkspaceSettings from "./pages/WorkspaceSettings";
import InviteAccept from "./pages/InviteAccept";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <WorkspaceProvider>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/workspace/select" element={<ProtectedRoute><WorkspaceSelect /></ProtectedRoute>} />
                <Route path="/workspace/new" element={<ProtectedRoute><WorkspaceNew /></ProtectedRoute>} />
                <Route path="/workspace/:id/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
                <Route path="/invite/accept" element={<InviteAccept />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </WorkspaceProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
