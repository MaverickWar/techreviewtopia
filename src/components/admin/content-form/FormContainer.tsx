
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, Star, Layout } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ContentType, ContentStatus, ArticleData } from "@/types/content";

import { ContentFormData } from "./types";
import { TypeSelector } from "./TypeSelector";
import { StatusToggle } from "./StatusToggle";
import { BasicInfoSection } from "./BasicInfoSection";
import { RatingCriteriaSection } from "./RatingCriteriaSection";
import { ProductSpecsSection } from "./ProductSpecsSection";
import { MediaSection } from "./MediaSection";
import { CategorySection } from "./CategorySection";
import { LayoutSectionWrapper } from "./LayoutSectionWrapper";
import { getValidLayoutTemplate } from "./layoutUtils";
import { saveContent, fetchExistingContent } from "./contentApi";

interface FormContainerProps {
  initialData?: ContentFormData;
}

export const FormContainer = ({ initialData }: FormContainerProps) => {
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

  // Apply initialData changes when they arrive
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.page_id) {
        // Load the appropriate category when we have page data
        loadCategoryFromPageId(initialData.page_id);
      }
    }
  }, [initialData]);

  // Helper function to load category from page ID
  const loadCategoryFromPageId = async (pageId: string) => {
    try {
      // First check if this is a menu item ID
      const { data: menuItem, error: menuItemError } = await supabase
        .from('menu_items')
        .select('category_id')
        .eq('id', pageId)
        .maybeSingle();
        
      if (!menuItemError && menuItem?.category_id) {
        setSelectedCategory(menuItem.category_id);
        return;
      }
      
      // If not a menu item, check if it's a page
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('menu_item_id, menu_category_id')
        .eq('id', pageId)
        .maybeSingle();
        
      if (pageError) return;
      
      if (page?.menu_category_id) {
        setSelectedCategory(page.menu_category_id);
      } else if (page?.menu_item_id) {
        // If page has menu item, get its category
        const { data: relatedMenuItem } = await supabase
          .from('menu_items')
          .select('category_id')
          .eq('id', page.menu_item_id)
          .maybeSingle();
          
        if (relatedMenuItem?.category_id) {
          setSelectedCategory(relatedMenuItem.category_id);
        }
      }
    } catch (error) {
      console.error('Error resolving category:', error);
    }
  };

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

  // Content mutation
  const mutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      return saveContent(data, currentUser);
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

  // Fetch existing content
  const { isLoading } = useQuery({
    queryKey: ['content-internal', id],
    queryFn: async () => {
      if (!id) return null;
      const content = await fetchExistingContent(id);
      return content;
    },
    enabled: !!id && !initialData, // Only run if we don't have initialData
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
    layout_template: getValidLayoutTemplate(formData.layout_template),
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
          <TypeSelector 
            contentType={formData.type}
            onTypeChange={(type) => setFormData(prev => ({ ...prev, type }))}
          />

          {/* Add publish/draft status toggle */}
          <StatusToggle 
            status={formData.status}
            onStatusChange={(status) => setFormData(prev => ({ ...prev, status }))}
          />

          <Separator />

          <Accordion type="single" collapsible defaultValue="basic">
            <AccordionItem value="basic">
              <AccordionTrigger>Basic Information</AccordionTrigger>
              <AccordionContent>
                <BasicInfoSection
                  title={formData.title}
                  description={formData.description}
                  content={formData.content}
                  onTitleChange={(title) => setFormData(prev => ({ ...prev, title }))}
                  onDescriptionChange={(description) => setFormData(prev => ({ ...prev, description }))}
                  onContentChange={(content) => setFormData(prev => ({ ...prev, content }))}
                />
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
                  onLayoutChange={(layout) => {
                    console.log("Layout template changed to:", layout);
                    setFormData(prev => ({
                      ...prev,
                      layout_template: getValidLayoutTemplate(layout)
                    }));
                  }}
                  onLayoutSettingsChange={(settings) => {
                    console.log("Layout settings updated:", settings);
                    setFormData(prev => ({
                      ...prev,
                      layout_settings: settings
                    }));
                  }}
                  onLayoutSettingsSave={(settings) => {
                    console.log("Layout settings saved:", settings);
                    setFormData(prev => ({
                      ...prev,
                      layout_settings: settings
                    }));
                    toast({
                      title: "Layout settings saved",
                      description: "The layout settings have been updated.",
                    });
                  }}
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
