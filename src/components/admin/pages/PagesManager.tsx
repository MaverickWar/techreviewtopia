
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LayoutTemplate, Search, Plus, Globe } from "lucide-react";

export const PagesManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageType, setPageType] = useState<"all" | "category" | "subcategory">("all");

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const query = supabase
        .from('pages')
        .select(`
          *,
          menu_category:menu_category_id(name),
          menu_item:menu_item_id(name)
        `);

      if (pageType !== "all") {
        query.eq('page_type', pageType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const filteredPages = pages?.filter(page =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    page.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => navigate("/admin/pages/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Page
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={pageType === "all" ? "default" : "outline"}
            onClick={() => setPageType("all")}
          >
            All
          </Button>
          <Button
            variant={pageType === "category" ? "default" : "outline"}
            onClick={() => setPageType("category")}
          >
            Categories
          </Button>
          <Button
            variant={pageType === "subcategory" ? "default" : "outline"}
            onClick={() => setPageType("subcategory")}
          >
            Subcategories
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          filteredPages?.map((page) => (
            <Card 
              key={page.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {page.page_type === "category" ? (
                      <LayoutTemplate className="h-4 w-4 text-blue-500" />
                    ) : (
                      <FileText className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground capitalize">
                      {page.page_type}
                    </span>
                  </div>
                  <h3 className="font-semibold">{page.title}</h3>
                  {page.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {page.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">/{page.slug}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {page.menu_category && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                        {page.menu_category.name}
                      </span>
                    )}
                    {page.menu_item && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                        {page.menu_item.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
