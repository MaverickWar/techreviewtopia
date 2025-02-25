
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft, Layers } from 'lucide-react';
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

// Helper function to get category image based on slug
const getCategoryImage = (slug: string): string => {
  const images: Record<string, string> = {
    technology: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
    console: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e',
    'ai-software': 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
    'outdoor-gadgets': 'https://images.unsplash.com/photo-1487887235947-a955ef187fcc'
  };
  return images[slug] || images.technology;
};

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
            {item.image_url ? (
              <img
                src={item.image_url}
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
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300); // Match the animation duration
  };

  const handleCategorySelect = (category: MenuCategory) => {
    setSelectedCategory(category);
  };

  return (
    <div className={`fixed inset-0 bg-white z-50 overflow-auto transition-opacity duration-300 ${isExiting ? 'opacity-0' : 'opacity-100'}`}>
      {selectedCategory ? (
        <SubcategoryView 
          category={selectedCategory}
          onBack={() => setSelectedCategory(null)}
          onClose={handleClose}
        />
      ) : (
        <div className="animate-fade-in">
          <div className="sticky top-0 bg-white z-10 border-b">
            <h2 className="p-4 text-xl font-semibold">Menu</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
            {categories.map((category) => (
              <div 
                key={category.id}
                className="glass-panel hover-card overflow-hidden"
              >
                {category.type === 'megamenu' ? (
                  <button
                    onClick={() => handleCategorySelect(category)}
                    className="w-full h-full"
                  >
                    <div className="relative">
                      <div className="aspect-[16/9] overflow-hidden">
                        <img
                          src={getCategoryImage(category.slug)}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white">
                            {category.name}
                          </h3>
                          <ChevronRight size={20} className="text-white" />
                        </div>
                        <p className="text-sm text-white/80 mt-1 flex items-center gap-1">
                          <Layers size={16} />
                          {category.items?.length} items
                        </p>
                      </div>
                    </div>
                  </button>
                ) : (
                  <Link
                    to={`/${category.slug}`}
                    onClick={handleClose}
                    className="block relative group"
                  >
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={getCategoryImage(category.slug)}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 transition-opacity duration-300 group-hover:from-black/70" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-xl font-semibold text-white">
                        {category.name}
                      </h3>
                    </div>
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
