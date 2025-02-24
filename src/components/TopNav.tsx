
import { Search, Bell, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TopNav = () => {
  return (
    <div className="bg-slate-900 text-white py-2">
      <div className="content-container">
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 text-sm">
            <Link to="/breaking" className="hover:text-orange-400">Breaking News</Link>
            <Link to="/newsletter" className="hover:text-orange-400">Newsletter</Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:text-orange-400">
              <Search size={18} />
            </button>
            <button className="p-2 hover:text-orange-400">
              <Bell size={18} />
            </button>
            <button className="p-2 hover:text-orange-400">
              <User size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
