
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { PageLayout } from "@/components/layouts/PageLayout";

export const CategoryPage = () => {
  const { categorySlug } = useParams();

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', categorySlug],
    queryFn: async () => {
      // First get the menu category
      const { data: menuCategory, error: menuError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (menuError) throw menuError;
      if (!menuCategory) return null;

      // Get the page associated with this category
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
        .eq('menu_category_id', menuCategory.id)
        .eq('page_type', 'category')
        .maybeSingle();

      if (pageError) throw pageError;

      // Get subcategories (menu items)
      const { data: menuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', menuCategory.id)
        .order('order_index');

      if (itemsError) throw itemsError;

      return {
        category: menuCategory,
        page,
        subcategories: menuItems
      };
    }
  });

  if (categoryLoading) {
    return <div>Loading...</div>;
  }

  if (!categoryData || !categoryData.category) {
    return <div>Category not found</div>;
  }

  const { category, page, subcategories } = categoryData;

  return (
    <PageLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">{category.name}</h1>

        {/* Featured Content Section */}
        {page?.template_type === 'featured' && page.page_content && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">Featured</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {page.page_content.map(({ content }) => (
                content && (
                  <Card key={content.id} className="p-6">
                    <h3 className="font-semibold text-xl mb-2">{content.title}</h3>
                    {content.description && (
                      <p className="text-gray-600 mb-4">{content.description}</p>
                    )}
                    {/* Add more content details as needed */}
                  </Card>
                )
              ))}
            </div>
          </div>
        )}

        {/* Subcategories Grid */}
        {subcategories && subcategories.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Browse {category.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subcategories.map((subcategory) => (
                <Link
                  key={subcategory.id}
                  to={`/${categorySlug}/${subcategory.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden">
                    {subcategory.image_url ? (
                      <div className="aspect-video">
                        <img
                          src={subcategory.image_url}
                          alt={subcategory.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">{subcategory.name}</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg group-hover:text-orange-500 transition-colors">
                        {subcategory.name}
                      </h3>
                      {subcategory.description && (
                        <p className="text-gray-600 mt-2">{subcategory.description}</p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
