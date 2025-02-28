
import React, { useState } from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, ChevronLeft, ChevronRight, Image, ThumbsUp, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface GalleryLayoutProps {
  article: ArticleData;
}

export const GalleryLayout: React.FC<GalleryLayoutProps> = ({ article }) => {
  // Get gallery images from review details or use featured image
  const hasReviewDetails = article.type === "review" && article.review_details?.[0];
  const reviewDetails = hasReviewDetails ? article.review_details![0] : null;
  const galleryImages = hasReviewDetails ? 
    [...(reviewDetails.gallery || []), article.featured_image].filter(Boolean) : 
    article.featured_image ? [article.featured_image] : [];
  
  // State for lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Lightbox navigation
  const goToNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };
  
  const goToPrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };
  
  const openLightbox = (index: number) => {
    setActiveImageIndex(index);
    setLightboxOpen(true);
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  
  // Handle keyboard navigation for lightbox
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'ArrowRight') goToNextImage();
      if (e.key === 'ArrowLeft') goToPrevImage();
      if (e.key === 'Escape') closeLightbox();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen]);
  
  return (
    <article className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          {article.title}
        </h1>
        
        {article.description && (
          <div className="text-lg text-gray-600 mb-6">
            <div dangerouslySetInnerHTML={{ __html: article.description }} />
          </div>
        )}
        
        {/* Article Meta Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          {article.published_at && (
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
            </span>
          )}
          
          {article.author && (
            <span className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage src={article.author.avatar_url || ""} />
                <AvatarFallback>{article.author.display_name?.substring(0, 2) || <User className="h-4 w-4" />}</AvatarFallback>
              </Avatar>
              <span>{article.author.display_name || "Anonymous"}</span>
            </span>
          )}
          
          <Badge variant="outline" className="bg-gray-100 hover:bg-gray-200">
            Photo Gallery
          </Badge>
        </div>
      </header>
      
      {/* Featured Image - Larger size */}
      {article.featured_image && (
        <div className="mb-12 text-center">
          <div 
            className="relative aspect-[16/9] overflow-hidden rounded-lg cursor-pointer"
            onClick={() => openLightbox(0)}
          >
            <img 
              src={article.featured_image} 
              alt={article.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Badge className="bg-black bg-opacity-50 text-white border-0">
                <Image className="h-4 w-4 mr-1" />
                View Full Size
              </Badge>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2 italic">
            Featured image: {article.title}
          </p>
        </div>
      )}
      
      {/* Main Content */}
      <div className="mb-12 max-w-4xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
        </div>
      </div>
      
      {/* Gallery Grid */}
      {galleryImages.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Gallery</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ThumbsUp className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Call to Action */}
      <div className="bg-gray-100 p-8 rounded-lg text-center mb-12 max-w-4xl mx-auto">
        <h3 className="text-xl font-bold mb-2">Enjoyed the gallery?</h3>
        <p className="text-gray-600 mb-4">
          Subscribe to our newsletter for more stunning photography and exclusive content.
        </p>
        <div className="flex max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="flex-1 px-4 py-2 rounded-l-lg border-y border-l border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button className="rounded-l-none">Subscribe</Button>
        </div>
      </div>
      
      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </button>
          
          <button 
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
            onClick={goToPrevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          
          <button 
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70"
            onClick={goToNextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </button>
          
          <div className="max-w-5xl max-h-[80vh]">
            <img 
              src={galleryImages[activeImageIndex]} 
              alt={`Gallery image ${activeImageIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
          </div>
          
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <p className="text-sm">
              Image {activeImageIndex + 1} of {galleryImages.length}
            </p>
          </div>
        </div>
      )}
      
      {/* Back to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </article>
  );
};
