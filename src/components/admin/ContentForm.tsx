
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
    }
  );
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result, error } = await supabase
        .from("content")
        .upsert({
          ...data,
          id: initialData?.id,
          author_id: TEST_AUTHOR_ID, // Ensure author_id is always set
        })
        .select()
        .single();

      if (error) throw error;
      return result;
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
