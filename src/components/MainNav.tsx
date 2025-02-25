
import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useNavigation } from '@/hooks/useNavigation';
import { MegaMenu } from './navigation/MegaMenu';

export const MainNav = () => {
  const { data: categories, isLoading } = useNavigation();

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent py-4">
            Tech365
          </Link>
          
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

          <button className="md:hidden p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
