import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Star } from "lucide-react";

interface ContentFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string;
    content: string;
    type: "article" | "review";
    status: "draft" | "published";
    author_id?: string;
    page_id?: string;
  };
}

// Temporary test author ID until we implement authentication
const TEST_AUTHOR_ID = "00000000-0000-0000-0000-000000000000";

export const ContentForm = ({ initialData }: ContentFormProps) => {
  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      description: "",
      content: "",
      type: "article" as const,
      status: "draft" as const,
      author_id: TEST_AUTHOR_ID,
      page_id: null as string | null,
    }
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories (pages with type 'category')
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title')
        .eq('page_type', 'category');
      
      console.log('Categories query result:', data);
      if (error) throw error;
      return data;
    },
  });

  // Fetch subcategories based on selected category
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategoryId],
    enabled: !!selectedCategoryId,
    queryFn: async () => {
      console.log('Fetching subcategories for category:', selectedCategoryId);
      
      // First get the menu category ID for the selected page
      const { data: categoryPage, error: categoryError } = await supabase
        .from('pages')
        .select('menu_category_id')
        .eq('id', selectedCategoryId)
        .single();

      if (categoryError) {
        console.error('Category error:', categoryError);
        throw categoryError;
      }

      console.log('Category page data:', categoryPage);

      if (!categoryPage?.menu_category_id) {
        console.log('No menu category ID found for page');
        return [];
      }

      // Now get subcategories that match this menu category ID
      const { data: pagesData, error: pagesError } = await supabase
        .from('pages')
        .select('id, title')
        .eq('page_type', 'subcategory')
        .eq('menu_category_id', categoryPage.menu_category_id);

      console.log('Subcategories found:', pagesData);

      if (pagesError) {
        console.error('Pages error:', pagesError);
        throw pagesError;
      }
      return pagesData || [];
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Create the content
      const { data: content, error: contentError } = await supabase
        .from("content")
        .upsert({
          ...data,
          id: initialData?.id,
          author_id: TEST_AUTHOR_ID,
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // If we have a page_id, create the page_content relationship
      if (data.page_id) {
        const { error: pageContentError } = await supabase
          .from("page_content")
          .upsert({
            page_id: data.page_id,
            content_id: content.id,
            order_index: 0, // Default to beginning of the list
          });

        if (pageContentError) throw pageContentError;
      }

      return content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: `Content ${initialData ? "updated" : "created"} successfully`,
        description: formData.title,
      });
      navigate("/admin/content");
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
            {formData.type === "article" ? (
              <FileText className="h-5 w-5 text-blue-500" />
            ) : (
              <Star className="h-5 w-5 text-yellow-500" />
            )}
            <h2 className="text-2xl font-bold">
              {initialData ? "Edit" : "Create"} {formData.type}
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "article" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "article" }))
                }
              >
                <FileText className="mr-2 h-4 w-4" />
                Article
              </Button>
              <Button
                type="button"
                variant={formData.type === "review" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "review" }))
                }
              >
                <Star className="mr-2 h-4 w-4" />
                Review
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2"
                value={selectedCategoryId || ''}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value || null);
                  setFormData(prev => ({ ...prev, page_id: null }));
                }}
              >
                <option value="">Select a category</option>
                {categories?.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedCategoryId && (
              <div>
                <label className="block text-sm font-medium mb-1">Subcategory</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={formData.page_id || ''}
                  onChange={(e) => 
                    setFormData(prev => ({ ...prev, page_id: e.target.value || null }))
                  }
                >
                  <option value="">Select a subcategory</option>
                  {subcategories?.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
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

          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Content
            </label>
            <textarea
              id="content"
              className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.status === "draft" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "draft" }))
                }
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={formData.status === "published" ? "default" : "outline"}
                onClick={() =>
                  setFormData((prev) => ({ ...prev, status: "published" }))
                }
              >
                Published
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/content")}
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
