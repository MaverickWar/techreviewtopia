
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CategorySectionProps {
  selectedCategory: string | null;
  pageId: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  onPageIdChange: (pageId: string | null) => void;
}

export const CategorySection = ({
  selectedCategory,
  pageId,
  onCategoryChange,
  onPageIdChange
}: CategorySectionProps) => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Get categories query
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories');
      const { data, error } = await supabase
        .from('menu_categories')
        .select('id, name')
        .order('order_index');
      
      if (error) {
        toast({
          title: "Error fetching categories",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      console.log('Categories:', data);
      return data;
    },
  });

  // Subcategories query
  const { data: subcategories, isLoading: isLoadingSubcategories } = useQuery({
    queryKey: ['subcategories', selectedCategory],
    enabled: !!selectedCategory,
    queryFn: async () => {
      console.log('Fetching subcategories for category:', selectedCategory);
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name')
        .eq('category_id', selectedCategory)
        .order('order_index');
      
      if (error) {
        toast({
          title: "Error fetching subcategories",
          description: error.message,
          variant: "destructive"
        });
        throw error;
      }
      console.log('Subcategories loaded:', data);
      return data;
    },
  });

  // If we have a pageId but no selectedCategory, fetch the parent category
  useEffect(() => {
    const fetchParentCategory = async () => {
      if (pageId && !selectedCategory && isInitialLoad) {
        console.log('Fetching parent category for page ID:', pageId);
        setIsInitialLoad(false);
        
        try {
          // First check if this is a menu item ID
          const { data: menuItem, error: menuItemError } = await supabase
            .from('menu_items')
            .select('id, category_id')
            .eq('id', pageId)
            .maybeSingle();
          
          if (!menuItemError && menuItem?.category_id) {
            console.log('Found category from menu item:', menuItem.category_id);
            onCategoryChange(menuItem.category_id);
            return;
          }
          
          // If not a direct menu item, check if it's a page with menu_item_id
          const { data: page, error: pageError } = await supabase
            .from('pages')
            .select('id, menu_item_id, menu_category_id')
            .eq('id', pageId)
            .maybeSingle();
          
          if (pageError) {
            console.error('Error fetching page:', pageError);
            return;
          }
          
          if (page) {
            if (page.menu_category_id) {
              console.log('Found category directly from page:', page.menu_category_id);
              onCategoryChange(page.menu_category_id);
              return;
            }
            
            if (page.menu_item_id) {
              // Get the category from the menu item
              const { data: relatedMenuItem, error: relatedMenuItemError } = await supabase
                .from('menu_items')
                .select('category_id')
                .eq('id', page.menu_item_id)
                .maybeSingle();
              
              if (!relatedMenuItemError && relatedMenuItem?.category_id) {
                console.log('Found category from related menu item:', relatedMenuItem.category_id);
                onCategoryChange(relatedMenuItem.category_id);
                return;
              }
            }
          }
        } catch (error) {
          console.error('Error resolving category relationship:', error);
          toast({
            title: "Error resolving category",
            description: "Could not determine the parent category for this content",
            variant: "destructive"
          });
        }
      }
    };
    
    fetchParentCategory();
  }, [pageId, selectedCategory, onCategoryChange, isInitialLoad]);

  // Validate the selected subcategory belongs to the current category
  useEffect(() => {
    if (selectedCategory && pageId && subcategories && !isLoadingSubcategories) {
      // Check if the pageId is in the current subcategories list
      const subcategoryExists = subcategories.some(sub => sub.id === pageId);
      
      // If not found and we have subcategories, reset the pageId
      if (!subcategoryExists && subcategories.length > 0) {
        console.log('Selected subcategory does not belong to current category, resetting');
        onPageIdChange(null);
      }
    }
  }, [selectedCategory, pageId, subcategories, isLoadingSubcategories, onPageIdChange]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        {isLoadingCategories ? (
          <div className="flex items-center space-x-2 h-10">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            <span className="text-sm text-gray-500">Loading categories...</span>
          </div>
        ) : (
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={selectedCategory || ''}
            onChange={(e) => {
              const newCategoryId = e.target.value || null;
              console.log('Selected category changed to:', newCategoryId);
              onCategoryChange(newCategoryId);
              onPageIdChange(null);
            }}
          >
            <option value="">Select a category</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedCategory && (
        <div>
          <label className="block text-sm font-medium mb-1">
            Subcategory
            {isLoadingSubcategories && (
              <span className="ml-2 text-xs text-gray-500">Loading...</span>
            )}
          </label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2"
            value={pageId || ''}
            onChange={(e) => {
              const newSubcategoryId = e.target.value || null;
              console.log('Selected subcategory changed to:', newSubcategoryId);
              onPageIdChange(newSubcategoryId);
            }}
            disabled={isLoadingSubcategories}
          >
            <option value="">Select a subcategory</option>
            {subcategories && subcategories.length > 0 ? (
              subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))
            ) : (
              <option value="" disabled>
                {isLoadingSubcategories ? "Loading subcategories..." : "No subcategories found"}
              </option>
            )}
          </select>
          {!isLoadingSubcategories && subcategories && subcategories.length === 0 && (
            <p className="text-sm text-amber-600 mt-1">
              No subcategories found for this category. Please add subcategories in the menu management section.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
