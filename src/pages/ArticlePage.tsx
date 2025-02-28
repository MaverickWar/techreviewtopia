
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ArticleData, LayoutTemplate } from "@/types/content";

// Import all layout components
import { ClassicLayout } from "@/components/layouts/article/ClassicLayout";
import { MagazineLayout } from "@/components/layouts/article/MagazineLayout";
import { ReviewLayout } from "@/components/layouts/article/ReviewLayout";
import { GalleryLayout } from "@/components/layouts/article/GalleryLayout";
import { TechnicalLayout } from "@/components/layouts/article/TechnicalLayout";
import { BasicReviewLayout } from "@/components/layouts/article/BasicReviewLayout";
import { EnhancedReviewLayout } from "@/components/layouts/article/EnhancedReviewLayout";
import { useRealtimeContent } from "@/hooks/useRealtimeContent";

const ArticlePage = () => {
  const { contentId, categorySlug } = useParams<{ contentId: string, categorySlug: string }>();
  
  // Set up realtime updates
  useRealtimeContent();
  
  // Fetch article data
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', contentId],
    queryFn: async () => {
      if (!contentId) return null;
      
      try {
        // First get the content
        const { data: contentData, error: contentError } = await supabase
          .from('content')
          .select('*')
          .eq('id', contentId)
          .single();
          
        if (contentError) {
          console.error("Error fetching content:", contentError);
          throw contentError;
        }
        
        console.log("Fetched article with layout template:", contentData?.layout_template);
        
        // For reviews, fetch the review details and rating criteria separately
        let reviewDetails = null;
        let ratingCriteria = [];
        
        if (contentData.type === 'review') {
          // Get review details
          const { data: reviewData, error: reviewError } = await supabase
            .from('review_details')
            .select('*')
            .eq('content_id', contentId)
            .maybeSingle();
            
          if (reviewError) {
            console.error("Error fetching review details:", reviewError);
          } else if (reviewData) {
            reviewDetails = reviewData;
            
            // Get rating criteria if we have review details
            const { data: criteriaData, error: criteriaError } = await supabase
              .from('rating_criteria')
              .select('*')
              .eq('review_id', reviewData.id);
              
            if (criteriaError) {
              console.error("Error fetching rating criteria:", criteriaError);
            } else {
              ratingCriteria = criteriaData || [];
            }
          }
        }
        
        // Combine all the data
        return {
          ...contentData,
          review_details: reviewDetails ? [reviewDetails] : [],
          rating_criteria: ratingCriteria
        } as ArticleData;
      } catch (error) {
        console.error("Error fetching article:", error);
        throw error;
      }
    },
    enabled: !!contentId
  });

  // Determine which layout to use
  const getLayoutComponent = (article: ArticleData) => {
    const layoutTemplate = article.layout_template || 'classic';
    console.log("Using layout template:", layoutTemplate);
    
    switch (layoutTemplate) {
      case 'magazine':
        return <MagazineLayout article={article} />;
      case 'review':
        return <ReviewLayout article={article} />;
      case 'basic-review':
        return <BasicReviewLayout article={article} />;
      case 'enhanced-review':
        return <EnhancedReviewLayout article={article} />;
      case 'gallery':
        return <GalleryLayout article={article} />;
      case 'technical':
        return <TechnicalLayout article={article} />;
      case 'classic':
      default:
        return <ClassicLayout article={article} />;
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="spinner mb-4" />
        <p className="text-gray-500">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-500">
          The article you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  // Render the appropriate layout based on the template
  return getLayoutComponent(article);
};

export default ArticlePage;
