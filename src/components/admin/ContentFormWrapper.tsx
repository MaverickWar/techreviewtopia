
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ContentFormExtension } from "./ContentFormExtension";
import { ContentType, LayoutTemplate, ArticleData } from "@/types/content";

// This is a wrapper component to demonstrate how to integrate with the existing ContentForm
export const ContentFormWrapper = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [contentData, setContentData] = useState<Partial<ArticleData>>({});
  const [contentType, setContentType] = useState<ContentType>("article");
  const [layoutTemplate, setLayoutTemplate] = useState<LayoutTemplate>("classic");

  // Fetch content data
  const { data: content, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          review_details (*),
          rating_criteria (*)
        `)
        .eq('id', id)
        .single();
        
      if (error) {
        console.error("Error fetching content:", error);
        throw error;
      }
      
      return data as unknown as ArticleData;
    },
    enabled: !!id
  });

  // Update content layout
  const updateLayoutMutation = useMutation({
    mutationFn: async ({ 
      contentId, 
      layoutData 
    }: { 
      contentId: string, 
      layoutData: { 
        layout_template: LayoutTemplate, 
        layout_settings: Record<string, any> 
      } 
    }) => {
      const { error } = await supabase
        .from('content')
        .update({
          layout_template: layoutData.layout_template,
          layout_settings: layoutData.layout_settings
        })
        .eq('id', contentId);
        
      if (error) throw error;
      
      return { contentId, layoutData };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', id] });
      toast({
        title: "Layout saved",
        description: "Content layout has been updated successfully."
      });
    },
    onError: (error) => {
      console.error("Error updating layout:", error);
      toast({
        title: "Error",
        description: "Failed to update content layout.",
        variant: "destructive"
      });
    }
  });

  // Handle layout save
  const handleSaveLayout = (layoutData: { 
    layout_template: LayoutTemplate, 
    layout_settings: Record<string, any> 
  }) => {
    if (id) {
      updateLayoutMutation.mutate({ contentId: id, layoutData });
    } else {
      // For new content, just update the state
      setLayoutTemplate(layoutData.layout_template);
    }
  };

  // Update state when content data is loaded
  useEffect(() => {
    if (content) {
      setContentData(content);
      setContentType(content.type as ContentType);
      setLayoutTemplate(content.layout_template || "classic");
    }
  }, [content]);

  return (
    <div>
      {/* This would be integrated with the actual ContentForm component */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Content Layout Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 mb-4">
            Choose a layout template to determine how your content will be displayed to readers.
            Each layout is optimized for different types of content.
          </p>
          
          <ContentFormExtension
            contentId={id}
            contentType={contentType as ContentType}
            contentData={contentData}
            initialLayout={layoutTemplate}
            onSave={handleSaveLayout}
          />
        </CardContent>
      </Card>
    </div>
  );
};
