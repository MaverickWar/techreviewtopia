
import { ArticleData } from "@/types/content";
import { Star, Info, Check, AlertTriangle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AwardBanner } from "./AwardBanner";

interface EnhancedReviewLayoutProps {
  article: ArticleData;
}

export const EnhancedReviewLayout = ({ article }: EnhancedReviewLayoutProps) => {
  // Extract layout settings award
  const award = article.layout_settings?.award;

  // Extract review details
  const reviewDetail = article.review_details?.[0] || null;
  
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
  
  // Format product specifications for display
  const formatSpecs = (specs: Record<string, any> | null) => {
    if (!specs) return [];
    return Object.entries(specs).map(([key, value]) => ({ key, value }));
  };

  const overallScore = reviewDetail?.overall_score || 0;
  const productSpecs = formatSpecs(reviewDetail?.product_specs);
  const galleryImages = reviewDetail?.gallery || [];

  return (
    <div className="bg-white min-h-screen">
      {/* Header with Featured Image */}
      <header className="relative">
        {article.featured_image ? (
          <div className="w-full h-80 md:h-96 lg:h-[500px] overflow-hidden relative">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full">
              <div className="content-container">
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
                    {award && (
                      <Badge variant="award" className="flex items-center gap-1 px-4 py-2 text-sm shadow-lg">
                        <Award className="h-4 w-4" />
                        <span>{award}</span>
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="content-container py-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">{article.title}</h1>
            {article.published_at && (
              <p className="text-gray-500 mb-2">
                Published {formatDate(article.published_at)}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="content-container py-12">
        {/* Award Banner - placed prominently at the top */}
        <AwardBanner award={award} />

        {/* Description */}
        {article.description && (
          <div className="text-xl text-gray-600 mb-8" dangerouslySetInnerHTML={{ __html: article.description }} />
        )}

        {/* Review Content Tabs */}
        <Tabs defaultValue="overview" className="mb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            {galleryImages.length > 0 && (
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            )}
            {productSpecs.length > 0 && (
              <TabsTrigger value="specs">Specifications</TabsTrigger>
            )}
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="animate-fade-in">
            {article.content && (
              <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
            )}
            
            {/* Rating Criteria */}
            {article.rating_criteria && article.rating_criteria.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Rating Breakdown</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {article.rating_criteria.map((criterion, index) => (
                    <Card key={criterion.name || index} className="overflow-hidden">
                      <div className={`h-2 ${
                        criterion.score >= 8 ? "bg-green-500" : 
                        criterion.score >= 6 ? "bg-amber-500" : "bg-red-500"
                      }`} style={{ width: `${criterion.score * 10}%` }}></div>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{criterion.name}</span>
                          <span className="text-lg font-bold">{criterion.score.toFixed(1)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Details Tab */}
          <TabsContent value="details" className="animate-fade-in">
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h2 className="text-2xl font-bold mb-6">Pros</h2>
                <ul className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <li key={`pro-${i}`} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Pro point {i} (example)</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-6">Cons</h2>
                <ul className="space-y-2">
                  {[1, 2].map((i) => (
                    <li key={`con-${i}`} className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Con point {i} (example)</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </TabsContent>
          
          {/* Gallery Tab */}
          {galleryImages.length > 0 && (
            <TabsContent value="gallery" className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Product Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
          
          {/* Specifications Tab */}
          {productSpecs.length > 0 && (
            <TabsContent value="specs" className="animate-fade-in">
              <h2 className="text-2xl font-bold mb-6">Technical Specifications</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <table className="w-full">
                  <tbody>
                    {productSpecs.map((spec, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                        <td className="py-3 px-4 font-medium">{spec.key}</td>
                        <td className="py-3 px-4">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};
