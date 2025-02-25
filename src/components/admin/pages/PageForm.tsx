
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { LayoutTemplate, FileText } from "lucide-react";

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
    }
  );

  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch menu categories for the dropdown
  const { data: menuCategories } = useQuery({
    queryKey: ['menu_categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch menu items for the dropdown (if needed for subcategory)
  const { data: menuItems } = useQuery({
    queryKey: ['menu_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from("pages")
        .upsert({
          ...data,
          id: initialData?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
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
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.page_type === "category" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, page_type: "category" }))
                }
              >
                <LayoutTemplate className="mr-2 h-4 w-4" />
                Category
              </Button>
              <Button
                type="button"
                variant={formData.page_type === "subcategory" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, page_type: "subcategory" }))
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Subcategory
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
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

          <div>
            <label htmlFor="slug" className="block text-sm font-medium mb-1">
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

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
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

          {formData.page_type === "category" && menuCategories && (
            <div>
              <label htmlFor="menuCategory" className="block text-sm font-medium mb-1">
                Menu Category
              </label>
              <select
                id="menuCategory"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.menu_category_id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, menu_category_id: e.target.value || undefined }))
                }
              >
                <option value="">Select a menu category</option>
                {menuCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {formData.page_type === "subcategory" && menuItems && (
            <div>
              <label htmlFor="menuItem" className="block text-sm font-medium mb-1">
                Menu Item
              </label>
              <select
                id="menuItem"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.menu_item_id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, menu_item_id: e.target.value || undefined }))
                }
              >
                <option value="">Select a menu item</option>
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
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
