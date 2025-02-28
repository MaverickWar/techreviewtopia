
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuCategory, MenuItem } from '@/types/navigation';

export const useNavigation = () => {
  return useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      console.log('Fetching navigation data');
      try {
        // Fetch categories
        const { data: categories, error: categoriesError } = await supabase
          .from('menu_categories')
          .select('*')
          .order('order_index');

        if (categoriesError) {
          console.error('Error fetching menu categories:', categoriesError);
          throw categoriesError;
        }

        // Fetch menu items
        const { data: menuItems, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('*')
          .order('order_index');

        if (menuItemsError) {
          console.error('Error fetching menu items:', menuItemsError);
          throw menuItemsError;
        }

        console.log(`Fetched ${categories.length} categories and ${menuItems.length} menu items`);

        // Map database fields to our TypeScript types
        const organizedCategories = categories.map((category): MenuCategory => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          type: category.type,
          order_index: category.order_index,
          created_at: category.created_at,
          updated_at: category.updated_at,
          items: menuItems
            .filter(item => item.category_id === category.id)
            .map((item): MenuItem => ({
              id: item.id,
              name: item.name,
              slug: item.slug,
              image_url: item.image_url,
              description: item.description,
              order_index: item.order_index,
              category_id: item.category_id,
              created_at: item.created_at,
              updated_at: item.updated_at
            }))
        }));

        return organizedCategories;
      } catch (error) {
        console.error('Error in useNavigation hook:', error);
        throw error;
      }
    },
    staleTime: 60000, // Cache for 1 minute to reduce API calls
    retry: 2,
    refetchOnWindowFocus: false
  });
};
