
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
          <div className="hidden md:flex items-center relative">
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

            {/* Shared mega menu background overlay */}
            {activeMegaMenu && (
              <div 
                className="fixed inset-0 bg-black/5 z-40"
                onClick={() => setActiveMegaMenu(null)}
                style={{ top: navRef.current ? navRef.current.offsetHeight : '64px' }}
              />
            )}
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
