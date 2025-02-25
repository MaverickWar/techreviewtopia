
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PageLayout } from "@/components/layouts/PageLayout";

export const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['subcategory', categorySlug, subcategorySlug],
    queryFn: async () => {
      // First get the menu item (subcategory)
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

      // Get the page associated with this subcategory
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
        category: menuCategory,
        menuItem,
        page
      };
    }
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!pageData || !pageData.menuItem) {
    return <div>Subcategory not found</div>;
  }

  const { menuItem, page } = pageData;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{menuItem.name}</h1>
        
        {menuItem.description && (
          <p className="text-xl text-gray-600 mb-8">{menuItem.description}</p>
        )}

        {/* Content Grid */}
        {page?.page_content && page.page_content.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {page.page_content.map(({ content }) => {
              if (!content) return null;

              return (
                <Card key={content.id} className="p-6">
                  <h2 className="text-2xl font-semibold mb-4">{content.title}</h2>
                  {content.description && (
                    <p className="text-gray-600 mb-4">{content.description}</p>
                  )}
                  {content.type === 'review' && content.review_details && (
                    <div className="mt-4">
                      {/* Add review-specific content here */}
                      {content.review_details.overall_score && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Overall Score:</span>
                          <span>{content.review_details.overall_score}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {content.content && (
                    <div className="mt-4 prose max-w-none">
                      {content.content}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600">No content available yet.</p>
        )}
      </div>
    </PageLayout>
  );
};
