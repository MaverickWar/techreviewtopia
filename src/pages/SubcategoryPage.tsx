
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { ContentPageLayout } from "@/components/layouts/ContentPageLayout";
import { Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { MenuCategory, MenuItem, ContentType } from "@/types/navigation";

interface PageData {
  category: MenuCategory;
  menuItem: MenuItem;
  page: {
    id: string;
    page_content?: Array<{
      content: ContentType;
    }>;
  } | null;
}

export const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();

  const { data: pageData, isLoading } = useQuery<PageData | null>({
    queryKey: ['subcategory', categorySlug, subcategorySlug],
    queryFn: async () => {
      const { data: menuCategory, error: categoryError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (categoryError) throw categoryError;
      if (!menuCategory) return null;

      const { data: menuItem, error: menuItemError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', menuCategory.id)
        .eq('slug', subcategorySlug)
        .maybeSingle();

      if (menuItemError) throw menuItemError;
      if (!menuItem) return null;

      const { data: page, error: pageError } = await supabase
        .from('pages')
        .select(`
          *,
          page_content (
            content (
              *,
              review_details(*)
            )
          )
        `)
        .eq('menu_item_id', menuItem.id)
        .eq('page_type', 'subcategory')
        .maybeSingle();

      if (pageError) throw pageError;

      return {
        category: menuCategory as MenuCategory,
        menuItem: menuItem as MenuItem,
        page
      };
    }
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

  if (!pageData || !pageData.menuItem) {
    return (
      <ContentPageLayout
        header={{
          title: "Page Not Found",
          subtitle: "The requested page could not be found"
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

  const { category, menuItem, page } = pageData;

  return (
    <ContentPageLayout
      header={{
        title: menuItem.name,
        subtitle: menuItem.description || undefined,
        category: category.name
      }}
    >
      {page?.page_content?.map(({ content }) => {
        if (!content) return null;

        return (
          <div key={content.id} className="mb-8 last:mb-0">
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              {content.featured_image && (
                <div className="aspect-video w-full">
                  <img
                    src={content.featured_image}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500">
                    {new Date(content.created_at).toLocaleDateString()}
                  </span>
                  {content.type === 'review' && content.review_details?.[0] && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">
                        {content.review_details[0].overall_score.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
                
                <h2 className="text-2xl font-semibold mb-3 text-gray-900">
                  {content.title}
                </h2>
                
                {content.description && (
                  <p className="text-gray-600 mb-4">{content.description}</p>
                )}

                <Link
                  to={`/${categorySlug}/${subcategorySlug}/${content.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Read full {content.type} <ArrowRight size={16} />
                </Link>
              </div>
            </Card>
          </div>
        );
      })}
    </ContentPageLayout>
  );
};
