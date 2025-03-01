import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { User, Clock, Info, ThumbsUp, ThumbsDown, Star, StarHalf, Award } from "lucide-react";
import { AwardBanner } from "./AwardBanner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Add award formatting function
const formatAwardLevel = (level: string) => {
  const formatMap: Record<string, string> = {
    'editors-choice': 'Editor\'s Choice',
    'top-pick': 'Top Pick',
    'best-value': 'Best Value',
    'excellence': 'Excellence Award',
    'recommended': 'Recommended',
    'gold': 'Gold Award'
  };
  
  return formatMap[level.toLowerCase()] || 
    level.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

interface BasicReviewLayoutProps {
  article: ArticleData;
}

export const BasicReviewLayout: React.FC<BasicReviewLayoutProps> = ({ article }) => {
  // Updated award level handling
  const rawAwardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const awardLevel = rawAwardLevel ? formatAwardLevel(rawAwardLevel) : null;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;
    
  // Parse content for HTML rendering
  const renderHtml = (content: string | null) => {
    if (!content) return null;
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };
  
  // Extract review details
  const reviewDetails = article.review_details?.[0] || null;
  
  // Get author data
  const author = article.author;
  const authorName = author?.full_name || author?.username || "Anonymous";
  const authorBio = author?.bio;
  
  // Calculate rating criteria options
  const showRatingCriteria = article.layout_settings?.showRatingCriteria !== false;
  
  // Layout settings with defaults
  const colorTheme = article.layout_settings?.colorTheme || "default";
  const fontFamily = article.layout_settings?.fontFamily || "sans";
  const fontSize = article.layout_settings?.fontSize || "medium";
  const textAlignment = article.layout_settings?.textAlignment || "left";
  const spacing = article.layout_settings?.spacing || "normal";
  
  // Helper functions for dynamic classes
  const getMaxWidthClass = () => {
    const widthSetting = article.layout_settings?.contentWidth || "medium";
    switch (widthSetting) {
      case "narrow": return "max-w-3xl";
      case "wide": return "max-w-6xl";
      case "full": return "max-w-full px-4";
      case "medium":
      default: return "max-w-4xl";
    }
  };
  
  const getTextAlignmentClass = () => {
    switch (textAlignment) {
      case "center": return "text-center";
      case "right": return "text-right";
      case "justify": return "text-justify";
      case "left":
      default: return "text-left";
    }
  };
  
  const getFontSizeClasses = () => {
    switch (fontSize) {
      case "small": return "text-sm";
      case "large": return "text-lg";
      case "medium":
      default: return "text-base";
    }
  };
  
  const getColorThemeClasses = () => {
    switch (colorTheme) {
      case "dark": return "bg-gray-900 text-white";
      case "sepia": return "bg-amber-50 text-gray-900";
      case "blue": return "bg-blue-50 text-gray-900";
      case "default":
      default: return "bg-white text-gray-900";
    }
  };
  
  const getHeadingStyleClasses = () => {
    switch (colorTheme) {
      case "dark": return "text-white";
      case "sepia": return "text-amber-800";
      case "blue": return "text-blue-800";
      default: return "text-gray-900";
    }
  };
  
  const getSectionSpacingClass = () => {
    switch (spacing) {
      case "tight": return "gap-2";
      case "wide": return "gap-8";
      case "normal":
      default: return "gap-4";
    }
  };

  return (
    <article className={`${getMaxWidthClass()} mx-auto px-4 py-8 ${getTextAlignmentClass()} ${getFontSizeClasses()} ${getColorThemeClasses()} overflow-x-hidden`}>
      {/* Updated award banner implementation */}
      {showAwards && awardLevel && (
        <div className="mb-6">
          <Badge variant="award" className="flex items-center gap-2 px-4 py-2 text-sm w-fit mx-auto">
            <Award className="h-4 w-4" />
            <span>{awardLevel}</span>
          </Badge>
        </div>
      )}
      
      {/* Title and Meta */}
      <header className="mb-8">
        <h1 className={`text-4xl font-bold mb-4 ${getHeadingStyleClasses()}`}>{article.title}</h1>
        
        {/* Description */}
        {article.description && (
          <div className="text-lg mb-4 leading-relaxed">
            {renderHtml(article.description)}
          </div>
        )}
        
        {/* Meta information */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-4">
          {author && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{authorName}</span>
            </div>
          )}
          
          {article.published_at && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
            </div>
          )}
          
          {article.type === 'review' && (
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Review</span>
            </div>
          )}
        </div>
      </header>
      
      {/* Featured Image */}
      {article.featured_image && (
        <div className="mb-8 relative">
          <img 
            src={article.featured_image} 
            alt={article.title}
            className="w-full h-auto rounded-lg object-cover"
          />
        </div>
      )}
      
      {/* Fix: Show the actual rating without dividing by 2 */}
      {reviewDetails?.overall_score !== undefined && (
        <div className={`${colorTheme === "default" ? "bg-gray-100" : ""} p-4 rounded-lg mb-8 overflow-hidden`}>
          <h2 className={`text-lg font-semibold mb-2 ${getHeadingStyleClasses()}`}>Overall Rating</h2>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-blue-600 mr-2">
              {(reviewDetails.overall_score).toFixed(1)}
            </div>
            <div className="text-gray-500">/ 5</div>
          </div>
        </div>
      )}

      {/* Fix: Show rating criteria without dividing by 2 */}
      {showRatingCriteria && article.rating_criteria && article.rating_criteria.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${getHeadingStyleClasses()}`}>Rating Breakdown</h2>
          <div className={`grid grid-cols-1 md:grid-cols-2 ${getSectionSpacingClass()}`}>
            {article.rating_criteria.map((criterion, index) => (
              <Card key={index} className="overflow-hidden">
                <div className={`h-2 ${
                  criterion.score >= 4 ? "bg-green-500" : 
                  criterion.score >= 2.5 ? "bg-amber-500" : "bg-red-500"
                }`} style={{ width: `${(criterion.score / 5) * 100}%` }}></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium truncate pr-2">{criterion.name}</span>
                    <span className="text-lg font-bold flex-shrink-0">{(criterion.score).toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {/* Pros and Cons */}
      {article.layout_settings?.showProsCons !== false && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pros */}
          <div className={`p-4 rounded-lg ${colorTheme === "default" ? "bg-green-50" : ""}`}>
            <h3 className="flex items-center text-lg font-semibold mb-4 text-green-700">
              <ThumbsUp className="h-5 w-5 mr-2" />
              Pros
            </h3>
            <ul className="space-y-2 list-disc pl-5">
              {article.layout_settings?.pros ? 
                article.layout_settings.pros.map((pro: string, index: number) => (
                  <li key={index}>{pro}</li>
                )) : 
                <li>Not specified</li>
              }
            </ul>
          </div>
          
          {/* Cons */}
          <div className={`p-4 rounded-lg ${colorTheme === "default" ? "bg-red-50" : ""}`}>
            <h3 className="flex items-center text-lg font-semibold mb-4 text-red-700">
              <ThumbsDown className="h-5 w-5 mr-2" />
              Cons
            </h3>
            <ul className="space-y-2 list-disc pl-5">
              {article.layout_settings?.cons ? 
                article.layout_settings.cons.map((con: string, index: number) => (
                  <li key={index}>{con}</li>
                )) : 
                <li>Not specified</li>
              }
            </ul>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="prose max-w-none mb-8">
        {renderHtml(article.content)}
      </div>
      
      {/* Product Specs */}
      {reviewDetails?.product_specs && Array.isArray(reviewDetails.product_specs) && reviewDetails.product_specs.length > 0 && (
        <div className="mb-8">
          <h2 className={`text-lg font-semibold mb-4 ${getHeadingStyleClasses()}`}>Product Specifications</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Specification</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewDetails.product_specs.map((spec, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{spec.name}</TableCell>
                  <TableCell>{spec.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Author Bio */}
      {author && (
        <div className={`mt-8 p-4 rounded-lg border ${colorTheme === "default" ? "bg-gray-50" : ""}`}>
          <h2 className={`text-lg font-semibold mb-2 ${getHeadingStyleClasses()}`}>About the Author</h2>
          <div className="flex flex-col md:flex-row gap-4">
            {author.avatar_url && (
              <img 
                src={author.avatar_url} 
                alt={authorName}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-medium">{authorName}</h3>
              {authorBio && <p className="text-sm mt-1">{authorBio}</p>}
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
