
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, LayoutTemplate, Search, Plus, Globe, Pencil, Trash2, List, Grid3X3 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { getPageTypeName } from "../content-form/layoutUtils";

export const PagesManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageType, setPageType] = useState<"all" | "category" | "subcategory">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<any>(null);
  const [sortBy, setSortBy] = useState<"created" | "updated" | "title">("updated");

  const { data: pages, isLoading } = useQuery({
    queryKey: ['pages', pageType],
    queryFn: async () => {
      let query = supabase
        .from('pages')
        .select(`
          *,
          menu_category:menu_categories(name),
          menu_item:menu_items(name)
        `);

      if (pageType !== "all") {
        query = query.eq('page_type', pageType);
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

  // Filter and sort pages
  const filteredPages = pages
    ?.filter(page =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      } else if (sortBy === "created") {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      } else {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      }
    });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pages</h1>
          <p className="text-muted-foreground">Manage your website pages and navigation structure</p>
        </div>
        <Button 
          className="bg-orange-500 hover:bg-orange-600 gap-2"
          onClick={() => navigate("/admin/pages/new")}
        >
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      </div>
      
      <Separator />
      
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
        
        <div className="flex gap-2 items-center">
          <Select 
            value={sortBy} 
            onValueChange={(value) => setSortBy(value as "created" | "updated" | "title")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="created">Date Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex border rounded-md">
            <Button 
              variant="ghost" 
              size="icon"
              className={viewMode === "grid" ? "bg-muted" : ""}
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className={viewMode === "list" ? "bg-muted" : ""}
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <Tabs value={pageType} onValueChange={(value) => setPageType(value as any)}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Pages</TabsTrigger>
          <TabsTrigger value="category">Categories</TabsTrigger>
          <TabsTrigger value="subcategory">Subcategories</TabsTrigger>
        </TabsList>
        
        <TabsContent value={pageType} className="m-0">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-orange-500 rounded-full border-t-transparent"></div>
            </div>
          ) : filteredPages?.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No pages found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Create a new page to get started"}
              </p>
              <Button 
                className="mt-4 bg-orange-500 hover:bg-orange-600"
                onClick={() => navigate("/admin/pages/new")}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Page
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPages?.map((page) => (
                <Card 
                  key={page.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow border-t-4 border-t-orange-500"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {page.page_type === "category" ? (
                          <LayoutTemplate className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-sm font-medium text-muted-foreground capitalize">
                          {getPageTypeName(page.page_type)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(page.updated_at).toLocaleDateString()}
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg mb-2">{page.title}</h3>
                    
                    {page.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {page.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">/{page.slug}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
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
                    
                    <div className="flex gap-2 mt-4 justify-end">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              {filteredPages?.map((page, index) => (
                <div key={page.id} className={`p-4 flex items-center justify-between ${
                  index !== filteredPages.length - 1 ? 'border-b' : ''
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      page.page_type === 'category' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {page.page_type === "category" ? (
                        <LayoutTemplate className={`h-4 w-4 ${
                          page.page_type === 'category' ? 'text-blue-500' : 'text-green-500'
                        }`} />
                      ) : (
                        <FileText className={`h-4 w-4 ${
                          page.page_type === 'category' ? 'text-blue-500' : 'text-green-500'
                        }`} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{page.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="capitalize">{getPageTypeName(page.page_type)}</span>
                        <span>•</span>
                        <span>/{page.slug}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/pages/edit/${page.id}`)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(page)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
