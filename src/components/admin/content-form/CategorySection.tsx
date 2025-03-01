
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  
  // Get categories query
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories');
      const { data, error } = await supabase
        .from('menu_categories')
        .select('id, name')
        .order('order_index');
      
      if (error) throw error;
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
      
      if (error) throw error;
      console.log('Subcategories loaded:', data);
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
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
            onChange={(e) => onPageIdChange(e.target.value || null)}
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
