
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { MegaMenu } from './navigation/MegaMenu';
import { MobileNav } from './navigation/MobileNav';

export const MainNav = () => {
  const { data: categories, isLoading } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Handle mouse leave for the entire nav
  const handleNavMouseLeave = () => {
    setActiveMegaMenu(null);
  };

  return (
    <nav 
      className="bg-white border-b sticky top-0 z-50"
      onMouseLeave={handleNavMouseLeave}
      ref={navRef}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-4"
          >
            Tech365
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center relative" ref={menuContainerRef}>
            {!isLoading && categories?.map((category) => (
              category.type === 'megamenu' ? (
                <MegaMenu 
                  key={category.id} 
                  category={category} 
                  isActive={activeMegaMenu === category.id}
                  onMouseEnter={() => setActiveMegaMenu(category.id)}
                />
              ) : (
                <Link
                  key={category.id}
                  to={`/${category.slug}`}
                  className="py-4 px-4 hover:text-orange-500 transition-colors duration-200"
                  onMouseEnter={() => setActiveMegaMenu(null)}
                >
                  {category.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Fixed position mega menu container */}
      {activeMegaMenu && !isLoading && categories && (
        <div 
          className="absolute left-0 w-full bg-white shadow-lg border-t z-50"
          style={{ top: navRef.current?.offsetHeight + 'px' }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex">
              {/* Empty space to align with logo */}
              <div className="flex-shrink-0" style={{ width: menuContainerRef.current?.offsetLeft + 'px' }}></div>
              
              {/* Mega menu content aligned with menu items */}
              <div className="flex-grow overflow-hidden transition-all duration-300 ease-in-out">
                {categories
                  .filter(category => category.id === activeMegaMenu)
                  .map(category => (
                    <div key={category.id} className="py-6 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {category.items?.map((item) => (
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
                  ))
                }
              </div>
            </div>
          </div>
          
          {/* Overlay for closing the mega menu */}
          <div 
            className="fixed inset-0 bg-black/5 -z-10"
            onClick={() => setActiveMegaMenu(null)}
            style={{ top: navRef.current?.offsetHeight + 'px' }}
          />
        </div>
      )}

      {/* Enhanced Mobile Navigation */}
      {isMobileMenuOpen && !isLoading && categories && (
        <MobileNav 
          categories={categories}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};
