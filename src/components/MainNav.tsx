
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { MegaMenu } from './navigation/MegaMenu';
import { MobileNav } from './navigation/MobileNav';
import { MegaMenuCarousel } from './navigation/MegaMenuCarousel';

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

  // Handle menu toggle for mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav 
      className="bg-white border-b sticky top-0 z-40"
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
          <div className="hidden md:flex items-center" ref={menuContainerRef}>
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
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Global Mega Menu Container */}
      {activeMegaMenu && !isLoading && categories && (
        <div className="absolute left-0 w-full bg-white shadow-lg border-t z-50 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4">
            <div className="py-8">
              {categories
                .find(category => category.id === activeMegaMenu)
                ?.items && (
                  <MegaMenuCarousel 
                    items={categories.find(category => category.id === activeMegaMenu)?.items || []}
                    categorySlug={categories.find(c => c.id === activeMegaMenu)?.slug || ''}
                    onItemClick={() => setActiveMegaMenu(null)}
                  />
                )
              }
            </div>
          </div>
          
          {/* Overlay for mouse events outside the mega menu */}
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
