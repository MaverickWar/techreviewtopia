
import { Star, Calendar, User, Image } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GalleryLayoutProps {
  article: ArticleData;
}

export const GalleryLayout = ({ article }: GalleryLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);

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

    fetchAuthorProfile();
  }, [article.author_id]);

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

  return (
    <article className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        
        {article.description && (
          <p className="text-xl text-gray-600 mb-6">
            {article.description}
          </p>
        )}
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          {article.type === "review" && article.review_details?.[0]?.overall_score && (
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Star className="h-5 w-5 fill-current" />
              {article.review_details[0].overall_score.toFixed(1)}
            </span>
          )}
          {article.published_at && (
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(article.published_at), 'MMMM d, yyyy')}
            </span>
          )}
          {authorProfile ? (
            <span className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <span>{authorProfile.display_name || authorProfile.email}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              Author
            </span>
          )}
        </div>
      </header>
      
      {/* Hero Gallery */}
      {allImages.length > 0 && (
        <div className="mb-12">
          {allImages.length === 1 ? (
            <div className="aspect-[2/1] overflow-hidden rounded-xl">
              <img
                src={allImages[0]}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Featured Image */}
              <div className="md:col-span-2 aspect-[2/1] overflow-hidden rounded-xl">
                <img
                  src={allImages[0]}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Gallery Grid */}
              {allImages.slice(1, 5).map((image, index) => (
                <div key={index} className="aspect-square overflow-hidden rounded-xl">
                  <img
                    src={image}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              
              {/* Show more images indicator */}
              {allImages.length > 5 && (
                <div className="aspect-square overflow-hidden rounded-xl relative">
                  <img
                    src={allImages[5]}
                    alt={`Gallery image 5`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Image className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-xl font-medium">+{allImages.length - 5} more</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
        </div>
      </div>
      
      {/* Full Gallery */}
      {allImages.length > 1 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Full Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, index) => (
              <div key={index} className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};
