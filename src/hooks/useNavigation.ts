
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuCategory, MenuItem } from '@/types/navigation';

export const useNavigation = () => {
  return useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      // Fetch categories
      const { data: categories, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .order('order_index');

      if (categoriesError) throw categoriesError;

      // Fetch menu items
      const { data: menuItems, error: menuItemsError } = await supabase
        .from('menu_items')
        .select('*')
        .order('order_index');

      if (menuItemsError) throw menuItemsError;

      // Map database fields to our TypeScript types
      const organizedCategories = categories.map((category): MenuCategory => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        type: category.type,
        orderIndex: category.order_index,
        items: menuItems
          .filter(item => item.category_id === category.id)
          .map((item): MenuItem => ({
            id: item.id,
            name: item.name,
            slug: item.slug,
            imageUrl: item.image_url,
            description: item.description,
            orderIndex: item.order_index
          }))
      }));

      return organizedCategories;
    }
  });
};
