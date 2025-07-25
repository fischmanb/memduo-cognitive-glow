
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./components/HomePage";
import AccountSetup from "./pages/AccountSetup";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import OnboardingFlow from "./components/OnboardingFlow";
import MainLayout from "./components/MainLayout";
import Chat from "./pages/Chat";
import KnowledgeBase from "./pages/KnowledgeBase";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Setup from "./pages/Setup";

const queryClient = new QueryClient();

const App = () => {
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminAuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public waitlist/demo page for non-authenticated users */}
              <Route path="/" element={<HomePage />} />
              <Route path="/demo" element={<Index />} />
              <Route path="/setup" element={<AccountSetup />} />
              <Route path="/magic-setup" element={<Setup />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/onboarding" 
                element={
                  <ProtectedRoute>
                    <OnboardingFlow 
                      onComplete={() => {
                        console.log('Onboarding completed');
                        window.location.href = '/';
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
                      <KnowledgeBase />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Chat />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Settings />
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/help" 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <Help />
                    </MainLayout>
                  </ProtectedRoute>
               } 
               />
               
               {/* Admin Routes - These bypass regular ProtectedRoute */}
               <Route 
                 path="/admin" 
                 element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} 
               />
               <Route 
                 path="/admin-dashboard" 
                 element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} 
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
};

export default App;
