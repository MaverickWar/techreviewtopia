
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import type { MenuCategory, MenuItem } from '@/types/navigation';

interface MobileNavProps {
  categories: MenuCategory[];
  onClose: () => void;
}

interface SubcategoryViewProps {
  category: MenuCategory;
  onBack: () => void;
  onClose: () => void;
}

const SubcategoryView = ({ category, onBack, onClose }: SubcategoryViewProps) => (
  <div className="animate-slide-in-right h-full">
    <div className="sticky top-0 bg-white z-10 border-b">
      <button 
        onClick={onBack}
        className="flex items-center space-x-2 p-4 text-gray-600 hover:text-orange-500"
      >
        <ArrowLeft size={20} />
        <span>Back to Menu</span>
      </button>
      <h2 className="px-4 pb-4 text-xl font-semibold">{category.name}</h2>
    </div>
    <div className="grid grid-cols-2 gap-4 p-4">
      {category.items?.map((item) => (
        <Link
          key={item.id}
          to={`/${category.slug}/${item.slug}`}
          onClick={onClose}
          className="group block"
        >
          <div className="aspect-video mb-2 overflow-hidden rounded-lg bg-gray-100">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                {item.name}
              </div>
            )}
          </div>
          <h3 className="font-medium group-hover:text-orange-500 transition-colors">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
          )}
        </Link>
      ))}
    </div>
  </div>
);

export const MobileNav = ({ categories, onClose }: MobileNavProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {selectedCategory ? (
        <SubcategoryView 
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          onClose={onClose}
        />
      ) : (
        <div className="animate-fade-in">
          <div className="sticky top-0 bg-white z-10 border-b">
            <h2 className="p-4 text-xl font-semibold">Menu</h2>
          </div>
          <div className="divide-y">
            {categories.map((category) => (
              <div key={category.id}>
                {category.type === 'megamenu' ? (
                  <button
                    onClick={() => setSelectedCategory(category)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <h3 className="text-lg font-medium">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {category.items?.length} items
                      </p>
                    </div>
                    <ChevronRight 
                      size={20}
                      className="text-gray-400"
                    />
                  </button>
                ) : (
                  <Link
                    to={`/${category.slug}`}
                    onClick={onClose}
                    className="block p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-medium">{category.name}</h3>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
