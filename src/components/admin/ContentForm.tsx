
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Star, 
  Image as ImageIcon,
  Youtube,
  Plus,
  Minus,
  Upload,
  X,
  Layout
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LayoutSelector } from "./LayoutSelector";
import { LayoutPreview } from "./LayoutPreview";
import { ContentType, ContentStatus, LayoutTemplate, ArticleData } from "@/types/content";

type RatingCriterion = {
  name: string;
  score: number;
  review_id?: string;
};

interface ProductSpec {
  label: string;
  value: string;
}

interface ReviewDetails {
  id?: string;
  content_id?: string;
  youtube_url: string | null;
  gallery: string[];
  product_specs: ProductSpec[];
  overall_score: number;
}

interface ContentFormData {
  id?: string;
  title: string;
  description: string | null;
  content: string | null;
  type: ContentType;
  status: ContentStatus;
  author_id: string | null;
  page_id: string | null;
  featured_image?: string | null;
  youtube_url?: string | null;
  gallery?: string[];
  product_specs?: ProductSpec[];
  rating_criteria?: RatingCriterion[];
  overall_score?: number;
  review_details?: ReviewDetails;
  layout_template?: LayoutTemplate;
  layout_settings?: Record<string, any>;
}

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
  const [imageUploading, setImageUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
              menu_category_id
            )
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (contentError) throw contentError;

      if (!contentData) return null;

      console.log('Loaded content with layout template:', contentData.layout_template);

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
      const reviewDetails = existingContent.review_details?.[0];
      
      // Handle product_specs parsing correctly
      let productSpecs: ProductSpec[] = [];
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
      let layoutSettings: Record<string, any> = {};
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

      setFormData({
        id: existingContent.id,
        title: existingContent.title,
        description: existingContent.description,
        content: existingContent.content,
        type: existingContent.type as ContentType,
        status: existingContent.status as ContentStatus,
        author_id: existingContent.author_id,
        page_id: existingContent.page_content?.[0]?.page_id || null,
        featured_image: existingContent.featured_image || null,
        gallery: gallery,
        product_specs: productSpecs,
        rating_criteria: existingContent.rating_criteria || [],
        overall_score: reviewDetails?.overall_score || 0,
        youtube_url: reviewDetails?.youtube_url || null,
        layout_template: layoutTemplate as LayoutTemplate,
        layout_settings: layoutSettings
      });

      if (existingContent.page_content?.[0]?.pages?.menu_category_id) {
        setSelectedCategory(existingContent.page_content[0].pages.menu_category_id);
      }
    }
  }, [existingContent]);

  // Get categories query
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories');
      const { data, error } = await supabase
        .from('menu_categories')
        .select('id, name')
        .order('order_index');
      
      if (error) throw error;
      console.log('Categories:', data);
      return data;
    },
  });

  // Subcategories query
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    enabled: !!selectedCategory,
    queryFn: async () => {
      console.log('Fetching subcategories for category:', selectedCategory);
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('category_id', selectedCategory)
        .order('order_index');
      
      if (error) throw error;
      console.log('Subcategories:', data);
      return data;
    },
  });

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError, data } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (type === 'featured') {
        setFormData(prev => ({ ...prev, featured_image: publicUrl }));
      } else {
        setFormData(prev => ({
          ...prev,
          gallery: [...(prev.gallery || []), publicUrl]
        }));
      }

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  // Image removal handler
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index) || []
    }));
  };

  // Product spec handlers
  const addProductSpec = () => {
    setFormData(prev => ({
      ...prev,
      product_specs: [...(prev.product_specs || []), { label: '', value: '' }]
    }));
  };

  const updateProductSpec = (index: number, field: 'label' | 'value', value: string) => {
    setFormData(prev => ({
      ...prev,
      product_specs: prev.product_specs?.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ) || []
    }));
  };

  const removeProductSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      product_specs: prev.product_specs?.filter((_, i) => i !== index) || []
    }));
  };

  // Rating criterion handlers
  const addRatingCriterion = () => {
    setFormData(prev => ({
      ...prev,
      rating_criteria: [...(prev.rating_criteria || []), { name: '', score: 0 }]
    }));
  };

  const updateRatingCriterion = (index: number, field: 'name' | 'score', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      rating_criteria: prev.rating_criteria?.map((criterion, i) =>
        i === index ? { ...criterion, [field]: value } : criterion
      ) || []
    }));
  };

  const removeRatingCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rating_criteria: prev.rating_criteria?.filter((_, i) => i !== index) || []
    }));
  };

  // Handle layout template change
  const handleLayoutChange = (layoutTemplate: string) => {
    console.log("Layout template changed to:", layoutTemplate);
    setFormData(prev => ({
      ...prev,
      layout_template: layoutTemplate as LayoutTemplate
    }));
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

          <Separator />

          
          <Accordion type="single" collapsible defaultValue="basic">
            <AccordionItem value="basic">
              <AccordionTrigger>Basic Information</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.description || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Content</label>
                    <textarea
                      className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={formData.content || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      required
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
                <div className="space-y-6">
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-4">
                      Choose a layout template to determine how your content will be displayed to readers.
                      Each layout is optimized for different types of content.
                    </p>
                  
                    <LayoutSelector
                      contentType={formData.type}
                      selectedLayout={formData.layout_template || "classic"}
                      onChange={handleLayoutChange}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Preview</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <LayoutPreview
                        article={previewArticle as ArticleData}
                        selectedLayout={formData.layout_template || "classic"}
                      />
                    </div>
                    <p className="text-xs text-gray-500 italic mt-2">
                      This is a preview of how your content will appear with the selected layout. The actual rendering may vary slightly.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="categories">
              <AccordionTrigger>Categories</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Category</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      value={selectedCategory || ''}
                      onChange={(e) => {
                        const newCategoryId = e.target.value || null;
                        console.log('Selected category changed to:', newCategoryId);
                        setSelectedCategory(newCategoryId);
                        setFormData(prev => ({ ...prev, page_id: null }));
                      }}
                    >
                      <option value="">Select a category</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCategory && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Subcategory</label>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2"
                        value={formData.page_id || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, page_id: e.target.value || null }))}
                      >
                        <option value="">Select a subcategory</option>
                        {subcategories?.map((subcategory) => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            
          <AccordionItem value="media">
            <AccordionTrigger>Media</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Featured Image</label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('featured-image')?.click()}
                      disabled={imageUploading}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </Button>
                    <input
                      id="featured-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'featured')}
                    />
                    {formData.featured_image && (
                      <div className="relative">
                        <img
                          src={formData.featured_image}
                          alt="Featured"
                          className="h-20 w-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={() => setFormData(prev => ({ ...prev, featured_image: null }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery */}
                <div>
                  <label className="block text-sm font-medium mb-2">Gallery</label>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('gallery-image')?.click()}
                      disabled={imageUploading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Gallery
                    </Button>
                    <input
                      id="gallery-image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'gallery')}
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.gallery?.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Gallery ${index + 1}`}
                            className="h-24 w-24 object-cover rounded"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* YouTube URL */}
                <div>
                  <label className="block text-sm font-medium mb-2">YouTube Video URL</label>
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      value={formData.youtube_url || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setFormData(prev => ({ ...prev, youtube_url: null }))}
                      disabled={!formData.youtube_url}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

            
            {formData.type === 'review' && (
              <>
                <AccordionItem value="specs">
                  <AccordionTrigger>Product Specifications</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {formData.product_specs?.map((spec, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Specification"
                            value={spec.label}
                            onChange={(e) => updateProductSpec(index, 'label', e.target.value)}
                          />
                          <Input
                            placeholder="Value"
                            value={spec.value}
                            onChange={(e) => updateProductSpec(index, 'value', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeProductSpec(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addProductSpec}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Specification
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="rating">
                  <AccordionTrigger>Rating</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {formData.rating_criteria?.map((criterion, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="Criterion"
                            value={criterion.name}
                            onChange={(e) => updateRatingCriterion(index, 'name', e.target.value)}
                          />
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            placeholder="Score (0-10)"
                            value={criterion.score}
                            onChange={(e) => updateRatingCriterion(index, 'score', parseFloat(e.target.value))}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeRatingCriterion(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addRatingCriterion}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Rating Criterion
                      </Button>

                      <div>
                        <label className="block text-sm font-medium mb-1">Overall Score</label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={formData.overall_score || 0}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            overall_score: parseFloat(e.target.value)
                          }))}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </>
            )}
          </Accordion>

          
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.status === "draft" ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, status: "draft" }))}
              >
                Draft
              </Button>
              <Button
                type="button"
                variant={formData.status === "published" ? "default" : "outline"}
                onClick={() => setFormData(prev => ({ ...prev, status: "published" }))}
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
      </Card>
    </form>
  );
};
