
import React, { useCallback, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { MenuCategory, MenuItem } from '@/types/navigation';
import { Link } from 'react-router-dom';

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
      };

      emblaApi.on('select', onSelect);
      
      // Initial state
      setCurrentPage(emblaApi.selectedScrollSnap());

      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi, items]);

  // Scroll to page handlers
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Create chunks of 8 items (2 rows of 4)
  const itemsPerPage = 8;
  const itemChunks = Array.from({ length: Math.ceil(items.length / itemsPerPage) }, (_, i) =>
    items.slice(i * itemsPerPage, (i + 1) * itemsPerPage)
  );

  const showPagination = items.length > itemsPerPage;

  return (
    <div className="relative w-full">
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

      {/* Pagination Controls - Only show if we have more than one page */}
      {showPagination && (
        <>
          {/* Next/Prev buttons */}
          <button 
            className={`absolute top-1/2 -left-4 -translate-y-1/2 rounded-full p-2 bg-white shadow-md text-gray-700 hover:text-orange-500 transition-all z-10 ${currentPage === 0 ? 'opacity-0' : 'opacity-100'}`}
            onClick={scrollPrev}
            aria-label="Previous page"
            disabled={currentPage === 0}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            className={`absolute top-1/2 -right-4 -translate-y-1/2 rounded-full p-2 bg-white shadow-md text-gray-700 hover:text-orange-500 transition-all z-10 ${currentPage === totalPages - 1 ? 'opacity-0' : 'opacity-100'}`}
            onClick={scrollNext}
            aria-label="Next page"
            disabled={currentPage === totalPages - 1}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dot indicators */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-5 space-x-2">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollTo(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentPage 
                      ? 'bg-orange-500 scale-110' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to page ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Swipe hint indicator (only shows briefly) */}
          <div className="absolute bottom-0 right-0 left-0 flex justify-center items-center pointer-events-none">
            <div className="animate-bounce opacity-60 text-xs font-medium text-gray-500 bg-white/80 rounded-full px-3 py-1 shadow-sm">
              Swipe to see more
            </div>
          </div>
        </>
      )}
    </div>
  );
};
