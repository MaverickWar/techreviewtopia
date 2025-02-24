
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { ContentManager } from "@/components/admin/ContentManager";
import { ContentForm } from "@/components/admin/ContentForm";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="content/new" element={<ContentForm />} />
            <Route path="content/edit/:id" element={<ContentForm />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
