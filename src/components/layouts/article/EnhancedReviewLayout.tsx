
import React, { useState } from "react";
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
  // Extract layout settings with defaults
  const awardLevel = article.layout_settings?.awardLevel || article.layout_settings?.award;
  const showAwards = article.layout_settings?.showAwards !== undefined ? 
    article.layout_settings.showAwards : true;
  const colorTheme = article.layout_settings?.colorTheme || "default";
  const showFeaturedImage = article.layout_settings?.showFeaturedImage !== undefined ? 
    article.layout_settings.showFeaturedImage : true;
  const layoutWidth = article.layout_settings?.layoutWidth || "wide";
  const verdictText = article.layout_settings?.verdictText || 
    "This product delivers exceptional performance, offering a compelling mix of features, design, and value that makes it stand out in its category. While there are minor areas for improvement, it represents a solid choice for most users.";
  
  // Get enhanced layout specific settings
  const showHighlightQuote = article.layout_settings?.showHighlightQuote !== undefined ?
    article.layout_settings.showHighlightQuote : true;
  const highlightQuote = article.layout_settings?.highlightQuote || 
    "The standout feature is the incredible screen-to-body ratio and responsiveness";
  const highlightAuthor = article.layout_settings?.highlightAuthor || "Lead Reviewer";
  
  // Performance metrics
  const showPerformanceMetrics = article.layout_settings?.showPerformanceMetrics !== undefined ?
    article.layout_settings.showPerformanceMetrics : true;
  const performanceMetrics = article.layout_settings?.performanceMetrics || [
    { name: "Battery Life", score: 8.5, unit: "hours", value: "15.5" },
    { name: "Processing Speed", score: 9.2, unit: "points", value: "12,750" },
    { name: "Display Quality", score: 9.5, unit: "nits", value: "1,200" },
    { name: "Camera Quality", score: 8.8, unit: "MP", value: "108" }
  ];
  
  // User experience metrics
  const showUserExperience = article.layout_settings?.showUserExperience !== undefined ?
    article.layout_settings.showUserExperience : true;
  const userExperienceMetrics = article.layout_settings?.userExperienceMetrics || [
    { name: "Ease of Use", score: 9.0 },
    { name: "Design", score: 9.2 },
    { name: "Reliability", score: 8.5 },
    { name: "Value for Money", score: 7.8 }
  ];
  
  // Pros and cons with categories
  const prosConsCategories = article.layout_settings?.prosConsCategories || [
    { 
      name: "Hardware", 
      pros: ["Powerful processor", "Beautiful display", "Premium build quality"],
      cons: ["No expandable storage"]
    },
    { 
      name: "Software", 
      pros: ["Clean user interface", "Regular updates", "Useful AI features"],
      cons: ["Some bloatware", "Learning curve for new features"]
    },
    { 
      name: "Experience", 
      pros: ["Fast performance", "Great camera system", "All-day battery life"],
      cons: ["Heats up under heavy use", "Premium price point"]
    }
  ];
  
  // Specifications
  const specifications = article.layout_settings?.specifications || [
    { label: "Processor", value: "Snapdragon 8 Gen 3" },
    { label: "RAM", value: "12GB LPDDR5X" },
    { label: "Storage", value: "256GB/512GB UFS 4.0" },
    { label: "Display", value: "6.8-inch Dynamic AMOLED 2X, 120Hz" },
    { label: "Battery", value: "5,000mAh" },
    { label: "Camera", value: "108MP main, 12MP ultrawide, 10MP 3x telephoto" },
    { label: "Front Camera", value: "40MP" },
    { label: "OS", value: "Android 14" },
    { label: "Dimensions", value: "163.4 x 78.1 x 8.9mm" },
    { label: "Weight", value: "233g" }
  ];
  
  // Related products
  const showRelatedProducts = article.layout_settings?.showRelatedProducts !== undefined ?
    article.layout_settings.showRelatedProducts : true;
  const relatedProducts = article.layout_settings?.relatedProducts || [
    { name: "Previous Model", score: 8.0, comment: "Still a solid choice at a discounted price" },
    { name: "Competitor A", score: 8.7, comment: "Better camera but weaker performance" },
    { name: "Competitor B", score: 8.5, comment: "Lower price with some compromises" }
  ];
  
  // State for expandable sections
  const [expandedSpecSections, setExpandedSpecSections] = useState<Record<string, boolean>>({
    "Technical": true,
    "Display": false,
    "Camera": false,
    "Battery": false,
  });
  
  // Extract review details
  const reviewDetail = article.review_details?.[0] || null;
  const overallScore = reviewDetail?.overall_score || 0;
  const productSpecs = reviewDetail?.product_specs || [];
  const galleryImages = reviewDetail?.gallery || [];
  const youtubeUrl = reviewDetail?.youtube_url;
  
  // Function to toggle expanded sections
  const toggleSection = (section: string) => {
    setExpandedSpecSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Calculate overall rating color
  const getRatingColor = (score: number) => {
    if (score >= 8) return "text-green-500";
    if (score >= 6) return "text-amber-500";
    return "text-red-500";
  };
  
  // Calculate color based on score
  const getScoreColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-amber-500";
    return "bg-red-500";
  };
  
  // Determine the max width based on layout width setting
  const getMaxWidthClass = () => {
    switch (layoutWidth) {
      case "narrow": return "max-w-3xl";
      case "standard": return "max-w-5xl";
      case "wide": return "max-w-6xl";
      case "full": return "max-w-full px-4 md:px-8";
      default: return "max-w-6xl";
    }
  };
  
  // Get background color based on theme
  const getBackgroundColor = () => {
    switch (colorTheme) {
      case "dark": return "bg-gray-900 text-white";
      case "blue": return "bg-blue-50";
      case "purple": return "bg-purple-50";
      case "green": return "bg-green-50";
      default: return "bg-white";
    }
  };
  
  // Get text color based on theme
  const getTextColor = () => {
    switch (colorTheme) {
      case "dark": return "text-white";
      default: return "text-gray-900";
    }
  };
  
  // Get accent color based on theme
  const getAccentColor = () => {
    switch (colorTheme) {
      case "dark": return "text-blue-400";
      case "blue": return "text-blue-600";
      case "purple": return "text-purple-600";
      case "green": return "text-green-600";
      default: return "text-blue-600";
    }
  };
  
  // Get star rating display
  const renderStarRating = (score: number) => {
    return (
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = (i + 1) * 2;
          if (score >= starValue) {
            return <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />;
          } else if (score >= starValue - 1) {
            return <Star key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" strokeWidth={1} fill="url(#half-star)" />;
          } else {
            return <Star key={i} className="h-5 w-5 text-yellow-500" />;
          }
        })}
        <span className="ml-2 text-sm text-gray-500">({score.toFixed(1)})</span>
      </div>
    );
  };
  
  const renderHeroScore = (score: number) => {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="relative flex items-center justify-center rounded-full border-4 border-blue-200 w-32 h-32 bg-white shadow-lg">
          <div className="flex flex-col items-center">
            <span className={`text-4xl font-bold ${getRatingColor(score)}`}>{score.toFixed(1)}</span>
            <span className="text-sm text-gray-500 mt-1">out of 10</span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      {/* SVG definitions for half-star */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="half-star" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Header with Featured Image */}
      <header className="relative">
        {showFeaturedImage && article.featured_image ? (
          <div className="w-full h-80 md:h-96 lg:h-[500px] overflow-hidden relative">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
              <div className={getMaxWidthClass() + " mx-auto"}>
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{article.title}</h1>
                {article.published_at && (
                  <p className="text-gray-300 mb-2">
                    Published {formatDate(article.published_at)}
                  </p>
                )}
                
                {/* Display review score prominently in header */}
                {reviewDetail && (
                  <div className="flex items-center mt-4">
                    <Badge variant="default" className="bg-white text-gray-900 px-4 py-2 mr-3 shadow-lg">
                      <span className={`text-2xl font-bold ${getRatingColor(overallScore)}`}>
                        {overallScore.toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-500 ml-1">/10</span>
                    </Badge>
                    
                    {/* Show award badge if present */}
                    {showAwards && awardLevel && (
                      <Badge variant="award" className="flex items-center gap-1 px-4 py-2 text-sm shadow-lg">
                        <Award className="h-4 w-4" />
                        <span>{awardLevel}</span>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${getMaxWidthClass()} mx-auto py-12`}>
            <h1 className={`text-3xl md:text-5xl font-bold ${getTextColor()} mb-4`}>{article.title}</h1>
            {article.published_at && (
              <p className="text-gray-500 mb-2">
                Published {formatDate(article.published_at)}
              </p>
            )}
            
            {/* Display review score when no featured image */}
            {reviewDetail && (
              <div className="flex items-center mt-4">
                <Badge variant="default" className="bg-gray-100 text-gray-900 px-4 py-2 mr-3">
                  <span className={`text-2xl font-bold ${getRatingColor(overallScore)}`}>
                    {overallScore.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">/10</span>
                </Badge>
                
                {showAwards && awardLevel && (
                  <Badge variant="award" className="flex items-center gap-1 px-4 py-2 text-sm">
                    <Award className="h-4 w-4" />
                    <span>{awardLevel}</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className={`${getMaxWidthClass()} mx-auto py-8`}>
        {/* Award Banner - placed prominently after the header */}
        {showAwards && awardLevel && (
          <AwardBanner awardLevel={awardLevel} />
        )}

        {/* Description */}
        {article.description && (
          <div className={`text-xl ${getTextColor()} mb-8 px-4`} dangerouslySetInnerHTML={{ __html: article.description }} />
        )}
        
        {/* Overall score card with rating breakdown */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 px-4">
          <div className="md:w-1/3 flex justify-center">
            {renderHeroScore(overallScore)}
          </div>
          <div className="md:w-2/3">
            <h2 className={`text-2xl font-bold ${getAccentColor()} mb-4`}>Overall Assessment</h2>
            {article.rating_criteria && article.rating_criteria.length > 0 && (
              <div className="space-y-3">
                {article.rating_criteria.map((criterion, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{criterion.name}</span>
                      <span className={`font-bold ${getRatingColor(criterion.score)}`}>
                        {criterion.score.toFixed(1)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${getScoreColor(criterion.score)} h-2 rounded-full`} 
                        style={{ width: `${(criterion.score / 10) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Highlight quote */}
        {showHighlightQuote && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-lg mb-8 border-l-4 border-blue-500 mx-4">
            <blockquote className="text-xl italic font-medium text-gray-800 dark:text-gray-200">
              "{highlightQuote}"
            </blockquote>
            <cite className="block mt-2 text-gray-600 dark:text-gray-400">— {highlightAuthor}</cite>
          </div>
        )}

        {/* Review Content Tabs */}
        <Tabs defaultValue="overview" className="mb-12 px-4">
          <TabsList className="mb-6 w-full md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="features">Features & Performance</TabsTrigger>
            <TabsTrigger value="specs">Full Specifications</TabsTrigger>
            {galleryImages.length > 0 && (
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            )}
            {showRelatedProducts && (
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            )}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="animate-fade-in">
            {article.content && (
              <div className={`prose prose-blue max-w-none ${getTextColor()}`} dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
            
            {/* YouTube Video if available */}
            {youtubeUrl && (
              <div className="mt-8">
                <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
                  <Video className="mr-2 h-5 w-5" /> Video Review
                </h3>
                <div className="aspect-video">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={youtubeUrl.replace("watch?v=", "embed/")} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Features & Performance Tab */}
          <TabsContent value="features" className="animate-fade-in">
            {/* Performance Metrics */}
            {showPerformanceMetrics && (
              <div className="mb-8">
                <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
                  <BarChart className="mr-2 h-5 w-5" /> Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {performanceMetrics.map((metric, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex justify-between">
                          <span>{metric.name}</span>
                          <span className={getRatingColor(metric.score)}>{metric.score.toFixed(1)}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <span className="text-2xl font-bold">{metric.value}</span>
                          <span className="text-gray-500">{metric.unit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`${getScoreColor(metric.score)} h-2 rounded-full`} 
                            style={{ width: `${(metric.score / 10) * 100}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {/* User Experience Metrics */}
            {showUserExperience && (
              <div className="mb-8">
                <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
                  <Users className="mr-2 h-5 w-5" /> User Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userExperienceMetrics.map((metric, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{metric.name}</span>
                        <div className="flex">
                          {renderStarRating(metric.score)}
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${getScoreColor(metric.score)} h-2 rounded-full`} 
                          style={{ width: `${(metric.score / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Pros and Cons by Category */}
            <div className="mb-8">
              <h3 className={`text-xl font-bold ${getAccentColor()} mb-4`}>Pros & Cons by Category</h3>
              <div className="space-y-6">
                {prosConsCategories.map((category, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className={`p-3 ${getAccentColor()} bg-blue-50`}>
                      <h4 className="font-bold">{category.name}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-4 border-r border-gray-100">
                        <div className="flex items-center mb-2">
                          <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                          <span className="font-medium">Pros</span>
                        </div>
                        <ul className="space-y-2">
                          {category.pros.map((pro, i) => (
                            <li key={i} className="flex items-start">
                              <Check className="h-4 w-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center mb-2">
                          <ThumbsDown className="h-4 w-4 text-red-500 mr-2" />
                          <span className="font-medium">Cons</span>
                        </div>
                        <ul className="space-y-2">
                          {category.cons.map((con, i) => (
                            <li key={i} className="flex items-start">
                              <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-1 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          {/* Specs Tab */}
          <TabsContent value="specs" className="animate-fade-in">
            <div className="mb-8">
              <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
                <Settings className="mr-2 h-5 w-5" /> Technical Specifications
              </h3>
              
              {/* Technical Specifications */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                <div 
                  className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleSection("Technical")}
                >
                  <h4 className="font-bold">General Specifications</h4>
                  {expandedSpecSections["Technical"] ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
                
                {expandedSpecSections["Technical"] && (
                  <div className="p-4">
                    <Table>
                      <TableBody>
                        {specifications.slice(0, 5).map((spec, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium w-1/3">{spec.label}</TableCell>
                            <TableCell>{spec.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              {/* Display Specifications */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                <div 
                  className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleSection("Display")}
                >
                  <h4 className="font-bold">Display</h4>
                  {expandedSpecSections["Display"] ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
                
                {expandedSpecSections["Display"] && (
                  <div className="p-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Type</TableCell>
                          <TableCell>Dynamic AMOLED 2X</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Size</TableCell>
                          <TableCell>6.8 inches</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Resolution</TableCell>
                          <TableCell>3088 x 1440 pixels</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Refresh Rate</TableCell>
                          <TableCell>1-120Hz adaptive</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Protection</TableCell>
                          <TableCell>Corning Gorilla Glass Victus 2</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              {/* Camera Specifications */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
                <div 
                  className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleSection("Camera")}
                >
                  <h4 className="font-bold">Camera System</h4>
                  {expandedSpecSections["Camera"] ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
                
                {expandedSpecSections["Camera"] && (
                  <div className="p-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Main Camera</TableCell>
                          <TableCell>108MP, f/1.8, 1/1.33", OIS</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Ultra-wide</TableCell>
                          <TableCell>12MP, f/2.2, 120° FOV</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Telephoto</TableCell>
                          <TableCell>10MP, f/2.4, 3x optical zoom, OIS</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Front Camera</TableCell>
                          <TableCell>40MP, f/2.2, 4K video</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Features</TableCell>
                          <TableCell>Night mode, Portrait mode, 8K video, Director's View</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
              
              {/* Battery Specifications */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div 
                  className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleSection("Battery")}
                >
                  <h4 className="font-bold">Battery & Charging</h4>
                  {expandedSpecSections["Battery"] ? 
                    <ChevronUp className="h-5 w-5 text-gray-500" /> : 
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
                </div>
                
                {expandedSpecSections["Battery"] && (
                  <div className="p-4">
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium w-1/3">Capacity</TableCell>
                          <TableCell>5,000mAh</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Wired Charging</TableCell>
                          <TableCell>45W fast charging</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Wireless Charging</TableCell>
                          <TableCell>15W Qi wireless charging</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Reverse Charging</TableCell>
                          <TableCell>4.5W reverse wireless charging</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Battery Life</TableCell>
                          <TableCell>Up to 15.5 hours typical usage</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* Gallery Tab */}
          {galleryImages.length > 0 && (
            <TabsContent value="gallery" className="animate-fade-in">
              <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
                <ImageIcon className="mr-2 h-5 w-5" /> Product Gallery
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <img 
                      src={image} 
                      alt={`${article.title} gallery image ${index + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          )}
          
          {/* Comparison Tab */}
          {showRelatedProducts && (
            <TabsContent value="comparison" className="animate-fade-in">
              <h3 className={`text-xl font-bold ${getAccentColor()} mb-4`}>Comparison with Similar Products</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/4">Product</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Price Range</TableHead>
                      <TableHead className="w-1/2">Overview</TableHead>
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
                    
                    {relatedProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getRatingColor(product.score)}`}>
                            {product.score.toFixed(1)}
                          </span>
                          <div className="flex mt-1">
                            {renderStarRating(product.score)}
                          </div>
                        </TableCell>
                        <TableCell>${700 + (index * 100)}-${900 + (index * 100)}</TableCell>
                        <TableCell>{product.comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          )}
        </Tabs>
        
        {/* Verdict Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-6 mb-8 shadow-sm mx-4">
          <h3 className={`text-xl font-bold ${getAccentColor()} mb-4 flex items-center`}>
            <Info className="h-5 w-5 mr-2" /> Final Verdict
          </h3>
          <div className="prose prose-blue max-w-none dark:prose-invert">
            <p className="text-lg">{verdictText}</p>
            
            {showAwards && awardLevel && (
              <div className="flex items-center mt-4 p-3 bg-white/50 dark:bg-white/10 rounded-lg">
                <Award className="h-6 w-6 text-amber-500 mr-3" />
                <span className="font-medium">
                  This product earns our <span className="font-bold text-amber-600">{awardLevel}</span> award for exceptional performance in its category.
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Who should buy */}
        <div className="mb-12 px-4">
          <h3 className={`text-xl font-bold ${getAccentColor()} mb-4`}>Who Should Buy This?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Check className="h-5 w-5 text-green-500 mr-2" /> Ideal For
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                    <span>Power users who demand top performance</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                    <span>Photography enthusiasts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                    <span>Those who want the latest features</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" /> Consider If
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-1" />
                    <span>You're upgrading from last year's model</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-1" />
                    <span>Budget is somewhat flexible</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-amber-500 mr-2 mt-1" />
                    <span>You value ecosystem integration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" /> Look Elsewhere If
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-1" />
                    <span>You're on a tight budget</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-1" />
                    <span>You need expandable storage</span>
                  </li>
                  <li className="flex items-start">
                    <AlertTriangle className="h-4 w-4 text-red-500 mr-2 mt-1" />
                    <span>You prefer a different OS</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Review metadata and author */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-6 rounded-lg mb-8 mx-4">
          <div className="flex items-center">
            {article.author?.avatar_url ? (
              <img 
                src={article.author.avatar_url} 
                alt={article.author.display_name || "Author"} 
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-500 font-bold">
                  {article.author?.display_name?.charAt(0) || "A"}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium">Reviewed by {article.author?.display_name || "Editorial Team"}</p>
              <p className="text-sm text-gray-500">
                Published {article.published_at ? formatDate(article.published_at) : "recently"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">15 min read</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-4 w-4 text-gray-400 mr-1" />
              <span className="text-sm text-gray-500">Last updated 2 days ago</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
