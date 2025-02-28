
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
    dragFree: false, // Set to false for smoother snapping
    containScroll: 'trimSnaps',
    align: 'start',
    skipSnaps: false,
    inViewThreshold: 0.7,
  });
  
  const [currentPage, setCurrentPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);

  // Get placeholder images based on category slug
  const getPlaceholderImage = (slug: string, index: number) => {
    // Map of category to placeholder image URLs
    const categoryImages: Record<string, string[]> = {
      'tech': [
        'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7',
        'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
        'https://images.unsplash.com/photo-1563770660941-10a28b5e9739'
      ],
      'gadgets': [
        'https://images.unsplash.com/photo-1543512214-318c7553f230',
        'https://images.unsplash.com/photo-1507646227500-4d389b0012be',
        'https://images.unsplash.com/photo-1546054454-aa26e2b734c7',
        'https://images.unsplash.com/photo-1516131206008-dd041a9764fd'
      ],
      'software': [
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
        'https://images.unsplash.com/photo-1550434190-5b4f827165af',
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c'
      ],
      'services': [
        'https://images.unsplash.com/photo-1551434678-e076c223a692',
        'https://images.unsplash.com/photo-1600880292203-757bb62b4baf',
        'https://images.unsplash.com/photo-1591696205602-2f950c417cb9',
        'https://images.unsplash.com/photo-1600880292089-90a7e086ee0c'
      ],
      'gaming': [
        'https://images.unsplash.com/photo-1552820728-8b83bb6b773f',
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f',
        'https://images.unsplash.com/photo-1586182987320-4f17e36a0cbc',
        'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf'
      ],
      'phones': [
        'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505',
        'https://images.unsplash.com/photo-1556656793-08538906a9f8',
        'https://images.unsplash.com/photo-1585060544812-6b45742d762f'
      ],
      'appliances': [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7',
        'https://images.unsplash.com/photo-1583241800698-e8ab01832a19',
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f'
      ],
      'audio': [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b',
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1'
      ]
    };

    // Default placeholder images
    const defaultImages = [
      'https://images.unsplash.com/photo-1496307653780-42ee777d4833',
      'https://images.unsplash.com/photo-1439337153520-7082a56a81f4',
      'https://images.unsplash.com/photo-1551038247-3d9af20df552',
      'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9'
    ];

    const images = categoryImages[categorySlug] || defaultImages;
    return images[index % images.length] + '?w=600&h=340&auto=format&fit=crop';
  };

  // Initialize the carousel
  useEffect(() => {
    if (emblaApi) {
      // Calculate total pages - always showing 2 rows of 4 items (8 items per page)
      const itemsPerPage = 8; // 2 rows × 4 columns
      const pages = Math.ceil(items.length / itemsPerPage);
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {chunk.map((item, itemIndex) => (
                  <Link
                    key={item.id}
                    to={`/${categorySlug}/${item.slug}`}
                    className="group/item hover:bg-gray-50 rounded-lg p-3 transition-all duration-200 hover:shadow-md"
                    onClick={onItemClick}
                  >
                    <div className="aspect-video mb-4 overflow-hidden rounded-lg bg-gray-100 relative">
                      <img
                        src={item.image_url || getPlaceholderImage(categorySlug, (pageIndex * itemsPerPage) + itemIndex)}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover/item:scale-105"
                      />
                      <div className="absolute inset-0 bg-black opacity-0 group-hover/item:opacity-10 transition-opacity duration-300"></div>
                    </div>
                    <h3 className="font-medium text-xl group-hover/item:text-orange-500 transition-colors">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-base text-gray-600 mt-2 line-clamp-2 group-hover/item:text-gray-800 transition-colors">
                        {item.description}
                      </p>
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

          {/* Dot indicators with page info */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-5 space-x-2">
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
          )}

          {/* Page count indicator */}
          {hasMoreContent && (
            <div className="absolute bottom-0 right-0 bg-orange-100 text-orange-600 rounded-full px-3 py-1 text-sm font-medium shadow-sm">
              {items.length - ((currentPage + 1) * itemsPerPage)} more items →
            </div>
          )}
        </>
      )}
    </div>
  );
};
