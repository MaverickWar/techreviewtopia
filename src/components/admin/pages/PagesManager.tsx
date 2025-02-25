
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LayoutTemplate, Search, Plus, Globe, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const PagesManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageType, setPageType] = useState<"all" | "category" | "subcategory">("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<any>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages'],
    queryFn: async () => {
      const query = supabase
        .from('pages')
        .select(`
          *,
          menu_category:menu_categories(name),
          menu_item:menu_items(name)
        `);

      if (pageType !== "all") {
        query.eq('page_type', pageType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (page: any) => {
      // If it's a category, delete the menu_category first
      if (page.page_type === 'category' && page.menu_category_id) {
        const { error: menuCategoryError } = await supabase
          .from('menu_categories')
          .delete()
          .eq('id', page.menu_category_id);
        if (menuCategoryError) throw menuCategoryError;
      }

      // If it's a subcategory, delete the menu_item first
      if (page.page_type === 'subcategory' && page.menu_item_id) {
        const { error: menuItemError } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', page.menu_item_id);
        if (menuItemError) throw menuItemError;
      }

      // Delete the page
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', page.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      toast({
        title: "Page deleted",
        description: "The page has been deleted successfully.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "There was an error deleting the page. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (page: any) => {
    setPageToDelete(page);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pageToDelete) {
      deleteMutation.mutate(pageToDelete);
    }
  };

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
              className="p-6 hover:shadow-lg transition-shadow"
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
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(page)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this page{pageToDelete?.page_type === 'category' ? ' and all its associated menu items' : ''}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
