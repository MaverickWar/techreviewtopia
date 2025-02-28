
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

const ArticlePage = () => {
  const { contentId, categorySlug } = useParams<{ contentId: string, categorySlug: string }>();
  
  // Fetch article data
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', contentId],
    queryFn: async () => {
      if (!contentId) return null;
      
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
        console.error("Error fetching article:", error);
        throw error;
      }
      
      return data as unknown as ArticleData;
    },
    enabled: !!contentId
  });

  // Determine which layout to use
  const getLayoutComponent = (article: ArticleData) => {
    const layoutTemplate = article.layout_template || 'classic';
    
    switch (layoutTemplate) {
      case 'magazine':
        return <MagazineLayout article={article} />;
      case 'review':
        return <ReviewLayout article={article} />;
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
