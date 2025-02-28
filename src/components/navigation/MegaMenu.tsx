
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { MenuCategory } from '@/types/navigation';

interface MegaMenuProps {
  category: MenuCategory;
}

export const MegaMenu = ({ category }: MegaMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(64); // Default nav height

  useEffect(() => {
    // Get the height of the parent nav element
    if (navRef.current) {
      const parentNav = navRef.current.closest('nav');
      if (parentNav) {
        setNavHeight(parentNav.offsetHeight);
      }
    }
  }, []);

  return (
    <div 
      className="relative"
      ref={navRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center space-x-2 py-4 px-4 hover:text-orange-500 text-lg">
        <span>{category.name}</span>
        <svg className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24">
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay to capture clicks outside the menu */}
          <div 
            className="fixed inset-0 bg-black/5 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* The mega menu */}
          <div 
            className="absolute left-1/2 transform -translate-x-1/2 bg-white shadow-lg border-t z-50 min-w-[1200px]"
            style={{ top: `${navHeight}px` }}
          >
            <div className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                {category.items?.map((item) => (
                  <Link
                    key={item.id}
                    to={`/${category.slug}/${item.slug}`}
                    className="group/item"
                    onClick={() => setIsOpen(false)}
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
        </>
      )}
    </div>
  );
};
