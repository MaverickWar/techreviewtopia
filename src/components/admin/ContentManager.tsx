
import { Link, Route, Routes } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ContentType } from "@/types/navigation";
import { ContentForm } from "./ContentForm";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";

// Type guard to check if the type is valid
const isValidContentType = (type: string): type is ContentType['type'] => {
  return type === 'article' || type === 'review';
};

// Transform raw data to match ContentType
const transformContent = (rawContent: any): ContentType => {
  if (!isValidContentType(rawContent.type)) {
    throw new Error(`Invalid content type: ${rawContent.type}`);
  }

  return {
    id: rawContent.id,
    title: rawContent.title,
    description: rawContent.description,
    content: rawContent.content,
    type: rawContent.type,
    status: rawContent.status,
    featured_image: rawContent.featured_image,
    created_at: rawContent.created_at,
    author_id: rawContent.author_id,
    page_id: rawContent.page_id,
    published_at: rawContent.published_at
  };
};

interface ContentListItem extends ContentType {
  is_featured: boolean;
  feature_position?: number;
}

const ContentList = () => {
  const [contentList, setContentList] = useState<ContentListItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to toggle selection of an item
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Check if any items are selected
  const hasSelection = Object.values(selectedItems).some(Boolean);

  // Get content with featured status
  const { data: contentData, isLoading, isError } = useQuery({
    queryKey: ['content'],
    queryFn: async () => {
      // First, get all content
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select('*');
      
      if (contentError) {
        throw new Error(contentError.message);
      }

      // Then, get all featured content
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_content')
        .select('*');
      
      if (featuredError) {
        throw new Error(featuredError.message);
      }

      // Transform and merge the data
      return contentData.map(content => {
        const featured = featuredData.find(f => f.content_id === content.id);
        return {
          ...transformContent(content),
          is_featured: !!featured,
          feature_position: featured?.position
        };
      });
    }
  });

  // Add featured mutation
  const featureMutation = useMutation({
    mutationFn: async ({ contentId, position }: { contentId: string, position: number }) => {
      const { data, error } = await supabase
        .from('featured_content')
        .upsert({
          content_id: contentId,
          position
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['featuredContent'] });
      toast({
        title: "Content featured successfully",
        description: "The content has been featured on the homepage",
      });
    },
    onError: (error) => {
      toast({
        title: "Error featuring content",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove featured mutation
  const unfeatureMutation = useMutation({
    mutationFn: async (contentId: string) => {
      const { error } = await supabase
        .from('featured_content')
        .delete()
        .eq('content_id', contentId);

      if (error) throw error;
      return contentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
      queryClient.invalidateQueries({ queryKey: ['featuredContent'] });
      toast({
        title: "Content unfeatured successfully",
        description: "The content has been removed from featured section",
      });
    },
    onError: (error) => {
      toast({
        title: "Error unfeaturing content",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle featured status
  const toggleFeatured = async (content: ContentListItem) => {
    if (content.is_featured) {
      unfeatureMutation.mutate(content.id);
    } else {
      // Get next position
      const nextPosition = contentList.filter(c => c.is_featured).length;
      featureMutation.mutate({ contentId: content.id, position: nextPosition });
    }
  };

  useEffect(() => {
    if (contentData) {
      // Sort by featured status first, then by feature position
      const sortedContent = [...contentData].sort((a, b) => {
        if (a.is_featured === b.is_featured) {
          if (a.is_featured) {
            return (a.feature_position || 0) - (b.feature_position || 0);
          }
          return 0;
        }
        return a.is_featured ? -1 : 1;
      });
      
      setContentList(sortedContent);
    }
  }, [contentData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error loading content.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content Manager</h1>
        <Button asChild>
          <Link to="new">Create New Content</Link>
        </Button>
      </div>
      <Table>
        <TableCaption>A list of your recent content.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox 
                onCheckedChange={(checked) => {
                  const newSelected: {[key: string]: boolean} = {};
                  if (checked) {
                    contentList.forEach(item => {
                      newSelected[item.id] = true;
                    });
                  }
                  setSelectedItems(newSelected);
                }}
                checked={contentList.length > 0 && Object.keys(selectedItems).length === contentList.length}
              />
            </TableHead>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Featured</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentList.map((content) => (
            <TableRow key={content.id} className={content.is_featured ? "bg-blue-50" : ""}>
              <TableCell>
                <Checkbox 
                  checked={!!selectedItems[content.id]} 
                  onCheckedChange={() => toggleSelection(content.id)} 
                />
              </TableCell>
              <TableCell className="font-medium">{content.id.substring(0, 8)}...</TableCell>
              <TableCell>{content.title}</TableCell>
              <TableCell className="flex items-center gap-1">
                {content.type === 'review' && <Star className="h-4 w-4 text-yellow-500" />}
                {content.type.charAt(0).toUpperCase() + content.type.slice(1)}
              </TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  content.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {content.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={content.is_featured}
                    onCheckedChange={() => toggleFeatured(content)}
                  />
                  {content.is_featured && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Position: {content.feature_position !== undefined ? content.feature_position + 1 : '?'}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link to={`${content.id}`}>Edit</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export const ContentManager = () => {
  return (
    <Routes>
      <Route index element={<ContentList />} />
      <Route path="new" element={<ContentForm />} />
      <Route path=":id" element={<ContentForm />} />
    </Routes>
  );
};
