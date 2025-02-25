
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { ContentPageLayout } from "@/components/layouts/ContentPageLayout";
import { ContentPreviewCard } from "@/components/content/ContentPreviewCard";
import { MenuCategory, MenuItem } from "@/types/navigation";

interface PageContent {
  id: string;
  type: "article" | "review";
  title: string;
  description: string | null;
  featured_image: string | null;
  published_at: string | null;
  status: string;
  review_details?: {
    overall_score: number | null;
  }[];
}

interface CategoryData {
  category: MenuCategory;
  content: PageContent[];
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

      // Fetch content for this category
      const { data: content, error: contentError } = await supabase
        .from('content')
        .select(`
          *,
          review_details(*)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (contentError) throw contentError;

      // Fetch subcategories
      const { data: menuItems, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('category_id', menuCategory.id)
        .order('order_index');

      if (itemsError) throw itemsError;

      return {
        category: menuCategory as MenuCategory,
        content: content as PageContent[],
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

  const { category, content, subcategories } = categoryData;

  return (
    <ContentPageLayout
      header={{
        title: category.name,
        subtitle: `Explore our ${category.name} collection`,
      }}
    >
      {/* Featured Content Section */}
      {content && content.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Latest Content</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
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
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors">
                      {subcategory.name}
                    </h3>
                    {subcategory.description && (
                      <p className="text-gray-600 mt-2 line-clamp-2">{subcategory.description}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ContentPageLayout>
  );
};
