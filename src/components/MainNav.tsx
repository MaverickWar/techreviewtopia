
import { Link } from 'react-router-dom';
import { Laptop, Smartphone, Gamepad, Brain, Menu } from 'lucide-react';

export const MainNav = () => {
  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="content-container">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tech365
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/smartphones" className="nav-link">Smartphones</Link>
            <Link to="/laptops" className="nav-link">Laptops</Link>
            <Link to="/gaming" className="nav-link">Gaming</Link>
            <Link to="/ai" className="nav-link">AI & Software</Link>
            <Link to="/reviews" className="nav-link">Reviews</Link>
            <Link to="/deals" className="nav-link">Deals</Link>
          </div>

          <button className="md:hidden p-2">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
};
