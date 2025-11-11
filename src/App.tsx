import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { ErrorBoundary } from "@/components/errors/ErrorBoundary";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import Landing from "./pages/Landing";
import Plans from "./pages/Plans";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Index from "./pages/Index";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOrganizations from "./pages/admin/Organizations";
import AdminUsers from "./pages/admin/Users";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
// import Suporte from "./pages/Suporte";
import NotFound from "./pages/NotFound";
import WorkspaceSelect from "./pages/WorkspaceSelect";
import WorkspaceNew from "./pages/WorkspaceNew";
import WorkspaceSettings from "./pages/WorkspaceSettings";
import Onboarding from "./pages/Onboarding";
import InviteAccept from "./pages/InviteAccept";
import PlanUpgrade from "./pages/PlanUpgrade";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";

const queryClient = new QueryClient();

const LegacyProjectRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/app/projects/${id}`} replace />;
};

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
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/invite/accept" element={<InviteAccept />} />
                
                {/* Protected Routes - Onboarding */}
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                
                {/* Protected Routes - Workspace */}
                <Route path="/workspace/select" element={<ProtectedRoute><WorkspaceSelect /></ProtectedRoute>} />
                <Route path="/workspace/new" element={<ProtectedRoute><WorkspaceNew /></ProtectedRoute>} />
                <Route path="/workspace/:id/settings" element={<ProtectedRoute><WorkspaceSettings /></ProtectedRoute>} />
                
                {/* Protected Routes - App */}
                <Route path="/app" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/app/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                <Route path="/app/projects/:id" element={<ProtectedRoute><ProjectDetails /></ProtectedRoute>} />
                <Route path="/app/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/app/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/app/plan-upgrade" element={<ProtectedRoute><PlanUpgrade /></ProtectedRoute>} />
                {/* <Route path="/app/suporte" element={<ProtectedRoute><Suporte /></ProtectedRoute>} /> */}
                
                {/* Protected Routes - Subscription */}
                <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccess /></ProtectedRoute>} />
                <Route path="/subscription/cancel" element={<ProtectedRoute><SubscriptionCancel /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute><AdminRoute><AdminDashboard /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/organizations" element={<ProtectedRoute><AdminRoute><AdminOrganizations /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute><AdminRoute><AdminUsers /></AdminRoute></ProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<ProtectedRoute><AdminRoute><AdminSubscriptions /></AdminRoute></ProtectedRoute>} />
                
                {/* Legacy Route Redirects */}
                <Route path="/projects" element={<Navigate to="/app/projects" replace />} />
                <Route path="/projects/:id" element={<LegacyProjectRedirect />} />
                <Route path="/clients" element={<Navigate to="/app/clients" replace />} />
                <Route path="/reports" element={<Navigate to="/app/reports" replace />} />
                
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
