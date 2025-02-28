import React, { useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArticleData } from "@/types/content";
import { Award, Check, ChevronRight, Clock, Info, Star, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { AwardBanner } from "./AwardBanner";

interface EnhancedReviewLayoutProps {
  article: ArticleData;
}

export const EnhancedReviewLayout = ({ article }: EnhancedReviewLayoutProps) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  const hasReviewDetails = article.type === "review" && article.review_details?.[0];
  const reviewDetails = hasReviewDetails ? article.review_details![0] : null;
  const overallScore = reviewDetails?.overall_score || 0;
  
  // Get the award from layout settings if it exists
  const award = article.layout_settings?.award;
  console.log("EnhancedReviewLayout received article with layout_settings:", article.layout_settings);
  console.log("Award value extracted:", award);

  // Calculate rating color based on score
  const getRatingColor = (score: number) => {
    if (score >= 8) return "bg-green-500";
    if (score >= 6) return "bg-blue-500";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <article className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{article.title}</h1>
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 mr-2" />
          <span className="text-sm text-gray-600">{article.author?.display_name || "Unknown Author"}</span>
        </div>
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 mr-2" />
          <span className="text-sm text-gray-600">{format(new Date(article.published_at || ''), 'MMMM d, yyyy')}</span>
        </div>
        <AwardBanner award={award} />
      </div>

      <div className="px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content - 8 columns on desktop */}
          <div className="lg:col-span-8">
            {article.featured_image && (
              <img src={article.featured_image} alt={article.title} className="w-full h-auto rounded-lg mb-6" />
            )}
            <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>
          
          {/* Sidebar - 4 columns on desktop */}
          <div className="lg:col-span-4">
            {hasReviewDetails && reviewDetails.product_specs && (
              <div className="bg-white shadow-lg rounded-xl overflow-hidden mb-8">
                <div className="bg-gray-100 py-3 px-6 border-b">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-500" />
                    Specifications
                  </h3>
                </div>
                <div className="p-6">
                  <table className="w-full text-sm">
                    <tbody>
                      {Object.entries(reviewDetails.product_specs).map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-100 last:border-0">
                          <td className="py-2 text-gray-600 font-medium">{key}</td>
                          <td className="py-2 text-gray-900">{String(value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
              Check Price
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
