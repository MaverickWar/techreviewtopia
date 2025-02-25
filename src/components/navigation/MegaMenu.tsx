
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { MenuCategory } from '@/types/navigation';

interface MegaMenuProps {
  category: MenuCategory;
}

export const MegaMenu = ({ category }: MegaMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center space-x-1 py-4 px-4 hover:text-orange-500">
        <span>{category.name}</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 w-screen bg-white shadow-lg border-t z-50">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {category.items?.map((item) => (
                <Link
                  key={item.id}
                  to={`/${category.slug}/${item.slug}`}
                  className="group/item"
                  onClick={() => setIsOpen(false)}
                >
                  {item.imageUrl ? (
                    <div className="aspect-video mb-3 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400">{item.name}</span>
                    </div>
                  )}
                  <h3 className="font-medium group-hover/item:text-orange-500 transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
