
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContentPageLayout } from "@/components/layouts/ContentPageLayout";
import { Link } from "react-router-dom";
import { Star, Calendar, User } from "lucide-react";
import { format } from "date-fns";

interface ArticleData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: "article" | "review";
  featured_image: string | null;
  published_at: string | null;
  author_id: string;
  review_details?: Array<{
    overall_score: number | null;
    gallery: string[] | null;
    product_specs: Record<string, any> | null;
    youtube_url: string | null;
  }>;
}

export const ArticlePage = () => {
  const { categorySlug, contentId } = useParams();

  const { data: article, isLoading } = useQuery<ArticleData | null>({
    queryKey: ['article', contentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          review_details(*)
        `)
        .eq('id', contentId)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <ContentPageLayout
        header={{
          title: "Loading...",
          subtitle: "Please wait while we load the content"
        }}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </ContentPageLayout>
    );
  }

  if (!article) {
    return (
      <ContentPageLayout
        header={{
          title: "Content Not Found",
          subtitle: "The requested content could not be found"
        }}
      >
        <div className="text-center py-8">
          <p className="text-gray-600">
            Please check the URL and try again
          </p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </ContentPageLayout>
    );
  }

  return (
    <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="relative mb-12">
        {article.featured_image && (
          <div className="aspect-[2/1] overflow-hidden rounded-xl">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="mt-8">
          {/* Article Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            {article.type === "review" && article.review_details?.[0]?.overall_score && (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Star className="h-5 w-5 fill-current" />
                {article.review_details[0].overall_score.toFixed(1)}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), 'MMMM d, yyyy')}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Author Name
            </span>
          </div>

          {/* Title & Description */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>
          {article.description && (
            <p className="text-xl text-gray-600 mb-8">
              {article.description}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="prose prose-lg max-w-none">
        {/* If review, show review specific content */}
        {article.type === "review" && article.review_details?.[0] && (
          <div className="mb-8">
            {/* Product Gallery */}
            {article.review_details[0].gallery && article.review_details[0].gallery.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {article.review_details[0].gallery.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* YouTube Video */}
            {article.review_details[0].youtube_url && (
              <div className="aspect-video mb-8">
                <iframe
                  src={article.review_details[0].youtube_url.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            )}

            {/* Product Specifications */}
            {article.review_details[0].product_specs && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Specifications</h2>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(article.review_details[0].product_specs).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <dt className="text-sm font-medium text-gray-500">{key}</dt>
                      <dd className="text-base text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Article Content */}
        <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
      </div>
    </article>
  );
};
