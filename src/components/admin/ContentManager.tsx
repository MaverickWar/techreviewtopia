
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Star, Search, Plus, Edit, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export const ContentManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<"all" | "article" | "review">("all");

  const { data: content, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      console.log("Fetching content...");
      const query = supabase
        .from('content')
        .select(`
          *,
          review_details(*),
          page_content(
            pages(
              title,
              slug,
              menu_item_id,
              menu_category_id
            )
          )
        `);

      if (contentType !== "all") {
        query.eq('type', contentType);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching content:", error);
        throw error;
      }
      
      console.log("Fetched content:", data);
      return data;
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      const { data, error } = await supabase
        .from('content')
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      toast({
        title: `Content ${data.status === 'published' ? 'published' : 'unpublished'}`,
        description: data.title,
      });
    },
    onError: (error) => {
      console.error("Error toggling publish status:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleTogglePublish = (id: string, currentStatus: string) => {
    togglePublishMutation.mutate({ id, currentStatus });
  };

  const filteredContent = content?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  console.log("Filtered content:", filteredContent);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Content</h1>
        <Button 
          className="bg-orange-500 hover:bg-orange-600"
          onClick={() => navigate("/admin/content/new")}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Content
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={contentType === "all" ? "default" : "outline"}
            onClick={() => setContentType("all")}
          >
            All
          </Button>
          <Button
            variant={contentType === "article" ? "default" : "outline"}
            onClick={() => setContentType("article")}
          >
            Articles
          </Button>
          <Button
            variant={contentType === "review" ? "default" : "outline"}
            onClick={() => setContentType("review")}
          >
            Reviews
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading...</p>
        ) : filteredContent && filteredContent.length > 0 ? (
          filteredContent.map((item) => (
            <Card 
              key={item.id} 
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    {item.type === "article" ? (
                      <FileText className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm font-medium text-muted-foreground capitalize">
                      {item.type}
                    </span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.status === 'published' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/content/edit/${item.id}`)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant={item.status === 'published' ? "destructive" : "default"}
                  size="sm"
                  onClick={() => handleTogglePublish(item.id, item.status)}
                >
                  {item.status === 'published' ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      Publish
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No content found</p>
          </div>
        )}
      </div>
    </div>
  );
};
