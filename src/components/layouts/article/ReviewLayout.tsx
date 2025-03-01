import React, { useMemo, useEffect, useState } from "react";
import { ArticleData } from "@/types/content";
import { AwardBanner } from "./AwardBanner";
import { formatDistanceToNow } from "date-fns";
import { Star, StarHalf, User, Clock, Bookmark, Video, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReviewLayoutProps {
  article: ArticleData;
}

export const ReviewLayout: React.FC<ReviewLayoutProps> = ({ article }) => {
  const reviewDetails = article.review_details?.[0];
  const ratingCriteria = article.rating_criteria || [];
  const [videoLoaded, setVideoLoaded] = useState(false);

  const awardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;

  // Calculate overall score out of 5
  const calculatedOverallScore = useMemo(() => {
    if (ratingCriteria.length === 0) return 0;
    const sum = ratingCriteria.reduce((total, criterion) => total + (criterion.score || 0), 0);
    return parseFloat((sum / ratingCriteria.length).toFixed(1));
  }, [ratingCriteria]);

  const overallScore = ratingCriteria.length > 0 
    ? calculatedOverallScore 
    : (reviewDetails?.overall_score || 0);

  const formatPublishDate = (dateString: string | null) => {
    if (!dateString) return "Recently";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // 5-star rendering logic
  const renderStars = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
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
        <span className="ml-2 text-lg font-bold">{score.toFixed(1)}/5</span>
      </div>
    );
  };

  // Improved YouTube URL parser
  const getYouTubeEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    console.log('[DEBUG] Processing YouTube URL:', url);

    // Handle youtu.be shortened URLs
    if (url.includes('youtu.be')) {
      const id = url.split('/').pop()?.split('?')[0];
      if (id?.match(/^[a-zA-Z0-9_-]{11}$/)) {
        console.log('[DEBUG] Detected youtu.be URL, ID:', id);
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    // Handle standard watch URLs
    const vParamMatch = url.match(/v=([^&#]{11})/);
    if (vParamMatch && vParamMatch[1]) {
      console.log('[DEBUG] Detected v= parameter, ID:', vParamMatch[1]);
      return `https://www.youtube.com/embed/${vParamMatch[1]}`;
    }

    // Handle YouTube shorts
    if (url.includes('/shorts/')) {
      const id = url.split('/shorts/')[1].split('?')[0];
      if (id?.match(/^[a-zA-Z0-9_-]{11}$/)) {
        console.log('[DEBUG] Detected shorts URL, ID:', id);
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    // Fallback to direct ID match
    const directMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    if (directMatch && directMatch[1]) {
      console.log('[DEBUG] Fallback ID extraction, ID:', directMatch[1]);
      return `https://www.youtube.com/embed/${directMatch[1]}`;
    }

    console.warn('[DEBUG] Failed to extract YouTube ID from URL:', url);
    return null;
  };

  const youtubeEmbedUrl = useMemo(() => 
    reviewDetails?.youtube_url ? getYouTubeEmbedUrl(reviewDetails.youtube_url) : null,
    [reviewDetails?.youtube_url]
  );

  const getDirectYouTubeUrl = (embedUrl: string | null): string | null => {
    if (!embedUrl) return null;
    const videoId = embedUrl.split('/').pop();
    return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
  };

  const directYouTubeUrl = getDirectYouTubeUrl(youtubeEmbedUrl);

  useEffect(() => {
    console.log('[DEBUG] YouTube embed URL:', youtubeEmbedUrl);
    console.log('[DEBUG] Direct YouTube URL:', directYouTubeUrl);
    setVideoLoaded(false);
  }, [youtubeEmbedUrl, directYouTubeUrl]);

  const handleVideoLoad = () => {
    console.log('[DEBUG] Video loaded successfully');
    setVideoLoaded(true);
  };

  const handleVideoError = () => {
    console.error('[DEBUG] Video load error');
    setVideoLoaded(false);
  };

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      {showAwards && awardLevel && <AwardBanner awardLevel={awardLevel} />}
      
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
          
          <Badge variant="outline" className="ml-auto">Review</Badge>
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
          
          {ratingCriteria.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Detailed Ratings</h2>
              <div className="space-y-4">
                {ratingCriteria.map((criterion, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{criterion.name}</span>
                      <span className="font-bold">{criterion.score}/5</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(criterion.score / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <aside className="space-y-8">
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
          
          {youtubeEmbedUrl && (
            <div className="rounded-lg overflow-hidden space-y-2">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Video className="h-5 w-5 mr-2 text-gray-700" />
                Video Review
              </h3>
              
              <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
                <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    key={youtubeEmbedUrl}
                    src={`${youtubeEmbedUrl}?autoplay=0&modestbranding=1`}
                    className="w-full h-full"
                    title="Video Review"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={handleVideoLoad}
                    onError={handleVideoError}
                    loading="lazy"
                  />
                  
                  {!videoLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
                      <p className="text-gray-600 mb-3">Loading video preview...</p>
                      {directYouTubeUrl && (
                        <a
                          href={directYouTubeUrl}
                          className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Watch on YouTube
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {directYouTubeUrl && (
                <div className="mt-2 flex justify-end">
                  <a 
                    href={directYouTubeUrl}
                    className="text-sm text-blue-600 hover:underline flex items-center"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" /> Open in YouTube
                  </a>
                </div>
              )}
            </div>
          )}
          
          {reviewDetails?.gallery?.length > 0 && (
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
