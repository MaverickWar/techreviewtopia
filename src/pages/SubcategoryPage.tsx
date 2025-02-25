import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentPageLayout } from '@/components/layouts/ContentPageLayout';
import { useRealtimeContent } from '@/hooks/useRealtimeContent';
import { Separator } from '@/components/ui/separator';
import { Star, Youtube } from 'lucide-react';
import { Json } from '@/integrations/supabase/types';

interface ReviewDetailsType {
  id: string;
  content_id: string;
  gallery: string[] | null;
  youtube_url: string | null;
  product_specs: Json | null;
  overall_score: number | null;
}

interface RatingCriteriaType {
  id: string;
  name: string;
  review_id: string | null;
  score: number | null;
}

interface DatabaseContent {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: string;
  status: string;
  featured_image: string | null;
  created_at: string | null;
  author_id: string;
  page_id: string | null;
  published_at: string | null;
  review_details: ReviewDetailsType[];
  rating_criteria: RatingCriteriaType[] | null;
}

export const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  useRealtimeContent();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['subcategory', categorySlug, subcategorySlug],
    queryFn: async () => {
      const { data: pageData, error: pageError } = await supabase
        .from('pages')
        .select(`
          *,
          menu_items (
            name,
            description,
            menu_categories (
              name
            )
          ),
          page_content (
            content (
              *,
              review_details (*),
              rating_criteria (*)
            )
          )
        `)
        .eq('menu_items.slug', subcategorySlug)
        .eq('menu_items.menu_categories.slug', categorySlug)
        .maybeSingle();

      if (pageError) {
        console.error('Error fetching page:', pageError);
        return null;
      }

      if (!pageData) {
        console.error('No page found');
        return null;
      }

      return {
        ...pageData,
        menu_items: pageData.menu_items[0],
        page_content: pageData.page_content
      };
    },
  });

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }

  if (!pageData) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="text-lg">Page not found</div>
    </div>;
  }

  const content = pageData.page_content?.map(pc => {
    if (pc.content) {
      const processedContent = {
        ...pc.content,
        rating_criteria: Array.isArray(pc.content.rating_criteria) 
          ? pc.content.rating_criteria 
          : [],
        review_details: Array.isArray(pc.content.review_details) 
          ? pc.content.review_details 
          : []
      };
      return processedContent as DatabaseContent;
    }
    return null;
  }).filter(Boolean) || [];

  const renderContent = (item: DatabaseContent) => {
    const review = item.review_details?.[0];
    let productSpecs = [];
    
    if (review?.product_specs) {
      try {
        productSpecs = typeof review.product_specs === 'string' 
          ? JSON.parse(review.product_specs)
          : review.product_specs;
      } catch (e) {
        console.error('Error parsing product specs:', e);
      }
    }

    return (
      <article key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Featured Image */}
        {item.featured_image && (
          <div className="aspect-video w-full overflow-hidden">
            <img 
              src={item.featured_image} 
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Title and Type Badge */}
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
            {item.type === 'review' && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                <Star className="w-4 h-4 mr-1" />
                Review
              </span>
            )}
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-lg text-gray-600 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Review Specific Content */}
          {item.type === 'review' && review && (
            <div className="space-y-6">
              {/* Overall Score */}
              {review.overall_score && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Overall Score</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {review.overall_score}/10
                  </div>
                </div>
              )}

              {/* Rating Criteria */}
              {item.rating_criteria && item.rating_criteria.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Rating Breakdown</h3>
                  <div className="grid gap-2">
                    {item.rating_criteria.map((criterion) => (
                      <div key={criterion.id} className="flex items-center justify-between">
                        <span className="text-gray-600">{criterion.name}</span>
                        <span className="font-medium">{criterion.score}/10</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Specifications */}
              {productSpecs && productSpecs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Specifications</h3>
                  <div className="grid gap-2">
                    {productSpecs.map((spec: any, index: number) => (
                      <div key={index} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{spec.label}</span>
                        <span className="font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Video */}
              {review.youtube_url && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Youtube className="w-5 h-5 mr-2 text-red-600" />
                    Video Review
                  </h3>
                  <div className="aspect-video">
                    <iframe
                      src={review.youtube_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Gallery */}
              {review.gallery && review.gallery.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900">Gallery</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {review.gallery.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden">
                        <img
                          src={image}
                          alt={`Gallery image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <Separator className="my-6" />

          {/* Main Content */}
          {item.content && (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: item.content }}
            />
          )}
        </div>
      </article>
    );
  };

  return (
    <ContentPageLayout
      header={{
        title: pageData.menu_items?.name || '',
        subtitle: pageData.menu_items?.description || '',
        category: pageData.menu_items?.menu_categories?.name || ''
      }}
    >
      <div className="space-y-8">
        {content.map((item) => renderContent(item))}
      </div>
    </ContentPageLayout>
  );
};
