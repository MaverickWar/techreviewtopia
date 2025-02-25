
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { MegaMenu } from './navigation/MegaMenu';

export const MainNav = () => {
  const { data: categories, isLoading } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-4">
            Tech365
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            {!isLoading && categories?.map((category) => (
              category.type === 'megamenu' ? (
                <MegaMenu key={category.id} category={category} />
              ) : (
                <Link
                  key={category.id}
                  to={`/${category.slug}`}
                  className="py-4 px-4 hover:text-orange-500"
                >
                  {category.name}
                </Link>
              )
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="py-2">
              {!isLoading && categories?.map((category) => (
                <div key={category.id} className="block">
                  {category.type === 'megamenu' ? (
                    <div className="px-4 py-2">
                      <div className="font-medium text-lg mb-2">{category.name}</div>
                      <div className="space-y-2 pl-4">
                        {category.items?.map((item) => (
                          <Link
                            key={item.id}
                            to={`/${category.slug}/${item.slug}`}
                            className="block py-2 hover:text-orange-500"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={`/${category.slug}`}
                      className="block px-4 py-2 hover:text-orange-500"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
