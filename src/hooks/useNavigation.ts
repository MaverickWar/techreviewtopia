
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

      // Organize menu items by category
      const organizedCategories = categories.map((category) => ({
        ...category,
        items: menuItems.filter((item) => item.category_id === category.id)
      }));

      return organizedCategories as MenuCategory[];
    }
  });
};
