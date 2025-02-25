
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ContentManager } from "@/components/admin/ContentManager";
import { ContentForm } from "@/components/admin/ContentForm";
import { PagesManager } from "@/components/admin/pages/PagesManager";
import { PageForm } from "@/components/admin/pages/PageForm";
import { UsersManager } from "@/components/admin/users/UsersManager";
import { AuthPage } from "@/pages/auth/AuthPage";
import { CategoryPage } from "@/pages/CategoryPage";
import { SubcategoryPage } from "@/pages/SubcategoryPage";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show nothing while we check the initial auth state
  if (isAuthenticated === null) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/auth"
            element={isAuthenticated ? <Navigate to="/admin" /> : <AuthPage />}
          />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminLayout /> : <Navigate to="/auth" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="content/new" element={<ContentForm />} />
            <Route path="content/edit/:id" element={<ContentForm />} />
            <Route path="pages" element={<PagesManager />} />
            <Route path="pages/new" element={<PageForm />} />
            <Route path="pages/edit/:id" element={<PageForm />} />
            <Route path="users" element={<UsersManager />} />
          </Route>
          {/* Dynamic category and subcategory routes */}
          <Route path="/:categorySlug" element={<CategoryPage />} />
          <Route path="/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
