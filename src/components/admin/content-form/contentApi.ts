
import { supabase } from "@/integrations/supabase/client";
import { ContentFormData } from "./types";
import { getValidLayoutTemplate } from "./layoutUtils";

// Helper function to handle review data
export const handleReviewData = async (contentId: string, data: ContentFormData) => {
  // Check for existing review
  const { data: existingReview } = await supabase
    .from('review_details')
    .select('id')
    .eq('content_id', contentId)
    .maybeSingle();

  // Convert product_specs to JSON string before saving
  const reviewData: any = {
    content_id: contentId,
    youtube_url: data.youtube_url,
    gallery: data.gallery,
    product_specs: data.product_specs ? JSON.stringify(data.product_specs) : null,
    overall_score: data.overall_score,
  };

  // If review exists, include its ID in the upsert
  if (existingReview) {
    reviewData.id = existingReview.id;
  }

  const { data: reviewDetails, error: reviewError } = await supabase
    .from('review_details')
    .upsert(reviewData)
    .select()
    .single();

  if (reviewError) {
    console.error("Error creating/updating review details:", reviewError);
    throw reviewError;
  }

  // Handle rating criteria
  if (data.rating_criteria?.length) {
    // Delete existing criteria first
    if (reviewDetails.id) {
      await supabase
        .from('rating_criteria')
        .delete()
        .eq('review_id', reviewDetails.id);
    }

    const criteriaData = data.rating_criteria.map(criterion => ({
      name: criterion.name,
      score: criterion.score,
      review_id: reviewDetails.id
    }));

    const { error: criteriaError } = await supabase
      .from('rating_criteria')
      .insert(criteriaData);

    if (criteriaError) throw criteriaError;
  }

  return reviewDetails;
};

export const saveContent = async (data: ContentFormData, currentUser: any) => {
  console.log("Submitting content with data:", data);
  console.log("Layout template being saved:", data.layout_template);
  
  if (!data.author_id || !currentUser) {
    throw new Error("You must be logged in to create or edit content");
  }

  // Ensure we have a valid LayoutTemplate
  const validLayoutTemplate = getValidLayoutTemplate(data.layout_template);

  // If editing existing content (has an ID), update directly
  if (data.id) {
    // Update content without trying to associate with menu items/pages
    const { data: content, error: contentError } = await supabase
      .from("content")
      .update({
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        status: data.status,
        author_id: data.author_id,
        featured_image: data.featured_image,
        layout_template: validLayoutTemplate,
        layout_settings: data.layout_settings || {}
      })
      .eq("id", data.id)
      .select()
      .single();

    if (contentError) {
      console.error("Error updating content:", contentError);
      throw contentError;
    }

    console.log("Content updated successfully with layout template:", content.layout_template);
    
    // If this is a review, handle review details
    if (data.type === 'review') {
      await handleReviewData(content.id, data);
    }

    return content;
  } 
  // Creating new content
  else {
    // Handle page association if specified
    let pageId = data.page_id;
    
    if (pageId) {
      // First check if this refers to a menu item that needs a page created
      const { data: existingPage, error: pageCheckError } = await supabase
        .from('pages')
        .select('id')
        .eq('menu_item_id', pageId)
        .maybeSingle();

      if (pageCheckError && pageCheckError.code !== 'PGRST116') {
        throw pageCheckError;
      }

      // If page doesn't exist, create it
      if (!existingPage) {
        const { data: menuItem, error: menuItemError } = await supabase
          .from('menu_items')
          .select('*')
          .eq('id', pageId)
          .maybeSingle();

        if (menuItemError) throw menuItemError;
        if (!menuItem) throw new Error("Menu item not found");

        const { data: newPage, error: createPageError } = await supabase
          .from('pages')
          .insert({
            menu_item_id: menuItem.id,
            title: menuItem.name,
            slug: menuItem.slug,
            description: menuItem.description,
            page_type: 'subcategory'
          })
          .select()
          .single();

        if (createPageError) throw createPageError;

        // Update the pageId to use the newly created page
        pageId = newPage.id;
      } else {
        // Use the existing page id
        pageId = existingPage.id;
      }
    }

    // Create the content
    const { data: content, error: contentError } = await supabase
      .from("content")
      .insert({
        title: data.title,
        description: data.description,
        content: data.content,
        type: data.type,
        status: data.status,
        author_id: data.author_id,
        featured_image: data.featured_image,
        layout_template: validLayoutTemplate,
        layout_settings: data.layout_settings || {}
      })
      .select()
      .single();

    if (contentError) {
      console.error("Error creating content:", contentError);
      throw contentError;
    }

    console.log("Content created with layout template:", content.layout_template);

    // If this is a review, handle review details
    if (data.type === 'review') {
      await handleReviewData(content.id, data);
    }

    // If a page is selected, handle the page_content relationship
    if (pageId) {
      const { error: pageContentError } = await supabase
        .from("page_content")
        .upsert({
          page_id: pageId,
          content_id: content.id,
          order_index: 0, // Default to first position
        });

      if (pageContentError) {
        console.error("Error linking content to page:", pageContentError);
        throw pageContentError;
      }
    }

    return content;
  }
};

// Fetch existing content
export const fetchExistingContent = async (id: string) => {
  if (!id) return null;
  
  console.log('Fetching content with ID:', id);
  
  // First fetch content with page data
  const { data: contentData, error: contentError } = await supabase
    .from('content')
    .select(`
      *,
      page_content(
        page_id,
        pages(
          id,
          title,
          menu_category_id,
          menu_item_id
        )
      )
    `)
    .eq('id', id)
    .maybeSingle();
  
  if (contentError) throw contentError;

  if (!contentData) return null;

  console.log('Loaded content with layout template:', contentData.layout_template);
  console.log('Content status:', contentData.status);

  // If this is a review, fetch additional review data
  if (contentData.type === 'review') {
    // Fetch review details
    const { data: reviewData, error: reviewError } = await supabase
      .from('review_details')
      .select('*')
      .eq('content_id', contentData.id)
      .maybeSingle();

    if (reviewError) throw reviewError;

    // If we have review details, fetch rating criteria
    if (reviewData) {
      const { data: criteriaData, error: criteriaError } = await supabase
        .from('rating_criteria')
        .select('*')
        .eq('review_id', reviewData.id);
        
      if (criteriaError) throw criteriaError;

      // Combine all the data
      return {
        ...contentData,
        page_content: contentData.page_content,
        review_details: reviewData ? [reviewData] : [],
        rating_criteria: criteriaData || []
      };
    }
  }
  
  // Return content with empty review data if not a review
  return {
    ...contentData,
    page_content: contentData.page_content,
    review_details: [],
    rating_criteria: []
  };
};

// Fetch author profile
export const fetchAuthorProfile = async (authorId: string) => {
  if (!authorId) return null;
  
  console.log('Fetching author profile for ID:', authorId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authorId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching author profile:', error);
    return null;
  }
  
  return data;
};
