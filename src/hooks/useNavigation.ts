
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { MenuCategory, MenuItem } from '@/types/navigation';

export const useNavigation = () => {
  console.log("🔍 useNavigation hook called");
  
  return useQuery({
    queryKey: ['navigation'],
    queryFn: async () => {
      console.log('🚀 Fetching navigation data from Supabase');
      try {
        // Test the connection first
        const { error: connectionError } = await supabase.from('menu_categories').select('count');
        if (connectionError) {
          console.error('❌ Connection to Supabase failed:', connectionError);
          throw connectionError;
        }
        
        // Fetch categories and menu items in parallel for better performance
        const [categoriesResponse, menuItemsResponse] = await Promise.all([
          supabase
            .from('menu_categories')
            .select('*')
            .order('order_index'),
          supabase
            .from('menu_items')
            .select('*')
            .order('order_index')
        ]);

        const { data: categories, error: categoriesError } = categoriesResponse;
        const { data: menuItems, error: menuItemsError } = menuItemsResponse;

        if (categoriesError) {
          console.error('❌ Error fetching menu categories:', categoriesError);
          throw categoriesError;
        }

        if (menuItemsError) {
          console.error('❌ Error fetching menu items:', menuItemsError);
          throw menuItemsError;
        }

        console.log(`✅ Successfully fetched ${categories?.length || 0} categories and ${menuItems?.length || 0} menu items`);
        
        if (!categories?.length) {
          console.warn("⚠️ No categories fetched from database");
          
          // Since we have no data yet for development/testing, return some mock data
          return [
            {
              id: "mock-tech",
              name: "Technology",
              slug: "technology",
              type: "megamenu",
              order_index: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              items: [
                {
                  id: "mock-laptop",
                  name: "Laptops",
                  slug: "laptops",
                  description: "Portable computing devices",
                  order_index: 0,
                  category_id: "mock-tech",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
                {
                  id: "mock-phones",
                  name: "Smartphones",
                  slug: "smartphones",
                  description: "Mobile communication devices",
                  order_index: 1,
                  category_id: "mock-tech",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              ]
            },
            {
              id: "mock-software",
              name: "Software",
              slug: "software",
              type: "standard",
              order_index: 1,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              items: []
            }
          ];
        }

        // Create a map for faster item lookup
        const itemsByCategory: Record<string, MenuItem[]> = {};
        
        // Pre-process menu items into a lookup map (faster than filter in loop)
        menuItems?.forEach(item => {
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
        const organizedCategories = categories?.map((category): MenuCategory => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          type: category.type,
          order_index: category.order_index,
          created_at: category.created_at,
          updated_at: category.updated_at,
          items: itemsByCategory[category.id] || []
        })) || [];

        console.log('📊 Organized categories structure:', JSON.stringify(organizedCategories.map(c => ({
          id: c.id,
          name: c.name,
          itemCount: c.items?.length || 0
        })), null, 2));

        return organizedCategories;
      } catch (error) {
        console.error('🔥 Critical error in useNavigation hook:', error);
        // Return mock data for development when there's an error
        console.warn('⚠️ Using fallback mock data for navigation');
        return [
          {
            id: "fallback-tech",
            name: "Technology",
            slug: "technology",
            type: "megamenu",
            order_index: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            items: [
              {
                id: "fallback-laptop",
                name: "Laptops",
                slug: "laptops",
                description: "Portable computing devices",
                order_index: 0,
                category_id: "fallback-tech",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ]
          }
        ];
      }
    },
    staleTime: 300000, // Cache for 5 minutes to improve performance
    gcTime: 600000, // Keep in cache for 10 minutes (previously cacheTime)
    retry: 2, // Retry twice to handle transient network issues
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true
  });
};
