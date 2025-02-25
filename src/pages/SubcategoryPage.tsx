
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentPageLayout } from '@/components/layouts/ContentPageLayout';
import { useRealtimeContent } from '@/hooks/useRealtimeContent';
import { ContentPreviewCard } from '@/components/content/ContentPreviewCard';
import { Link } from 'react-router-dom';

interface PageData {
  menu_items: {
    name: string;
    description: string | null;
    menu_categories: {
      name: string;
    };
  };
  content: Array<{
    id: string;
    title: string;
    description: string | null;
    featured_image: string | null;
    type: "article" | "review";
    published_at: string | null;
    review_details?: Array<{
      overall_score: number | null;
    }>;
  }>;
}

export const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  useRealtimeContent();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['subcategory', categorySlug, subcategorySlug],
    queryFn: async () => {
      // First get the menu item to get its ID
      const { data: menuItem, error: menuItemError } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          menu_categories!inner(
            name
          )
        `)
        .eq('slug', subcategorySlug)
        .eq('menu_categories.slug', categorySlug)
        .single();

      if (menuItemError) throw menuItemError;

      // Then get all published content for this subcategory
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          review_details(*)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (contentError) throw contentError;

      return {
        menu_items: menuItem,
        content: content || []
      };
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

  if (!pageData) {
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
    <ContentPageLayout
      header={{
        title: pageData.menu_items.name,
        subtitle: pageData.menu_items.description,
        category: pageData.menu_items.menu_categories.name
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageData.content.map((item) => (
          <ContentPreviewCard
            key={item.id}
            slug={item.id}
            categorySlug={categorySlug || ""}
            title={item.title}
            description={item.description}
            type={item.type as "article" | "review"}
            featuredImage={item.featured_image}
            publishedAt={item.published_at}
            overallScore={item.review_details?.[0]?.overall_score}
          />
        ))}
      </div>
    </ContentPageLayout>
  );
};
