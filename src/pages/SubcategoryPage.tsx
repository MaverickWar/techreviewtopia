
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentPageLayout } from '@/components/layouts/ContentPageLayout';
import { useRealtimeContent } from '@/hooks/useRealtimeContent';

export const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  useRealtimeContent(); // Add real-time updates

  const { data: pageData, isLoading } = useQuery({
    queryKey: ['subcategory', categorySlug, subcategorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pages')
        .select(`
          *,
          menu_items!inner(
            name,
            description,
            category_id,
            menu_categories!inner(
              name
            )
          ),
          page_content(
            content(*)
          )
        `)
        .eq('menu_items.slug', subcategorySlug || '')
        .eq('menu_items.menu_categories.slug', categorySlug || '')
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!pageData) {
    return <div>Page not found</div>;
  }

  const content = pageData.page_content?.map(pc => pc.content) || [];

  return (
    <ContentPageLayout
      header={{
        title: pageData.menu_items.name,
        subtitle: pageData.menu_items.description,
        category: pageData.menu_items.menu_categories.name
      }}
    >
      <div className="space-y-8">
        {content.map((item: any) => (
          <article key={item.id} className="prose max-w-none">
            <h2>{item.title}</h2>
            {item.description && <p className="text-gray-600">{item.description}</p>}
            <div dangerouslySetInnerHTML={{ __html: item.content || '' }} />
          </article>
        ))}
      </div>
    </ContentPageLayout>
  );
};

