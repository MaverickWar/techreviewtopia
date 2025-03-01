
import React, { useState, useMemo } from "react";
import { ArticleData } from "@/types/content";
import { 
  Star, Info, Check, AlertTriangle, Award, 
  ChevronDown, ChevronUp, Image as ImageIcon, 
  Video, BarChart, ThumbsUp, ThumbsDown,
  Settings, Users, Zap, Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwardBanner } from "./AwardBanner";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Missing StarHalf icon from lucide-react
const StarHalf = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 17.8 5.8 21 7 14.1 2 9.3l6.9-1L12 2" fill="currentColor" />
  </svg>
);

interface EnhancedReviewLayoutProps {
  article: ArticleData;
}

export const EnhancedReviewLayout = ({ article }: EnhancedReviewLayoutProps) => {
  // Existing state and configuration remains the same
  const [expandedSpecSections, setExpandedSpecSections] = useState<Record<string, boolean>>({
    "Technical": true,
    "Display": false,
    "Camera": false,
    "Battery": false,
  });

  // YouTube state and parsing functions
  const [videoLoaded, setVideoLoaded] = useState(false);
  const reviewDetail = article.review_details?.[0] || null;
  const youtubeUrl = reviewDetail?.youtube_url;

  const getYouTubeEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // Handle youtu.be shortened URLs
    if (url.includes('youtu.be')) {
      const id = url.split('/').pop()?.split('?')[0];
      if (id?.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    // Handle standard watch URLs
    const vParamMatch = url.match(/v=([^&#]{11})/);
    if (vParamMatch && vParamMatch[1]) {
      return `https://www.youtube.com/embed/${vParamMatch[1]}`;
    }

    // Handle YouTube shorts
    if (url.includes('/shorts/')) {
      const id = url.split('/shorts/')[1].split('?')[0];
      if (id?.match(/^[a-zA-Z0-9_-]{11}$/)) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }

    // Fallback to direct ID match
    const directMatch = url.match(/([a-zA-Z0-9_-]{11})/);
    return directMatch && directMatch[1] ? `https://www.youtube.com/embed/${directMatch[1]}` : null;
  };

  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(youtubeUrl), [youtubeUrl]);
  const [showVideoFallback, setShowVideoFallback] = useState(false);

  // Updated rating functions for 5-point scale
  const getRatingColor = (score: number) => {
    if (score >= 4) return "text-green-500";
    if (score >= 3) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "bg-green-500";
    if (score >= 3) return "bg-amber-500";
    return "bg-red-500";
  };

  // Added missing function
  const getAccentColor = () => {
    return "text-blue-600";
  };

  const renderStarRating = (score: number) => {
    const fullStars = Math.floor(score);
    const hasHalfStar = score % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {Array(fullStars).fill(0).map((_, i) => (
          <Star key={`full-${i}`} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        ))}
        {hasHalfStar && (
          <StarHalf className="h-5 w-5 text-yellow-500 fill-yellow-500" />
        )}
        {Array(5 - fullStars - (hasHalfStar ? 1 : 0)).fill(0).map((_, i) => (
          <Star key={`empty-${i}`} className="h-5 w-5 text-yellow-500" />
        ))}
      </div>
    );
  };

  // Update progress bars and score displays
  const renderHeroScore = (score: number) => {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="relative flex items-center justify-center rounded-full border-4 border-blue-200 w-32 h-32 bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold ${getRatingColor(score)}`}>{score.toFixed(1)}</span>
            <span className="text-sm text-gray-500 mt-1">out of 5</span>
          </div>
        </div>
      </div>
    );
  };

  // Update YouTube video component
  const VideoSection = () => (
    <div className="mt-8">
      <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
        <Video className="mr-2 h-5 w-5" /> Video Review
      </h3>
      <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
        <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
          {youtubeEmbedUrl && (
            <iframe
              key={youtubeEmbedUrl}
              src={`${youtubeEmbedUrl}?autoplay=0&modestbranding=1`}
              className="w-full h-full"
              title="Video Review"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setVideoLoaded(true)}
              onError={() => setShowVideoFallback(true)}
              loading="lazy"
            />
          )}
          {(!videoLoaded || showVideoFallback) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 p-4">
              <p className="text-gray-600 mb-3">Loading video preview...</p>
              {youtubeUrl && (
                <a
                  href={youtubeUrl}
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
    </div>
  );

  // Extract overall score from review details
  const overallScore = reviewDetail?.overall_score || 0;
  
  // Format award labels properly
  const getAwardDisplayName = (awardSlug: string | null) => {
    if (!awardSlug) return null;
    
    const awardMap: Record<string, string> = {
      "editors-choice": "Editor's Choice",
      "best-value": "Best Value",
      "best-performance": "Best Performance",
      "recommended": "Recommended"
    };
    
    return awardMap[awardSlug] || awardSlug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Create properly structured product specs from object
  const formatProductSpecs = () => {
    const specs = reviewDetail?.product_specs || {};
    return Object.entries(specs).map(([category, values]) => {
      if (typeof values === 'object') {
        return {
          category,
          specs: Object.entries(values).map(([key, value]) => ({ key, value }))
        };
      }
      return null;
    }).filter(Boolean);
  };

  const formattedSpecs = formatProductSpecs();

  // Toggle section expansion
  const toggleSpecSection = (section: string) => {
    setExpandedSpecSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const award = article.layout_settings?.award || null;
  const awardName = getAwardDisplayName(award);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        {award && awardName && (
          <AwardBanner award={award} className="mb-4" />
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          {article.title}
        </h1>
        
        {article.description && (
          <p className="text-lg text-gray-700 mb-4">
            {article.description}
          </p>
        )}
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          {article.author && (
            <span className="flex items-center mr-4">
              <Users className="h-4 w-4 mr-1" />
              By {article.author.full_name || article.author.username}
            </span>
          )}
          
          {article.published_at && (
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          )}
        </div>
      </div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Score & Rating Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-xl">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              {renderHeroScore(overallScore)}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Rating Criteria</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {article.rating_criteria?.map((criterion) => (
                <div key={criterion.name} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{criterion.name}</span>
                    <span className={`font-bold ${getRatingColor(criterion.score)}`}>
                      {criterion.score.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`${getScoreColor(criterion.score)} h-2 rounded-full`} 
                      style={{ width: `${(criterion.score / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Pros & Cons */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pros & Cons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 flex items-center mb-2">
                  <ThumbsUp className="h-4 w-4 mr-2" /> Pros
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Excellent battery life</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Outstanding camera system</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                    <span>Bright, vivid display</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-red-600 flex items-center mb-2">
                  <ThumbsDown className="h-4 w-4 mr-2" /> Cons
                </h4>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                    <span>Premium price point</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2 shrink-0 mt-0.5" />
                    <span>Charging speed could be faster</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Featured Image */}
          {article.featured_image && (
            <div className="rounded-lg overflow-hidden shadow-md">
              <img 
                src={article.featured_image} 
                alt={article.title} 
                className="w-full h-auto"
              />
            </div>
          )}
          
          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            {article.content && (
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
          </div>
          
          {/* Video Section (if available) */}
          {youtubeUrl && <VideoSection />}
          
          {/* Specifications */}
          {formattedSpecs.length > 0 && (
            <div className="mt-8">
              <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
                <Settings className="mr-2 h-5 w-5" /> Specifications
              </h3>
              <div className="space-y-4 bg-white rounded-lg shadow-sm overflow-hidden">
                {formattedSpecs.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-200 last:border-b-0">
                    <button
                      onClick={() => toggleSpecSection(section?.category || '')}
                      className="w-full px-4 py-3 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-800">{section?.category}</span>
                      {expandedSpecSections[section?.category || ''] ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    
                    {expandedSpecSections[section?.category || ''] && section?.specs && (
                      <div className="px-4 pb-3">
                        <table className="w-full text-sm">
                          <tbody>
                            {section.specs.map((spec, specIdx) => (
                              <tr key={specIdx} className="border-b border-gray-100 last:border-b-0">
                                <td className="py-2 pr-4 text-gray-600 align-top w-1/3">{spec.key}</td>
                                <td className="py-2 text-gray-900">{String(spec.value)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Comparison Table */}
          <div className="mt-8">
            <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
              <BarChart className="mr-2 h-5 w-5" /> Comparison
            </h3>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-bold">{article.title}</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getRatingColor(overallScore)}`}>
                        {overallScore.toFixed(1)}
                      </span>
                      <div className="flex mt-1">
                        {renderStarRating(overallScore)}
                      </div>
                    </TableCell>
                    <TableCell>$899-$1,199</TableCell>
                    <TableCell>The product being reviewed - our recommendation</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Competitor A</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getRatingColor(4.2)}`}>
                        4.2
                      </span>
                      <div className="flex mt-1">
                        {renderStarRating(4.2)}
                      </div>
                    </TableCell>
                    <TableCell>$849-$1,099</TableCell>
                    <TableCell>Great battery life, but camera is not as good</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Competitor B</TableCell>
                    <TableCell>
                      <span className={`font-bold ${getRatingColor(3.5)}`}>
                        3.5
                      </span>
                      <div className="flex mt-1">
                        {renderStarRating(3.5)}
                      </div>
                    </TableCell>
                    <TableCell>$699-$899</TableCell>
                    <TableCell>More affordable option with decent performance</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Gallery Section */}
      {reviewDetail?.gallery && reviewDetail.gallery.length > 0 && (
        <div className="mt-12">
          <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
            <ImageIcon className="mr-2 h-5 w-5" /> Gallery
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {reviewDetail.gallery.map((image, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <img 
                  src={image} 
                  alt={`Gallery image ${idx + 1}`} 
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Final Verdict */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6 shadow-sm">
        <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
          <Award className="mr-2 h-5 w-5" /> Final Verdict
        </h3>
        <p className="text-gray-700 mb-4">
          Based on our comprehensive testing, this product offers exceptional value and performance.
          While it does come at a premium price point, the combination of outstanding camera quality,
          excellent battery life, and impressive display make it one of the best options currently available.
        </p>
        <div className="flex items-center">
          <span className="mr-2 text-gray-700 font-medium">Final Rating:</span>
          <span className={`font-bold ${getRatingColor(overallScore)}`}>
            {overallScore.toFixed(1)}/5.0
          </span>
          <div className="ml-2">
            {renderStarRating(overallScore)}
          </div>
        </div>
      </div>
    </div>
  );
};
