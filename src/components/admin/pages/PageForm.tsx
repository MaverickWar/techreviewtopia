import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { LayoutTemplate, FileText, LayoutGrid, Image as ImageIcon } from "lucide-react";

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
      layout_settings: {},
    }
  );

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Updated categories query to fetch both pages and their menu categories
  const { data: categories } = useQuery({
    queryKey: ['parent_categories'],
    queryFn: async () => {
      const { data: categoryPages, error: pagesError } = await supabase
        .from('pages')
        .select(`
          id,
          title,
          menu_category_id,
          menu_category:menu_categories(id, name)
        `)
        .eq('page_type', 'category')
        .order('title');

      if (pagesError) {
        console.error('Error fetching categories:', pagesError);
        throw pagesError;
      }

      console.log('Category pages fetched:', categoryPages);

      // Filter pages that have a valid menu category
      const validCategories = categoryPages.filter(page => 
        page.menu_category_id !== null && page.menu_category !== null
      );

      console.log('Valid categories:', validCategories);
      return validCategories;
    }
  });

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

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // First, create or update the page
      const { data: page, error: pageError } = await supabase
        .from("pages")
        .upsert({
          ...data,
          id: initialData?.id,
        })
        .select()
        .single();

      if (pageError) throw pageError;

      // If this is a new category page, create the menu category
      if (data.page_type === 'category' && !initialData?.id) {
        const menuCategory = await createMenuCategory(page.id, data.title, data.slug);
        console.log('Created menu category:', menuCategory);
      }

      // If this is a new subcategory page
      if (data.page_type === 'subcategory' && data.menu_category_id) {
        console.log('Creating subcategory with menu_category_id:', data.menu_category_id);
        
        // Update parent category to megamenu if it's not already
        const { error: updateError } = await supabase
          .from('menu_categories')
          .update({ type: 'megamenu' })
          .eq('id', data.menu_category_id);

        if (updateError) throw updateError;

        // Create menu item for subcategory
        const menuItem = await createMenuItem(data.menu_category_id, data.title, data.slug);
        console.log('Created menu item:', menuItem);

        // Update page with menu_item_id
        const { error: updatePageError } = await supabase
          .from('pages')
          .update({ menu_item_id: menuItem.id })
          .eq('id', page.id);

        if (updatePageError) throw updatePageError;
      }

      return page;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pages"] });
      toast({
        title: `Page ${initialData ? "updated" : "created"} successfully`,
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

        {/* Updated Parent Category Selection */}
        {formData.page_type === "subcategory" && (
          <div className="space-y-2">
            <label htmlFor="parentCategory" className="block text-sm font-medium">
              Parent Category
            </label>
            <select
              id="parentCategory"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.menu_category_id || ""}
              onChange={(e) => {
                console.log('Selected category ID:', e.target.value);
                setFormData((prev) => ({
                  ...prev,
                  menu_category_id: e.target.value || undefined
                }));
              }}
              required
            >
              <option value="">Select a parent category</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.menu_category_id}>
                  {category.title} {/* Display the page title */}
                </option>
              ))}
            </select>
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
