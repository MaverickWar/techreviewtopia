
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContentFormData } from "./content-form/types";
import { FormContainer } from "./content-form/FormContainer";
import { saveContent, fetchExistingContent, fetchAuthorProfile } from "./content-form/contentApi";
import { getValidLayoutTemplate } from "./content-form/layoutUtils";

interface ContentFormProps {
  initialData?: ContentFormData;
}

export const ContentForm = ({ initialData }: ContentFormProps) => {
  const { id } = useParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fetch existing content if we're editing
  const { data: existingContent, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      if (!id) return null;
      return fetchExistingContent(id);
    },
    enabled: !!id,
  });

  // Add user session check
  useState(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
      }
    };

    getUser();
  });

  // Fetch author profile data if we have an author_id
  const mutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      return saveContent(data, currentUser);
    },
    onSuccess: (data) => {
      console.log("Content saved successfully with layout:", data.layout_template);
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: `Content ${id ? "updated" : "created"} successfully`,
        description: data.title,
      });
      navigate("/admin/content");
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  let processedInitialData = initialData;
  if (existingContent) {
    const reviewDetails = existingContent.review_details?.[0];
    
    // Handle product_specs parsing correctly
    let productSpecs = [];
    if (reviewDetails?.product_specs) {
      try {
        // Check if product_specs is already an object or needs parsing
        productSpecs = typeof reviewDetails.product_specs === 'string' 
          ? JSON.parse(reviewDetails.product_specs)
          : reviewDetails.product_specs;
      } catch (error) {
        console.error('Error parsing product specs:', error);
        productSpecs = [];
      }
    }

    // Ensure gallery is always an array
    const gallery = Array.isArray(reviewDetails?.gallery) ? reviewDetails.gallery : [];

    // Ensure layout_settings is always an object
    let layoutSettings = {};
    if (existingContent.layout_settings) {
      try {
        // If it's a string, try to parse it, otherwise use it if it's already an object
        layoutSettings = typeof existingContent.layout_settings === 'string'
          ? JSON.parse(existingContent.layout_settings)
          : (existingContent.layout_settings as Record<string, any>) || {};
      } catch (error) {
        console.error('Error parsing layout settings:', error);
        layoutSettings = {};
      }

      // If it's still not an object after parsing, set to empty object
      if (typeof layoutSettings !== 'object' || layoutSettings === null) {
        layoutSettings = {};
      }
    }

    // Get the layout template from existing content and ensure it's valid
    const layoutTemplate = getValidLayoutTemplate(existingContent.layout_template);

    // Get the page and menu item information
    const pageContent = existingContent.page_content?.[0];
    const pageId = pageContent?.page_id || null;
    
    processedInitialData = {
      id: existingContent.id,
      title: existingContent.title,
      description: existingContent.description,
      content: existingContent.content,
      type: existingContent.type as "article" | "review",
      status: existingContent.status as "draft" | "published",
      author_id: existingContent.author_id,
      page_id: pageId,
      featured_image: existingContent.featured_image || null,
      gallery: gallery,
      product_specs: productSpecs,
      rating_criteria: existingContent.rating_criteria || [],
      overall_score: reviewDetails?.overall_score || 0,
      youtube_url: reviewDetails?.youtube_url || null,
      layout_template: layoutTemplate,
      layout_settings: layoutSettings
    };
  }

  return (
    <FormContainer
      initialData={processedInitialData}
    />
  );
};
