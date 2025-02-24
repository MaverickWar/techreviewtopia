import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, ArrowUp } from 'lucide-react';
export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  return <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="content-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4">About Tech365</h3>
            <p className="text-gray-400">Your trusted source for technology reviews, news, and insights. Staying ahead of the curve, one review at a time.</p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/smartphones" className="text-gray-400 hover:text-white">Smartphones</Link></li>
              <li><Link to="/laptops" className="text-gray-400 hover:text-white">Laptops</Link></li>
              <li><Link to="/gaming" className="text-gray-400 hover:text-white">Gaming</Link></li>
              <li><Link to="/ai" className="text-gray-400 hover:text-white">AI & Software</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Popular Reviews</h3>
            <ul className="space-y-2">
              <li><Link to="/reviews/iphone-15-pro" className="text-gray-400 hover:text-white">iPhone 15 Pro</Link></li>
              <li><Link to="/reviews/macbook-m3" className="text-gray-400 hover:text-white">MacBook Pro M3</Link></li>
              <li><Link to="/reviews/ps5-pro" className="text-gray-400 hover:text-white">PS5 Pro</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
            <p className="text-gray-400 mb-4">Get the latest tech news and reviews in your inbox.</p>
            <input type="email" placeholder="Enter your email" className="w-full p-2 rounded bg-slate-800 border border-slate-700 mb-2" />
            <button className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">© 2024 Tech365. All rights reserved. Designed by Richard Giles

          </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white"><Youtube size={20} /></a>
            </div>
          </div>
        </div>

        <button onClick={scrollToTop} className="fixed bottom-8 right-8 bg-orange-500 p-3 rounded-full hover:bg-orange-600 transition-colors">
          <ArrowUp size={20} />
        </button>
      </div>
    </footer>;
};