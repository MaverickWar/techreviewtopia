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
  X
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ContentType = "article" | "review";
type ContentStatus = "draft" | "published";

interface RatingCriterion {
  name: string;
  score: number;
  review_id?: string;
}

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
    }
  );

  // Add user session check
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Get the current user's session
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("Current user:", user);
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

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing content if we're editing
  const { data: existingContent } = useQuery({
    queryKey: ['content', id],
    queryFn: async () => {
      if (!id) return null;
      
      console.log('Fetching content with ID:', id);
      
      // First fetch content with page data
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          page_content!inner(
            page_id,
            pages!inner(
              id,
              title,
              menu_category_id
            )
          )
        `)
        .eq('id', id)
        .single();
      
      if (contentError) throw contentError;

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

  useEffect(() => {
    if (existingContent) {
      console.log('Setting form data from existing content:', existingContent);
      const reviewDetails = existingContent.review_details?.[0];
      const pageContent = existingContent.page_content?.[0];
      
      // Parse product specs from JSON if they exist
      let parsedProductSpecs: ProductSpec[] = [];
      if (reviewDetails?.product_specs) {
        try {
          parsedProductSpecs = Array.isArray(reviewDetails.product_specs) 
            ? reviewDetails.product_specs 
            : JSON.parse(reviewDetails.product_specs as string);
        } catch (e) {
          console.error('Error parsing product specs:', e);
        }
      }

      setFormData({
        ...existingContent,
        type: existingContent.type as ContentType,
        status: existingContent.status as ContentStatus,
        page_id: pageContent?.page_id || null,
        product_specs: parsedProductSpecs,
        gallery: reviewDetails?.gallery || [],
        youtube_url: reviewDetails?.youtube_url || null,
        overall_score: reviewDetails?.overall_score || 0,
        rating_criteria: existingContent.rating_criteria || [],
        review_details: reviewDetails ? {
          id: reviewDetails.id,
          content_id: reviewDetails.content_id,
          youtube_url: reviewDetails.youtube_url || null,
          gallery: reviewDetails.gallery || [],
          product_specs: parsedProductSpecs,
          overall_score: reviewDetails.overall_score || 0
        } : undefined
      });

      // Find and set the parent category from the menu item
      if (pageContent?.pages?.menu_item_id) {
        const findParentCategory = async () => {
          const { data: menuItem } = await supabase
            .from('menu_items')
            .select('category_id')
            .eq('id', pageContent.pages.menu_item_id)
            .single();
          
          if (menuItem?.category_id) {
            console.log('Setting selected category:', menuItem.category_id);
            setSelectedCategory(menuItem.category_id);
          }
        };
        
        findParentCategory();
      }
    }
  }, [existingContent]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'featured' | 'gallery') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index)
    }));
  };

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
      )
    }));
  };

  const removeProductSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      product_specs: prev.product_specs?.filter((_, i) => i !== index)
    }));
  };

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
      )
    }));
  };

  const removeRatingCriterion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rating_criteria: prev.rating_criteria?.filter((_, i) => i !== index)
    }));
  };

  const mutation = useMutation({
    mutationFn: async (data: ContentFormData) => {
      console.log("Submitting content with data:", data);
      
      if (!data.author_id || !currentUser) {
        throw new Error("You must be logged in to create or edit content");
      }

      // First, create/update the content
      const { data: content, error: contentError } = await supabase
        .from("content")
        .upsert({
          id: data.id,
          title: data.title,
          description: data.description,
          content: data.content,
          type: data.type,
          status: data.status,
          author_id: data.author_id,
          featured_image: data.featured_image,
        })
        .select()
        .single();

      if (contentError) {
        console.error("Error creating/updating content:", contentError);
        throw contentError;
      }

      console.log("Content created/updated:", content);

      // If this is a review, create/update review details
      if (data.type === 'review') {
        const reviewData = {
          content_id: content.id,
          youtube_url: data.youtube_url,
          gallery: data.gallery,
          product_specs: data.product_specs ? JSON.stringify(data.product_specs) : null,
          overall_score: data.overall_score,
        };

        const { data: reviewDetails, error: reviewError } = await supabase
          .from('review_details')
          .upsert(reviewData)
          .select()
          .single();

        if (reviewError) {
          console.error("Error creating/updating review details:", reviewError);
          throw reviewError;
        }

        console.log("Review details created/updated:", reviewDetails);

        // Handle rating criteria
        if (data.rating_criteria?.length) {
          const criteriaData = data.rating_criteria.map(criterion => ({
            name: criterion.name,
            score: criterion.score,
            review_id: reviewDetails.id
          }));

          const { error: criteriaError } = await supabase
            .from('rating_criteria')
            .upsert(criteriaData);

          if (criteriaError) {
            console.error("Error creating/updating rating criteria:", criteriaError);
            throw criteriaError;
          }
        }
      }

      // Handle page relationship
      if (data.page_id) {
        const { error: pageContentError } = await supabase
          .from("page_content")
          .upsert({
            page_id: data.page_id,
            content_id: content.id,
            order_index: 0,
          });

        if (pageContentError) {
          console.error("Error creating/updating page content:", pageContentError);
          throw pageContentError;
        }
      }

      return content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content"] });
      toast({
        title: `Content ${id ? "updated" : "created"} successfully`,
        description: formData.title,
      });
      navigate("/admin/content");
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
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
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Featured Image</label>
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
                          <button
                            type="button"
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                            onClick={() => setFormData(prev => ({ ...prev, featured_image: null }))}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Gallery</label>
                    <div className="space-y-2">
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
                      <div className="grid grid-cols-4 gap-4 mt-4">
                        {formData.gallery?.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              className="h-24 w-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                              onClick={() => handleRemoveImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  
                  <div>
                    <label className="block text-sm font-medium mb-1">YouTube Video URL</label>
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
