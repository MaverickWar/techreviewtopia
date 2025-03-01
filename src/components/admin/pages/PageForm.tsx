import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { LayoutTemplate, FileText, LayoutGrid, Image as ImageIcon, Loader2 } from "lucide-react";

interface PageFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    slug: string;
    page_type: "category" | "subcategory";
    menu_category_id?: string;
    menu_item_id?: string;
    is_active: boolean;
    template_type?: string;
    layout_settings?: Record<string, any>;
  };
}

export const PageForm = ({ initialData }: PageFormProps) => {
  const { id } = useParams();
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      slug: "",
      page_type: "category" as const,
      menu_category_id: undefined,
      menu_item_id: undefined,
      is_active: true,
      template_type: "standard",
      layout_settings: {} as Record<string, any>,
    }
  );

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pageData, isLoading: isLoadingPage } = useQuery({
    queryKey: ['page', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          menu_category:menu_categories(*),
          menu_item:menu_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching page:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (pageData) {
      setFormData({
        id: pageData.id,
        title: pageData.title,
        description: pageData.description || "",
        slug: pageData.slug,
        page_type: pageData.page_type,
        menu_category_id: pageData.menu_category_id,
        menu_item_id: pageData.menu_item_id,
        is_active: pageData.is_active,
        template_type: pageData.template_type || "standard",
        layout_settings: (pageData.layout_settings as Record<string, any>) || {},
      });
    }
  }, [pageData]);

  const createMenuCategory = async (pageId: string, pageTitle: string, pageSlug: string) => {
    const { data, error } = await supabase
      .from('menu_categories')
      .insert([
        { 
          name: pageTitle,
          slug: pageSlug,
          type: 'standard'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Update the page with the new menu_category_id
    const { error: updateError } = await supabase
      .from('pages')
      .update({ menu_category_id: data.id })
      .eq('id', pageId);

    if (updateError) throw updateError;

    return data;
  };

  const createMenuItem = async (categoryId: string, pageTitle: string, pageSlug: string) => {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([
        {
          category_id: categoryId,
          name: pageTitle,
          slug: pageSlug
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Fetch existing menu categories
  const { data: menuCategories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['menu_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      console.log('Fetched menu categories:', data);
      return data;
    }
  });

  // Fetch menu items when a category is selected
  const { data: menuItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['menu_items', formData.menu_category_id],
    queryFn: async () => {
      if (!formData.menu_category_id) return [];
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', formData.menu_category_id)
        .order('name');
      
      if (error) throw error;
      console.log('Fetched menu items:', data);
      return data;
    },
    enabled: !!formData.menu_category_id
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (data.page_type === 'subcategory' && !data.menu_category_id) {
        throw new Error('Category selection is required for subcategory pages');
      }

      // First create/update the page
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .upsert({
          ...data,
          id: data.id || undefined,
          layout_settings: data.layout_settings || {},
        })
        .select()
        .single();

      if (pageError) throw pageError;

      if (data.page_type === 'category') {
        // Update menu category if it exists
        if (data.menu_category_id) {
          const { error: menuCategoryError } = await supabase
            .from('menu_categories')
            .update({
              name: data.title,
              slug: data.slug
            })
            .eq('id', data.menu_category_id);

          if (menuCategoryError) throw menuCategoryError;
        }
        // Create new menu category if it doesn't exist
        else {
          const { data: menuCategory, error: menuCategoryError } = await supabase
            .from('menu_categories')
            .insert([
              { 
                name: data.title,
                slug: data.slug,
                type: 'standard'
              }
            ])
            .select()
            .single();

          if (menuCategoryError) throw menuCategoryError;

          // Update the page with the new menu_category_id
          const { error: updateError } = await supabase
            .from('pages')
            .update({ menu_category_id: menuCategory.id })
            .eq('id', page.id);

          if (updateError) throw updateError;
        }
      }
      // Handle subcategory page
      else if (data.page_type === 'subcategory' && data.menu_category_id) {
        // Update existing menu item
        if (data.menu_item_id) {
          const { error: updateMenuItemError } = await supabase
            .from('menu_items')
            .update({
              name: data.title,
              slug: data.slug,
              description: data.description
            })
            .eq('id', data.menu_item_id);

          if (updateMenuItemError) throw updateMenuItemError;
        }
        // Create new menu item
        else {
          const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_items')
            .insert([
              {
                category_id: data.menu_category_id,
                name: data.title,
                slug: data.slug,
                description: data.description
              }
            ])
            .select()
            .single();

          if (menuItemError) throw menuItemError;

          // Update page with menu_item_id
          const { error: updatePageError } = await supabase
            .from('pages')
            .update({ menu_item_id: menuItem.id })
            .eq('id', page.id);

          if (updatePageError) throw updatePageError;
        }
      }

      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({
        title: `Page ${id ? "updated" : "created"} successfully`,
        description: formData.title,
      });
      navigate("/admin/pages");
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !initialData?.slug) {
      setFormData(prev => ({
        ...prev,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      }));
    }
  }, [formData.title, initialData?.slug]);

  if (isLoadingPage) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading page data...</span>
      </div>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <div className="flex items-center gap-2">
            {formData.page_type === "category" ? (
              <LayoutTemplate className="h-5 w-5 text-blue-500" />
            ) : (
              <FileText className="h-5 w-5 text-green-500" />
            )}
            <h2 className="text-2xl font-bold">
              {initialData ? "Edit" : "Create"} Page
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Page Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Page Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.page_type === "category" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ 
                    ...prev, 
                    page_type: "category",
                    menu_category_id: undefined,
                    menu_item_id: undefined 
                  }))
                }
                className="flex items-center gap-2"
              >
                <LayoutGrid className="h-4 w-4" />
                Category Page
              </Button>
              <Button
                type="button"
                variant={formData.page_type === "subcategory" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, page_type: "subcategory" }))
                }
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Subcategory Page
              </Button>
            </div>
          </div>

          {/* Title & Slug */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="slug" className="block text-sm font-medium">
                Slug
              </label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>

          {/* Menu Category Selection */}
          {formData.page_type === "subcategory" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Category</label>
                {categoriesLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.menu_category_id || ""}
                    onChange={(e) => {
                      setFormData(prev => ({
                        ...prev,
                        menu_category_id: e.target.value || undefined,
                        menu_item_id: undefined // Reset menu item when category changes
                      }));
                    }}
                    required
                  >
                    <option value="">Select a category</option>
                    {menuCategories?.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {formData.menu_category_id && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Menu Item</label>
                  {itemsLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading items...</span>
                    </div>
                  ) : (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.menu_item_id || ""}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          menu_item_id: e.target.value || undefined
                        }));
                      }}
                    >
                      <option value="">Create new item</option>
                      {menuItems?.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Template Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Template</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.template_type === "standard" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, template_type: "standard" }))
                }
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <LayoutGrid className="h-8 w-8" />
                <span>Standard Template</span>
                <span className="text-xs text-muted-foreground">
                  Basic layout with header and content sections
                </span>
              </Button>
              <Button
                type="button"
                variant={formData.template_type === "featured" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, template_type: "featured" }))
                }
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <ImageIcon className="h-8 w-8" />
                <span>Featured Template</span>
                <span className="text-xs text-muted-foreground">
                  Hero section with featured content grid
                </span>
              </Button>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.is_active ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, is_active: true }))
                }
              >
                Active
              </Button>
              <Button
                type="button"
                variant={!formData.is_active ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, is_active: false }))
                }
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/pages")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
