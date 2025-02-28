
import { supabase } from "@/integrations/supabase/client";
import { ArticleData, LayoutTemplate } from "@/types/content";

// Fetch content with layout information
export const fetchContentWithLayout = async (contentId: string): Promise<ArticleData | null> => {
  const { data, error } = await supabase
    .from('content')
    .select(`
      *,
      review_details (*),
      rating_criteria (*)
    `)
    .eq('id', contentId)
    .single();
    
  if (error) {
    console.error("Error fetching content with layout:", error);
    return null;
  }
  
  return data as ArticleData;
};

// Save content layout template
export const saveContentLayout = async (
  contentId: string, 
  layoutTemplate: LayoutTemplate,
  layoutSettings: Record<string, any> = {}
): Promise<boolean> => {
  const { error } = await supabase
    .from('content')
    .update({
      layout_template: layoutTemplate,
      layout_settings: layoutSettings
    })
    .eq('id', contentId);
    
  if (error) {
    console.error("Error saving content layout:", error);
    return false;
  }
  
  return true;
};
