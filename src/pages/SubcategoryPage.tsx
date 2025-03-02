
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentPageLayout } from '@/components/layouts/ContentPageLayout';
import { useRealtimeContent } from '@/hooks/useRealtimeContent';
import { ContentPreviewCard } from '@/components/content/ContentPreviewCard';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface PageData {
  menu_items: {
    id: string;
    name: string;
    description: string | null;
    menu_categories: {
      id: string;
      name: string;
      slug: string;
    };
  };
  content: Array<{
    id: string;
    title: string;
    description: string | null;
    featured_image: string | null;
    type: "article" | "review";
    published_at: string | null;
    layout_settings?: Record<string, any>;
    review_details?: Array<{
      overall_score: number | null;
    }>;
  }>;
}

export const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  useRealtimeContent();

  const { data: pageData, isLoading, error } = useQuery({
    queryKey: ['subcategory', categorySlug, subcategorySlug],
    queryFn: async () => {
      console.log(`Fetching data for category: ${categorySlug}, subcategory: ${subcategorySlug}`);
      
      // First get the menu item to get its ID
      const { data: menuItem, error: menuItemError } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          menu_categories!inner(
            id,
            name,
            slug
          )
        `)
        .eq('slug', subcategorySlug)
        .eq('menu_categories.slug', categorySlug)
        .single();

      if (menuItemError) {
        console.error('Error fetching menu item:', menuItemError);
        throw menuItemError;
      }

      console.log('Found menu item:', menuItem);

      // Check if there's a page for this menu item
      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('id')
        .eq('menu_item_id', menuItem.id)
        .maybeSingle();

      if (pageError && pageError.code !== 'PGRST116') {
        console.error('Error checking for page:', pageError);
      }

      let pageId = page?.id;
      let menuItemId = menuItem.id;

      // Then get all published content linked to this subcategory
      // We need to query in two ways:
      // 1. Content directly linked to the menu_item via pages and page_content
      // 2. Content with page_id that matches our menuItemId (for backward compatibility)

      // Query for content linked via page_content
      let contentQuery;
      if (pageId) {
        console.log('Fetching content via page_id:', pageId);
        const { data: pageContent, error: pageContentError } = await supabase
          .from('page_content')
          .select(`
            content_id
          `)
          .eq('page_id', pageId);

        if (pageContentError) {
          console.error('Error fetching page content:', pageContentError);
          throw pageContentError;
        }

        if (pageContent && pageContent.length > 0) {
          const contentIds = pageContent.map(pc => pc.content_id);
          console.log('Found content IDs via page_content:', contentIds);

          contentQuery = supabase
            .from('content')
            .select(`
              *,
              review_details(*)
            `)
            .eq('status', 'published')
            .in('id', contentIds)
            .order('published_at', { ascending: false });
        } else {
          // Fallback to checking menu_item_id directly
          console.log('No page_content found, checking direct menu_item_id connections');
          contentQuery = supabase
            .from('content')
            .select(`
              *,
              review_details(*)
            `)
            .eq('status', 'published')
            .eq('page_id', menuItemId)
            .order('published_at', { ascending: false });
        }
      } else {
        // If no page exists, check directly with menu_item_id
        console.log('No page found, checking direct menu_item_id connections');
        contentQuery = supabase
          .from('content')
          .select(`
            *,
            review_details(*)
          `)
          .eq('status', 'published')
          .eq('page_id', menuItemId)
          .order('published_at', { ascending: false });
      }

      const { data: content, error: contentError } = await contentQuery;

      if (contentError) {
        console.error('Error fetching content:', contentError);
        throw contentError;
      }

      console.log(`Found ${content?.length || 0} content items for this subcategory`);

      return {
        menu_items: menuItem,
        content: content || []
      };
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <ContentPageLayout 
        header={{
          title: "Loading Content...",
          subtitle: "Please wait while we load the category content"
        }}
      >
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading content for {subcategorySlug}</p>
          </div>
        </div>
      </ContentPageLayout>
    );
  }

  if (error || !pageData) {
    console.error('Error loading subcategory page:', error);
    return (
      <ContentPageLayout
        header={{
          title: "Content Not Found",
          subtitle: "We couldn't find the category or subcategory you're looking for"
        }}
      >
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            The requested category or subcategory could not be found
          </p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Home
          </Link>
        </div>
      </ContentPageLayout>
    );
  }

  const contentCount = pageData.content.length;

  return (
    <ContentPageLayout
      header={{
        title: pageData.menu_items.name,
        subtitle: pageData.menu_items.description || `Browse all ${pageData.menu_items.name} content`
      }}
    >
      {contentCount > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageData.content.map((item) => (
            <ContentPreviewCard
              key={item.id}
              slug={item.id}
              categorySlug={categorySlug || ""}
              title={item.title}
              description={item.description}
              type={item.type}
              featuredImage={item.featured_image}
              publishedAt={item.published_at}
              overallScore={item.review_details?.[0]?.overall_score}
              award={item.layout_settings?.award || item.layout_settings?.awardLevel}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-md bg-gray-50">
          <p className="text-gray-600 mb-4">
            No content has been published in this category yet
          </p>
          <Link to="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse other categories
          </Link>
        </div>
      )}
    </ContentPageLayout>
  );
};
