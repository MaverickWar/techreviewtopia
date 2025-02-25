import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ContentPageLayout } from "@/components/layouts/ContentPageLayout";
import { ArrowRight } from "lucide-react";
import { MenuCategory, MenuItem, ContentType } from "@/types/navigation";

interface PageContent {
  content: ContentType;
}

interface PageData {
  id: string;
  title: string;
  template_type?: string;
  page_content?: PageContent[];
}

interface CategoryData {
  category: MenuCategory;
  page: PageData | null;
  subcategories: MenuItem[];
}

export const CategoryPage = () => {
  const { categorySlug } = useParams();

  const { data: categoryData, isLoading } = useQuery<CategoryData | null>({
    queryKey: ['category', categorySlug],
    queryFn: async () => {
      const { data: menuCategory, error: menuError } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('slug', categorySlug)
        .maybeSingle();

      if (menuError) throw menuError;
      if (!menuCategory) return null;

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

      const { data: menuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', menuCategory.id)
        .order('order_index');

      if (itemsError) throw itemsError;

      // Map the data to match our TypeScript interfaces
      const mappedPage = page ? {
        ...page,
        page_content: page.page_content?.map(pc => ({
          content: {
            ...pc.content,
            type: pc.content.type as 'article' | 'review'
          }
        }))
      } : null;

      return {
        category: menuCategory as MenuCategory,
        page: mappedPage as PageData | null,
        subcategories: menuItems as MenuItem[]
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

  if (!categoryData || !categoryData.category) {
    return (
      <ContentPageLayout
        header={{
          title: "Category Not Found",
          subtitle: "The requested category could not be found"
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

  const { category, page, subcategories } = categoryData;

  return (
    <ContentPageLayout
      header={{
        title: category.name,
        subtitle: `Explore our ${category.name} collection`,
      }}
    >
      {/* Featured Content Section */}
      {page?.template_type === 'featured' && page.page_content && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {page.page_content.map(({ content }) => (
              content && (
                <Card key={content.id} className="hover:shadow-lg transition-shadow">
                  {content.featured_image && (
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                      <img 
                        src={content.featured_image} 
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-xl mb-2 text-gray-900">
                      {content.title}
                    </h3>
                    {content.description && (
                      <p className="text-gray-600 mb-4">{content.description}</p>
                    )}
                    <Link 
                      to={`/${categorySlug}/${content.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                    >
                      Read more <ArrowRight size={16} />
                    </Link>
                  </div>
                </Card>
              )
            ))}
          </div>
        </div>
      )}

      {/* Subcategories Grid */}
      {subcategories && subcategories.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Browse {category.name}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                to={`/${categorySlug}/${subcategory.slug}`}
                className="group"
              >
                <Card className="overflow-hidden h-full hover:shadow-lg transition-all duration-300">
                  {subcategory.image_url ? (
                    <div className="aspect-video">
                      <img
                        src={subcategory.image_url}
                        alt={subcategory.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">{subcategory.name}</span>
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-gray-600 mt-2 line-clamp-2">{subcategory.description}</p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ContentPageLayout>
  );
};
