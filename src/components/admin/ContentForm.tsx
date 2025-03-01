
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Star, 
  Layout,
  Globe,
  FileEdit
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContentType, ContentStatus, LayoutTemplate, ArticleData } from "@/types/content";
import RichTextEditor from "@/components/editor/RichTextEditor";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Import refactored components
import { ContentFormData } from "./content-form/types";
import { RatingCriteriaSection } from "./content-form/RatingCriteriaSection";
import { ProductSpecsSection } from "./content-form/ProductSpecsSection";
import { MediaSection } from "./content-form/MediaSection";
import { CategorySection } from "./content-form/CategorySection";
import { LayoutSectionWrapper } from "./content-form/LayoutSectionWrapper";

interface ContentFormProps {
  initialData?: ContentFormData;
}

export const ContentForm = ({ initialData }: ContentFormProps) => {
  const { id } = useParams();
  const [formData, setFormData] = useState<ContentFormData>(
    initialData || {
      title: "",
      description: null,
      content: null,
      type: "article",
      status: "draft",
      author_id: null,
      page_id: null,
      featured_image: null,
      gallery: [],
      product_specs: [],
      rating_criteria: [],
      overall_score: 0,
      layout_template: "classic",
      layout_settings: {}
    }
  );
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Calculate the overall score based on rating criteria
  const calculatedOverallScore = useMemo(() => {
    if (!formData.rating_criteria || formData.rating_criteria.length === 0) {
      return 0;
    }
    
    const sum = formData.rating_criteria.reduce((total, criterion) => 
      total + (parseFloat(criterion.score.toString()) || 0), 0);
    return parseFloat((sum / formData.rating_criteria.length).toFixed(1));
  }, [formData.rating_criteria]);

  // Update overall score whenever rating criteria change
  useEffect(() => {
    if (formData.type === 'review' && formData.rating_criteria && formData.rating_criteria.length > 0) {
      setFormData(prev => ({
        ...prev,
        overall_score: calculatedOverallScore
      }));
    }
  }, [calculatedOverallScore, formData.rating_criteria, formData.type]);

  // Add user session check
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        setFormData(prev => ({
          ...prev,
          author_id: user.id
        }));
      }
    };

    getUser();
  }, []);

  // Fetch existing content if we're editing
  const { data: existingContent, isLoading } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
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
    },
    enabled: !!id,
  });

  // Update form data when content is loaded
  useEffect(() => {
    if (existingContent) {
      console.log("Existing content loaded:", existingContent);
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

      // Get the layout template from existing content
      const layoutTemplate = existingContent.layout_template || 'classic';
      console.log('Setting layout template from existing content:', layoutTemplate);

      // Get the page and menu item information
      const pageContent = existingContent.page_content?.[0];
      const menuCategoryId = pageContent?.pages?.menu_category_id || null;
      const menuItemId = pageContent?.pages?.menu_item_id || null;
      const pageId = pageContent?.page_id || null;
      
      // Set the selected category first so subcategories can load
      if (menuCategoryId) {
        setSelectedCategory(menuCategoryId);
      }

      setFormData({
        id: existingContent.id,
        title: existingContent.title,
        description: existingContent.description,
        content: existingContent.content,
        type: existingContent.type as ContentType,
        status: existingContent.status as ContentStatus,
        author_id: existingContent.author_id,
        page_id: menuItemId || pageId,
        featured_image: existingContent.featured_image || null,
        gallery: gallery,
        product_specs: productSpecs,
        rating_criteria: existingContent.rating_criteria || [],
        overall_score: reviewDetails?.overall_score || 0,
        youtube_url: reviewDetails?.youtube_url || null,
        layout_template: layoutTemplate as LayoutTemplate,
        layout_settings: layoutSettings
      });

      if (menuCategoryId) {
        console.log("Setting selected category to:", menuCategoryId);
        setSelectedCategory(menuCategoryId);
      }
    }
  }, [existingContent]);

  // Fetch author profile data if we have an author_id
  const { data: authorProfile } = useQuery({
    queryKey: ['author-profile', formData.author_id],
    enabled: !!formData.author_id && !!currentUser,
    queryFn: async () => {
      if (!formData.author_id) return null;
      
      console.log('Fetching author profile for ID:', formData.author_id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', formData.author_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching author profile:', error);
        return null;
      }
      
      return data;
    },
  });

  // Handle layout template change
  const handleLayoutChange = (layoutTemplate: string) => {
    console.log("Layout template changed to:", layoutTemplate);
    setFormData(prev => ({
      ...prev,
      layout_template: layoutTemplate as LayoutTemplate
    }));
  };

  // Handle layout settings changes
  const handleLayoutSettingsChange = (settings: Record<string, any>) => {
    console.log("Layout settings updated:", settings);
    setFormData(prev => ({
      ...prev,
      layout_settings: settings
    }));
  };

  // Handle layout settings save
  const handleSaveLayoutSettings = (settings: Record<string, any>) => {
    console.log("Layout settings saved:", settings);
    setFormData(prev => ({
      ...prev,
      layout_settings: settings
    }));
    toast({
      title: "Layout settings saved",
      description: "The layout settings have been updated.",
    });
  };

  // Helper function to handle review data
  const handleReviewData = async (contentId: string, data: ContentFormData) => {
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

  const mutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      console.log("Submitting content with data:", data);
      console.log("Layout template being saved:", data.layout_template);
      
      if (!data.author_id || !currentUser) {
        throw new Error("You must be logged in to create or edit content");
      }

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
            layout_template: data.layout_template,
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
            layout_template: data.layout_template,
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
    },
    onSuccess: (data) => {
      console.log("Content saved successfully with layout:", data.layout_template);
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: `Content ${id ? "updated" : "created"} successfully`,
        description: formData.title,
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

  // Show loading state while content is being fetched
  if (id && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading content...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form with layout template:", formData.layout_template);
    mutation.mutate(formData);
  };

  // Preview data for layout preview
  const previewArticle: Partial<ArticleData> = {
    id: formData.id || "preview",
    title: formData.title,
    description: formData.description,
    content: formData.content,
    type: formData.type,
    featured_image: formData.featured_image,
    layout_template: formData.layout_template,
    published_at: new Date().toISOString(),
    review_details: formData.type === "review" ? [{
      id: "preview",
      content_id: formData.id || "preview",
      youtube_url: formData.youtube_url || null,
      gallery: formData.gallery || [],
      product_specs: formData.product_specs || [],
      overall_score: formData.overall_score || 0
    }] : [],
    rating_criteria: formData.rating_criteria
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            {formData.type === "article" ? (
              <FileText className="h-5 w-5 text-blue-500" />
            ) : (
              <Star className="h-5 w-5 text-yellow-500" />
            )}
            <h2 className="text-2xl font-bold">
              {id ? "Edit" : "Create"} {formData.type}
            </h2>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Content Type Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Type</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.type === "article" ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, type: "article" }))}
              >
                <FileText className="mr-2 h-4 w-4" />
                Article
              </Button>
              <Button
                type="button"
                variant={formData.type === "review" ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, type: "review" }))}
              >
                <Star className="mr-2 h-4 w-4" />
                Review
              </Button>
            </div>
          </div>

          {/* Add publish/draft status toggle */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="publish-status" className="text-sm font-medium">
                Status:
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="publish-status"
                  checked={formData.status === "published"}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ 
                      ...prev, 
                      status: checked ? "published" : "draft" 
                    }))
                  }
                />
                <span className="text-sm">
                  {formData.status === "published" ? (
                    <div className="flex items-center text-green-600">
                      <Globe className="h-4 w-4 mr-1" />
                      Published
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-500">
                      <FileEdit className="h-4 w-4 mr-1" />
                      Draft
                    </div>
                  )}
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {formData.status === "published" 
                ? "Content is visible to the public" 
                : "Content is only visible to you"
              }
            </p>
          </div>

          <Separator />

          <Accordion type="single" collapsible defaultValue="basic">
            <AccordionItem value="basic">
              <AccordionTrigger>Basic Information</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <input
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <RichTextEditor
                      content={formData.description || ''}
                      onChange={(content) => setFormData(prev => ({ ...prev, description: content }))}
                      placeholder="Enter a brief description..."
                      minHeight="150px"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <RichTextEditor
                      content={formData.content || ''}
                      onChange={(content) => setFormData(prev => ({ ...prev, content: content }))}
                      placeholder="Write your content here..."
                      minHeight="300px"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Layout Accordion Item */}
            <AccordionItem value="layout">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  <span>Layout Template</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <LayoutSectionWrapper
                  contentType={formData.type}
                  layoutTemplate={formData.layout_template || "classic"}
                  layoutSettings={formData.layout_settings || {}}
                  previewArticle={previewArticle as ArticleData}
                  onLayoutChange={handleLayoutChange}
                  onLayoutSettingsChange={handleLayoutSettingsChange}
                  onLayoutSettingsSave={handleSaveLayoutSettings}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="categories">
              <AccordionTrigger>Categories</AccordionTrigger>
              <AccordionContent>
                <CategorySection
                  selectedCategory={selectedCategory}
                  pageId={formData.page_id}
                  onCategoryChange={setSelectedCategory}
                  onPageIdChange={(pageId) => setFormData(prev => ({ ...prev, page_id: pageId }))}
                />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="media">
              <AccordionTrigger>Media</AccordionTrigger>
              <AccordionContent>
                <MediaSection
                  featuredImage={formData.featured_image}
                  gallery={formData.gallery}
                  youtubeUrl={formData.youtube_url}
                  showYoutubeInput={formData.type === 'review'}
                  onFeaturedImageChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                  onGalleryChange={(gallery) => setFormData(prev => ({ ...prev, gallery }))}
                  onYoutubeUrlChange={(url) => setFormData(prev => ({ ...prev, youtube_url: url }))}
                />
              </AccordionContent>
            </AccordionItem>

            {formData.type === 'review' && (
              <>
                <AccordionItem value="rating">
                  <AccordionTrigger>Rating</AccordionTrigger>
                  <AccordionContent>
                    <RatingCriteriaSection
                      criteria={formData.rating_criteria || []}
                      onChange={(criteria) => setFormData(prev => ({ ...prev, rating_criteria: criteria }))}
                      calculatedOverallScore={calculatedOverallScore}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="specs">
                  <AccordionTrigger>Product Specifications</AccordionTrigger>
                  <AccordionContent>
                    <ProductSpecsSection
                      specs={formData.product_specs || []}
                      onChange={(specs) => setFormData(prev => ({ ...prev, product_specs: specs }))}
                    />
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => navigate('/admin/content')}
          >
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-foreground"></div>
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
};

