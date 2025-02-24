
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Star, Search, Plus } from "lucide-react";

export const ContentManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [contentType, setContentType] = useState<"all" | "article" | "review">("all");

  const { data: content, isLoading } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      const query = supabase
        .from('content')
        .select(`
          *,
          review_details(*)
        `);

      if (contentType !== "all") {
        query.eq('type', contentType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  const filteredContent = content?.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        ) : (
          filteredContent?.map((item) => (
            <Card 
              key={item.id} 
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/admin/content/edit/${item.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
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
                  <h3 className="mt-2 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
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
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
