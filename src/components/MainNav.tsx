
import { useState, useEffect, useRef, memo } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { MegaMenu } from './navigation/MegaMenu';
import { MobileNav } from './navigation/MobileNav';
import { MegaMenuCarousel } from './navigation/MegaMenuCarousel';
import { MenuCategory } from '@/types/navigation';

// Memoize individual category menu items to prevent unnecessary rerenders
const CategoryMenuItem = memo(({ 
  category, 
  isActive, 
  setActiveMegaMenu 
}: { 
  category: MenuCategory; 
  isActive: boolean; 
  setActiveMegaMenu: (id: string | null) => void;
}) => {
  if (category.type === 'megamenu') {
    return (
      <MegaMenu 
        key={category.id} 
        category={category} 
        isActive={isActive}
        onMouseEnter={() => setActiveMegaMenu(category.id)}
      />
    );
  }
  
  return (
    <Link
      key={category.id}
      to={`/${category.slug}`}
      className="py-4 px-4 hover:text-orange-500 transition-colors duration-200"
      onMouseEnter={() => setActiveMegaMenu(null)}
    >
      {category.name}
    </Link>
  );
});

// For TypeScript strict mode
CategoryMenuItem.displayName = 'CategoryMenuItem';

// Memoize the mega menu content to prevent unnecessary rerenders
const MegaMenuContent = memo(({
  activeMegaMenu,
  categories,
  onItemClick
}: {
  activeMegaMenu: string | null;
  categories: MenuCategory[];
  onItemClick: () => void;
}) => {
  const activeCategory = categories.find(category => category.id === activeMegaMenu);
  const items = activeCategory?.items || [];
  const categorySlug = activeCategory?.slug || '';
  
  if (!activeCategory || !items.length) return null;
  
  return (
    <MegaMenuCarousel 
      items={items}
      categorySlug={categorySlug}
      onItemClick={onItemClick}
    />
  );
});

// For TypeScript strict mode
MegaMenuContent.displayName = 'MegaMenuContent';

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

  // Early return for loading state to prevent layout shifts
  if (isLoading) {
    return (
      <nav className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-4"
            >
              Tech365
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
            <button className="md:hidden p-2 rounded-full">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>
    );
  }

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
            {categories?.map((category) => (
              <CategoryMenuItem
                key={category.id}
                category={category}
                isActive={activeMegaMenu === category.id}
                setActiveMegaMenu={setActiveMegaMenu}
              />
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

      {/* Global Mega Menu Container - Only render when active */}
      {activeMegaMenu && categories && (
        <div className="absolute left-0 w-full bg-white shadow-lg border-t z-50 animate-fade-in">
          <div className="max-w-7xl mx-auto px-4">
            <div className="py-8">
              <MegaMenuContent 
                activeMegaMenu={activeMegaMenu}
                categories={categories}
                onItemClick={() => setActiveMegaMenu(null)}
              />
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

      {/* Enhanced Mobile Navigation - Only render when mobile menu is open */}
      {isMobileMenuOpen && categories && (
        <MobileNav 
          categories={categories}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
};
