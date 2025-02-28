
import { Star, Calendar, User, Image, X, ArrowLeft, ArrowRight, Maximize2, Download, Heart, Share, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface GalleryLayoutProps {
  article: ArticleData;
}

export const GalleryLayout = ({ article }: GalleryLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (article.author_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', article.author_id)
          .single();
        
        if (!error && data) {
          setAuthorProfile(data);
        }
      }
    };

    const fetchRelated = async () => {
      // In a real app, we would fetch related content with similar tags
      const { data, error } = await supabase
        .from('content')
        .select('id, title, featured_image, type')
        .eq('status', 'published')
        .neq('id', article.id)
        .limit(8);
        
      if (!error && data) {
        setRelated(data);
      }
    };

    fetchAuthorProfile();
    fetchRelated();
  }, [article.author_id, article.id]);

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (authorProfile?.display_name) {
      return authorProfile.display_name
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase();
    }
    return authorProfile?.email ? authorProfile.email.substring(0, 2).toUpperCase() : 'AU';
  };

  const hasReviewDetails = article.type === "review" && article.review_details?.[0];
  const reviewDetails = hasReviewDetails ? article.review_details![0] : null;
  const galleryImages = reviewDetails?.gallery || [];
  
  // Use featured image as first gallery image if available
  const allImages = article.featured_image 
    ? [article.featured_image, ...galleryImages]
    : galleryImages;

  // Navigation functions for lightbox
  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      
      if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      } else if (e.key === 'Escape') {
        setLightboxOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImages.length]);

  return (
    <article className="max-w-7xl mx-auto px-4 py-8">
      {/* Header with Category & Title */}
      <header className="text-center max-w-3xl mx-auto mb-8">
        <div className="flex justify-center mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
            {article.type === "review" ? "Product Gallery" : "Photo Essay"}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {article.title}
        </h1>
        
        {article.description && (
          <p className="text-lg text-gray-600 mb-6">
            {article.description}
          </p>
        )}
        
        {/* Article Meta Info */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(article.published_at), 'MMMM d, yyyy')}
            </span>
          )}
          
          {article.type === "review" && article.review_details?.[0]?.overall_score && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="h-4 w-4 fill-current" />
              {article.review_details[0].overall_score.toFixed(1)}
            </span>
          )}
          
          {authorProfile && (
            <span className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <span>{authorProfile.display_name || authorProfile.email}</span>
            </span>
          )}
        </div>
      </header>
      
      {/* Featured Gallery Image */}
      {allImages.length > 0 && (
        <div className="mb-12">
          <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
            <DialogTrigger asChild>
              <div className="aspect-[16/9] overflow-hidden rounded-xl relative cursor-pointer group">
                <img
                  src={allImages[0]}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="outline" className="text-white border-white hover:bg-white/20">
                    <Maximize2 className="h-5 w-5 mr-2" />
                    View Gallery
                  </Button>
                </div>
              </div>
            </DialogTrigger>
            
            <DialogContent className="max-w-6xl p-0 bg-black/95 border-none">
              <div className="relative h-[80vh] flex flex-col">
                {/* Close button */}
                <button 
                  onClick={() => setLightboxOpen(false)} 
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/30 rounded-full p-2 z-50"
                >
                  <X className="h-6 w-6" />
                </button>
                
                {/* Image display */}
                <div className="flex-1 flex items-center justify-center p-4">
                  <img
                    src={allImages[currentImageIndex]}
                    alt={`Gallery image ${currentImageIndex + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                  
                  {/* Navigation arrows */}
                  <button 
                    onClick={goToPrevImage}
                    className="absolute left-4 text-white/80 hover:text-white bg-black/30 rounded-full p-2"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                  
                  <button 
                    onClick={goToNextImage}
                    className="absolute right-4 text-white/80 hover:text-white bg-black/30 rounded-full p-2"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </div>
                
                {/* Thumbnails and info */}
                <div className="bg-black/80 p-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-white text-sm">
                      Image {currentImageIndex + 1} of {allImages.length}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-white/80 hover:text-white">
                        <Heart className="h-5 w-5" />
                      </button>
                      <button className="text-white/80 hover:text-white">
                        <Share className="h-5 w-5" />
                      </button>
                      <button className="text-white/80 hover:text-white">
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition
                          ${currentImageIndex === index ? 'border-blue-500' : 'border-transparent'}`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      {/* Masonry Image Gallery */}
      {allImages.length > 1 && (
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allImages.map((image, index) => (
              <div 
                key={index} 
                className={`${
                  // Make some images span 2 columns for visual interest
                  index % 5 === 0 ? 'md:col-span-2' : '' 
                } ${
                  // And some span 2 rows
                  index % 7 === 3 ? 'row-span-2' : ''
                }`}
              >
                <div 
                  className="relative overflow-hidden rounded-lg group cursor-pointer"
                  onClick={() => {
                    setCurrentImageIndex(index);
                    setLightboxOpen(true);
                  }}
                >
                  <div className={`${index % 7 === 3 ? 'aspect-[3/4]' : 'aspect-square'} bg-gray-100`}>
                    <img
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8">
          {/* Interactive Elements */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="gap-2">
                <Heart className="h-4 w-4" />
                <span>45</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>12</span>
              </Button>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Share className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>
          
          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-8">
            <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
          
          {/* Image Data Section for Photography Articles */}
          {article.type !== "review" && (
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Photography Details</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Camera</div>
                  <div className="font-medium">Sony A7 III</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Lens</div>
                  <div className="font-medium">24-70mm f/2.8</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Aperture</div>
                  <div className="font-medium">f/4.0</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-500">Exposure</div>
                  <div className="font-medium">1/125s</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-sm text-gray-500 mr-2">Tags:</span>
            <a href="#" className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition">#photography</a>
            <a href="#" className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition">#travel</a>
            <a href="#" className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition">#nature</a>
          </div>
          
          {/* Author */}
          {authorProfile && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || 'Author'} />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{authorProfile.display_name || authorProfile.email}</h3>
                    <p className="text-sm text-gray-500">
                      {authorProfile.title || "Photographer & Writer"}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto">Follow</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-4">
          {/* For Reviews - Product Info */}
          {article.type === "review" && reviewDetails && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Product Information</h3>
                {reviewDetails.product_specs && (
                  <div className="space-y-2 mb-4">
                    {Object.entries(reviewDetails.product_specs).map(([key, value], index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {reviewDetails.overall_score && (
                  <div className="bg-gray-50 p-4 rounded-lg text-center mb-4">
                    <div className="text-sm text-gray-500 mb-1">Overall Rating</div>
                    <div className="flex items-center justify-center">
                      <Star className="h-5 w-5 text-amber-500 fill-current" />
                      <span className="text-xl font-bold ml-1">{reviewDetails.overall_score.toFixed(1)}</span>
                      <span className="text-gray-500 text-sm ml-1">/10</span>
                    </div>
                  </div>
                )}
                
                <Button className="w-full">View Product</Button>
              </CardContent>
            </Card>
          )}
          
          {/* Related Galleries */}
          {related.length > 0 && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Related Galleries</h3>
                <div className="space-y-4">
                  {related.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                        <img 
                          src={item.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium line-clamp-2 hover:text-blue-600 transition-colors">
                          <Link to={`/${item.id}`}>{item.title}</Link>
                        </h4>
                        <span className="text-xs text-gray-500">
                          {item.type === "review" ? "Product Review" : "Gallery"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Newsletter */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Subscribe</h3>
              <p className="text-sm text-gray-600 mb-4">Get notified about new galleries and photography tips.</p>
              
              <div className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-3 py-2 border rounded-md text-sm"
                />
                <Button className="w-full">Subscribe</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Full Width Gallery Call to Action */}
      <div className="mt-12 bg-gray-900 text-white p-8 rounded-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          {allImages[0] && (
            <img
              src={allImages[0]}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-blue-900 mix-blend-multiply"></div>
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Explore More Visual Stories</h2>
          <p className="text-white/80 mb-6">
            Discover our collection of stunning photography and immersive visual narratives
          </p>
          <Button className="bg-white text-gray-900 hover:bg-gray-100">Browse Our Galleries</Button>
        </div>
      </div>
    </article>
  );
};
