
import React, { useMemo } from "react";
import { ArticleData } from "@/types/content";
import { AwardBanner } from "./AwardBanner";
import { formatDistanceToNow } from "date-fns";
import { Star, StarHalf, User, Clock, Bookmark, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReviewLayoutProps {
  article: ArticleData;
}

export const ReviewLayout: React.FC<ReviewLayoutProps> = ({ article }) => {
  // Get review details if available
  const reviewDetails = article.review_details?.[0];
  const ratingCriteria = article.rating_criteria || [];
  
  // Extract award from layout settings
  // Check for both awardLevel (new) and award (legacy)
  const awardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;
  
  console.log("ReviewLayout - award level:", awardLevel);
  console.log("ReviewLayout - show awards:", showAwards);
  console.log("ReviewLayout - YouTube URL:", reviewDetails?.youtube_url);

  // Calculate the overall score based on individual criteria
  const calculatedOverallScore = useMemo(() => {
    if (ratingCriteria.length === 0) return 0;
    
    const sum = ratingCriteria.reduce((total, criterion) => total + (criterion.score || 0), 0);
    return parseFloat((sum / ratingCriteria.length).toFixed(1));
  }, [ratingCriteria]);

  // Use the calculated score or fallback to the stored one if no criteria exist
  const overallScore = ratingCriteria.length > 0 
    ? calculatedOverallScore 
    : (reviewDetails?.overall_score || 0);

  // Helper function to format the date
  const formatPublishDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Helper function to render stars for rating
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score / 2);
    const hasHalfStar = score % 2 >= 1;
    const totalStars = 5;
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        ))}
        {hasHalfStar && (
          <StarHalf className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        )}
        {Array(totalStars - fullStars - (hasHalfStar ? 1 : 0)).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-yellow-500" />
        ))}
        <span className="ml-2 text-lg font-bold">{score.toFixed(1)}/10</span>
      </div>
    );
  };

  // Helper function to determine video type and extract video ID
  const processVideoUrl = (url: string | null): { embedUrl: string | null, type: 'youtube' | 'vimeo' | 'direct' | null } => {
    if (!url) return { embedUrl: null, type: null };
    
    // Check if it's a YouTube URL
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      return { 
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0`, 
        type: 'youtube' 
      };
    }
    
    // Check if it's a Vimeo URL
    const vimeoRegex = /(?:vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|)(\d+)(?:$|\/|\?))/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      return { 
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=0`, 
        type: 'vimeo' 
      };
    }
    
    // Check if it's a direct video URL
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return { embedUrl: url, type: 'direct' };
    }
    
    // Default to treating as YouTube video ID if no format is detected
    if (url.trim().length > 0) {
      if (url.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return { 
          embedUrl: `https://www.youtube.com/embed/${url}?autoplay=0`, 
          type: 'youtube' 
        };
      }
    }
    
    // If no valid format is detected
    console.warn("Invalid video URL format:", url);
    return { embedUrl: null, type: null };
  };

  // Process the video URL if available
  const { embedUrl, type } = processVideoUrl(reviewDetails?.youtube_url || null);
  console.log("Video processing result:", { embedUrl, type });

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      {/* Award banner with dual support for award and awardLevel */}
      {showAwards && awardLevel && (
        <AwardBanner awardLevel={awardLevel} />
      )}
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        
        {article.description && (
          <div 
            className="text-xl text-gray-700 mb-6 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.description }}
          />
        )}
        
        <div className="flex flex-wrap items-center text-sm text-gray-500 gap-4 mb-6">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span>{article.author?.display_name || "Editorial Team"}</span>
          </div>
          
          {article.published_at && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatPublishDate(article.published_at)}</span>
            </div>
          )}
          
          <Badge variant="outline" className="ml-auto">
            Review
          </Badge>
        </div>
        
        {overallScore > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-8">
            <h2 className="text-lg font-bold mb-4">Overall Rating</h2>
            {renderStars(overallScore)}
          </div>
        )}
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {article.featured_image && (
            <img 
              src={article.featured_image} 
              alt={article.title}
              className="w-full h-auto rounded-lg mb-8 object-cover"
            />
          )}
          
          {article.content && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          )}
          
          {/* Rating criteria section */}
          {ratingCriteria.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Detailed Ratings</h2>
              <div className="space-y-4">
                {ratingCriteria.map((criterion, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{criterion.name}</span>
                      <span className="font-bold">{criterion.score}/10</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(criterion.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <aside className="space-y-8">
          {/* Product specs section */}
          {reviewDetails?.product_specs && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-bold mb-4">Product Specifications</h3>
              <dl className="space-y-2">
                {Array.isArray(reviewDetails.product_specs) ? 
                  reviewDetails.product_specs.map((spec, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <dt className="text-gray-600 font-medium">{spec.label}</dt>
                      <dd className="font-medium">{spec.value}</dd>
                    </div>
                  )) : 
                  Object.entries(reviewDetails.product_specs || {}).map(([key, value], index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <dt className="text-gray-600 font-medium">{key}</dt>
                      <dd className="font-medium">{String(value)}</dd>
                    </div>
                  ))
                }
              </dl>
            </div>
          )}
          
          {/* Video section - with improved embed handling */}
          {embedUrl && (
            <div className="rounded-lg overflow-hidden space-y-2">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Video className="h-5 w-5 mr-2 text-gray-700" />
                Video Review
              </h3>
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {type === 'direct' ? (
                  <video 
                    src={embedUrl}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                    title="Video player"
                  ></video>
                ) : (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title="Video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    loading="lazy"
                  ></iframe>
                )}
              </div>
            </div>
          )}
          
          {/* Gallery */}
          {reviewDetails?.gallery && reviewDetails.gallery.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">Product Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {reviewDetails.gallery.map((image, index) => (
                  <img 
                    key={index}
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="rounded-lg w-full h-32 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Call to action */}
          <div className="border border-gray-200 rounded-lg p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Interested in this product?</h3>
            <p className="text-gray-600 mb-4">Check current availability and pricing</p>
            <Button className="w-full">
              <Bookmark className="mr-2 h-4 w-4" /> 
              Save for Later
            </Button>
          </div>
        </aside>
      </div>
    </article>
  );
};
