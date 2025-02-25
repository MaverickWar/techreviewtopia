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
      
      const { data: contentData, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          page_content!inner(page_id),
          review_details(*)
        `)
        .eq('id', id)
        .single();
      
      if (contentError) throw contentError;

      // If this is a review, fetch rating criteria
      if (contentData.type === 'review' && contentData.review_details?.[0]?.id) {
        const { data: criteriaData, error: criteriaError } = await supabase
          .from('rating_criteria')
          .select('*')
          .eq('review_id', contentData.review_details[0].id);
          
        if (criteriaError) throw criteriaError;
        
        return {
          ...contentData,
          rating_criteria: criteriaData || []
        };
      }
      
      return contentData;
    },
    enabled: !!id,
  });

  const fetchParentCategory = async (pageId: string) => {
    const { data, error } = await supabase
      .from('pages')
      .select('menu_category_id')
      .eq('id', pageId)
      .single();

    if (!error && data?.menu_category_id) {
      setSelectedCategory(data.menu_category_id);
    }
  };

  useEffect(() => {
    if (existingContent) {
      const reviewDetails = existingContent.review_details?.[0];
      
      // Parse product specs from JSON if they exist
      let parsedProductSpecs: ProductSpec[] = [];
      if (reviewDetails?.product_specs) {
        try {
          const specs = JSON.parse(reviewDetails.product_specs as string);
          if (Array.isArray(specs)) {
            parsedProductSpecs = specs.map(spec => ({
              label: String(spec.label || ''),
              value: String(spec.value || '')
            }));
          }
        } catch (e) {
          console.error('Error parsing product specs:', e);
        }
      }

      const {
        review_details,
        page_content,
        ...contentData
      } = existingContent;

      setFormData({
        ...contentData,
        type: existingContent.type as ContentType,
        status: existingContent.status as ContentStatus,
        page_id: page_content?.[0]?.page_id || null,
        product_specs: parsedProductSpecs,
        gallery: reviewDetails?.gallery || [],
        youtube_url: reviewDetails?.youtube_url || null,
        overall_score: reviewDetails?.overall_score || 0,
        review_details: reviewDetails ? {
          id: reviewDetails.id,
          content_id: reviewDetails.content_id,
          youtube_url: reviewDetails.youtube_url || null,
          gallery: reviewDetails.gallery || [],
          product_specs: parsedProductSpecs,
          overall_score: reviewDetails.overall_score || 0
        } : undefined
      });
      
      // Fetch parent category when page_id is available
      if (page_content?.[0]?.page_id) {
        fetchParentCategory(page_content[0].page_id);
      }
    }
  }, [existingContent]);

  // Get categories and subcategories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title')
        .eq('page_type', 'category');
      
      if (error) throw error;
      return data;
    },
  });

  // Modified subcategories query to show subcategories based on selected category
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    enabled: !!selectedCategory,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select('id, title')
        .eq('page_type', 'subcategory')
        .eq('menu_category_id', selectedCategory);
      
      if (error) throw error;
      return data;
    },
  });

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
      if (!data.author_id) {
        throw new Error("No author ID available");
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

      if (contentError) throw contentError;

      // If this is a review, create/update review details
      if (data.type === 'review') {
        const reviewData = {
          content_id: content.id,
          youtube_url: data.youtube_url,
          gallery: data.gallery,
          product_specs: JSON.stringify(data.product_specs),
          overall_score: data.overall_score,
        };

        const { data: reviewDetails, error: reviewError } = await supabase
          .from('review_details')
          .upsert(reviewData)
          .select()
          .single();

        if (reviewError) throw reviewError;

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

          if (criteriaError) throw criteriaError;
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

        if (pageContentError) throw pageContentError;
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

          {/* Basic Information */}
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

            {/* Categories Selection */}
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
                        setSelectedCategory(e.target.value || null);
                        setFormData(prev => ({ ...prev, page_id: null }));
                      }}
                    >
                      <option value="">Select a category</option>
                      {categories?.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
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
                            {subcategory.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Media Upload */}
            <AccordionItem value="media">
              <AccordionTrigger>Media</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Featured Image */}
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

                  {/* Gallery */}
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

                  {/* YouTube Video */}
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

            {/* Review Specific Fields */}
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

          {/* Status */}
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
