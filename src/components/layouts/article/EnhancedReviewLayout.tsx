import React, { useState, useMemo, useEffect } from "react";
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

  // Update all score displays in the JSX
  // Example update in rating criteria:
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

  // Update comparison table
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

  // Rest of the component remains the same with:
  // - All '/10' replaced with '/5'
  // - Score calculations updated to use 5-point scale
  // - Threshold adjustments in getRatingColor/getScoreColor
  // - YouTube handling using new parser
});
