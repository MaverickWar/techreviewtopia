
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { MenuCategory } from '@/types/navigation';

interface MegaMenuProps {
  category: MenuCategory;
  isActive: boolean;
  onMouseEnter: () => void;
}

export const MegaMenu = ({ category, isActive, onMouseEnter }: MegaMenuProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div 
      className="relative"
      onMouseEnter={onMouseEnter}
    >
      <button 
        ref={buttonRef}
        className="flex items-center space-x-2 py-4 px-4 hover:text-orange-500 text-lg transition-colors duration-200"
      >
        <span>{category.name}</span>
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} 
          viewBox="0 0 24 24"
        >
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {category.items && category.items.length > 0 && (
        <div 
          className={`absolute left-0 right-0 bg-white shadow-lg border-t z-50 transform transition-opacity duration-200 ${
            isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{ top: '100%' }}
        >
          <div className="p-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {category.items.map((item) => (
                <Link
                  key={item.id}
                  to={`/${category.slug}/${item.slug}`}
                  className="group/item"
                >
                  {item.image_url ? (
                    <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-lg">{item.name}</span>
                    </div>
                  )}
                  <h3 className="font-medium text-xl group-hover/item:text-orange-500 transition-colors">
                    {item.name}
                  </h3>
                  {item.description && (
                    <p className="text-base text-gray-600 mt-2">{item.description}</p>
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
