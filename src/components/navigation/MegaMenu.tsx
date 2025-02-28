
import { useRef } from 'react';
import type { MenuCategory } from '@/types/navigation';

interface MegaMenuProps {
  category: MenuCategory;
  isActive: boolean;
  onMouseEnter: () => void;
}

export const MegaMenu = ({ category, isActive, onMouseEnter }: MegaMenuProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div 
      className="relative"
      onMouseEnter={onMouseEnter}
    >
      <button 
        ref={buttonRef}
        className={`flex items-center space-x-2 py-4 px-4 text-lg transition-colors duration-200 ${isActive ? 'text-orange-500' : 'hover:text-orange-500'}`}
      >
        <span>{category.name}</span>
        <svg 
          className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'rotate-180' : ''}`} 
          viewBox="0 0 24 24"
        >
          <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </div>
  );
};
