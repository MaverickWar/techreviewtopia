
import { useState } from 'react';
import { type MenuCategory } from '@/types/navigation';
import { ChevronDown } from 'lucide-react';

interface MegaMenuProps {
  category: MenuCategory;
  isActive: boolean;
  onMouseEnter: () => void;
}

export const MegaMenu = ({ category, isActive, onMouseEnter }: MegaMenuProps) => {
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Set loaded state after first render
  useState(() => {
    setHasLoaded(true);
  });

  return (
    <button
      onMouseEnter={onMouseEnter}
      className={`
        py-4 px-4 flex items-center gap-1 transition-colors
        ${isActive ? 'text-orange-500' : 'hover:text-orange-500'}
      `}
      aria-expanded={isActive}
    >
      <span>{category.name}</span>
      <ChevronDown 
        className={`h-4 w-4 transition-transform duration-300 ${isActive ? 'rotate-180' : ''}`} 
      />
    </button>
  );
};
