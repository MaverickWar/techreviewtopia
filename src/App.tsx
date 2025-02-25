
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { PageLayout } from "@/components/layouts/PageLayout";
import IndexPage from "@/pages/Index";
import { CategoryPage } from "@/pages/CategoryPage";
import { SubcategoryPage } from "@/pages/SubcategoryPage";
import { ArticlePage } from "@/pages/ArticlePage";
import NotFound from "@/pages/NotFound";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ContentManager } from "@/components/admin/ContentManager";
import { PagesManager } from "@/components/admin/pages/PagesManager";
import { UsersManager } from "@/components/admin/users/UsersManager";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PageLayout><Outlet /></PageLayout>}>
          <Route index element={<IndexPage />} />
          <Route path=":categorySlug" element={<CategoryPage />} />
          <Route path=":categorySlug/:subcategorySlug" element={<SubcategoryPage />} />
          <Route path=":categorySlug/content/:contentId" element={<ArticlePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="content/*" element={<ContentManager />} />
          <Route path="pages/*" element={<PagesManager />} />
          <Route path="users" element={<UsersManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
