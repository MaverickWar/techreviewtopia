
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import { AuthPage } from "@/pages/auth/AuthPage";
import NotFound from "@/pages/NotFound";
import ArticlePage from "@/pages/ArticlePage";
import { CategoryPage } from "@/pages/CategoryPage";
import { SubcategoryPage } from "@/pages/SubcategoryPage";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ContentManager } from "./components/admin/ContentManager";
import { PagesManager } from "./components/admin/pages/PagesManager";
import { PageForm } from "./components/admin/pages/PageForm";
import { UsersManager } from "./components/admin/users/UsersManager";
import { ViewTracker } from "./components/analytics/ViewTracker";

import "./App.css";

function App() {
  return (
    <>
      <ViewTracker />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/category/:categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
        <Route path="/article/:id" element={<ArticlePage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="pages" element={<PagesManager />} />
          <Route path="pages/new" element={<PageForm />} />
          <Route path="pages/edit/:id" element={<PageForm />} />
          <Route path="users" element={<UsersManager />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
