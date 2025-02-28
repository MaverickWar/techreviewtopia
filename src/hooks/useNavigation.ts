
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuCategory, MenuItem } from '@/types/navigation';

export const useNavigation = () => {
  return useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      console.log('Fetching navigation data');
      try {
        // Fetch categories and menu items in parallel for better performance
        const [categoriesResponse, menuItemsResponse] = await Promise.all([
          supabase.from('menu_categories').select('*').order('order_index'),
          supabase.from('menu_items').select('*').order('order_index')
        ]);

        const { data: categories, error: categoriesError } = categoriesResponse;
        const { data: menuItems, error: menuItemsError } = menuItemsResponse;

        if (categoriesError) {
          console.error('Error fetching menu categories:', categoriesError);
          throw categoriesError;
        }

        if (menuItemsError) {
          console.error('Error fetching menu items:', menuItemsError);
          throw menuItemsError;
        }

        console.log(`Fetched ${categories.length} categories and ${menuItems.length} menu items`);

        // Create a map for faster item lookup
        const itemsByCategory: Record<string, MenuItem[]> = {};
        
        // Pre-process menu items into a lookup map (faster than filter in loop)
        menuItems.forEach(item => {
          if (!itemsByCategory[item.category_id]) {
            itemsByCategory[item.category_id] = [];
          }
          
          itemsByCategory[item.category_id].push({
            id: item.id,
            name: item.name,
            slug: item.slug,
            image_url: item.image_url,
            description: item.description,
            order_index: item.order_index,
            category_id: item.category_id,
            created_at: item.created_at,
            updated_at: item.updated_at
          });
        });

        // Map database fields to our TypeScript types more efficiently
        const organizedCategories = categories.map((category): MenuCategory => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          type: category.type,
          order_index: category.order_index,
          created_at: category.created_at,
          updated_at: category.updated_at,
          items: itemsByCategory[category.id] || []
        }));

        return organizedCategories;
      } catch (error) {
        console.error('Error in useNavigation hook:', error);
        throw error;
      }
    },
    staleTime: 300000, // Cache for 5 minutes to improve performance
    gcTime: 600000, // Keep in cache for 10 minutes (previously cacheTime)
    retry: 1, // Only retry once to avoid excessive API calls on failure
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchOnReconnect: false // Don't refetch on reconnect if data exists
  });
};
