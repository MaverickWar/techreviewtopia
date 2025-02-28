
import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { MenuCategory, MenuItem } from '@/types/navigation';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MegaMenuCarouselProps {
  items: MenuItem[];
  categorySlug: string;
  onItemClick: () => void;
}

export const MegaMenuCarousel = ({ items, categorySlug, onItemClick }: MegaMenuCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false, 
    dragFree: true,
    containScroll: 'trimSnaps'
  });
  
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  // Initialize the carousel
  useEffect(() => {
    if (emblaApi) {
      // Calculate total pages
      const count = emblaApi.slideNodes().length;
      const itemsPerPage = 8; // 2 rows × 4 columns
      const pages = Math.ceil(count / itemsPerPage);
      setTotalPages(pages);

      // Set up change listener
      const onSelect = () => {
        setCurrentPage(emblaApi.selectedScrollSnap());
        // Hide swipe hint after user has swiped
        setShowSwipeHint(false);
      };

      emblaApi.on('select', onSelect);
      
      // Initial state
      setCurrentPage(emblaApi.selectedScrollSnap());

      // Auto-hide swipe hint after 5 seconds
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 5000);

      return () => {
        emblaApi.off('select', onSelect);
        clearTimeout(timer);
      };
    }
  }, [emblaApi, items]);

  // Scroll to page handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
    setShowSwipeHint(false);
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
    setShowSwipeHint(false);
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
    setShowSwipeHint(false);
  }, [emblaApi]);

  // Create chunks of 8 items (2 rows of 4)
  const itemsPerPage = 8;
  const itemChunks = Array.from({ length: Math.ceil(items.length / itemsPerPage) }, (_, i) =>
    items.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );

  const showPagination = items.length > itemsPerPage;
  const hasMoreContent = showPagination && currentPage < totalPages - 1;

  return (
    <div className="relative w-full">
      {/* Gradient fade on right edge when more content is available */}
      {hasMoreContent && (
        <div className="absolute top-0 right-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      )}
      
      {/* Gradient fade on left edge when not on first page */}
      {currentPage > 0 && (
        <div className="absolute top-0 left-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      )}

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {itemChunks.map((chunk, pageIndex) => (
            <div key={pageIndex} className="flex-[0_0_100%] min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                {chunk.map((item) => (
                  <Link
                    key={item.id}
                    to={`/${categorySlug}/${item.slug}`}
                    className="group/item"
                    onClick={onItemClick}
                  >
                    {item.image_url ? (
                      <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-lg">{item.name}</span>
                      </div>
                    )}
                    <h3 className="font-medium text-xl group-hover/item:text-orange-500 transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-base text-gray-600 mt-2">{item.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Swipe Hint Overlay - only shows on first load and when there's more content */}
      {showPagination && showSwipeHint && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center z-20 pointer-events-none">
          <div className="bg-white/80 shadow-lg rounded-full px-5 py-3 flex items-center gap-3 animate-pulse">
            <ChevronLeft className="text-orange-500" />
            <span className="text-gray-700 font-medium">Swipe to see more content</span>
            <ChevronRight className="text-orange-500" />
          </div>
        </div>
      )}

      {/* Pagination Controls - Only show if we have more than one page */}
      {showPagination && (
        <>
          {/* Next/Prev buttons - Made more visible */}
          <button 
            className={`absolute top-1/2 -left-4 -translate-y-1/2 rounded-full p-2 bg-white shadow-md text-gray-700 hover:text-orange-500 transition-all z-20 ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`}
            onClick={scrollPrev}
            aria-label="Previous page"
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button 
            className={`absolute top-1/2 -right-4 -translate-y-1/2 rounded-full p-2 bg-white shadow-md text-gray-700 hover:text-orange-500 transition-all z-20 ${currentPage === totalPages - 1 ? 'opacity-0' : 'opacity-100'}`}
            onClick={scrollNext}
            aria-label="Next page"
            disabled={currentPage === totalPages - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Enhanced Dot indicators with page info */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center mt-5 space-y-2">
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentPage 
                        ? 'bg-orange-500 scale-110' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to page ${index + 1}`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
          )}

          {/* Page count indicator - More visible swipe hint */}
          {hasMoreContent && (
            <div className="absolute bottom-4 right-4 bg-orange-100 text-orange-600 rounded-full px-3 py-1 text-sm font-medium shadow-sm animate-bounce">
              {items.length - ((currentPage + 1) * itemsPerPage)} more items →
            </div>
          )}
        </>
      )}
    </div>
  );
};
