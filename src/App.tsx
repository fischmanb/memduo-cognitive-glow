
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AccountSetup from "./pages/AccountSetup";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import OnboardingFlow from "./components/OnboardingFlow";
import MainLayout from "./components/MainLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/setup" element={<AccountSetup />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <OnboardingFlow 
                      onComplete={(data) => {
                        console.log('Onboarding completed:', data);
                        // TODO: Save onboarding data to database
                        window.location.href = '/dashboard';
                      }} 
                    />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/knowledge-base" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="text-white">Knowledge Base - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="text-white">Chat - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="text-white">Settings - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="text-white">Help Desk - Coming Soon</div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AdminAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
