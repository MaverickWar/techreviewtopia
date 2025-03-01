import { useState, useEffect } from 'react';
import { Laptop, Smartphone, Gamepad, Brain, Award, Star, Calendar, FileText, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

// Define proper interfaces for our content types
interface BaseContent {
  id: string;
  title: string;
  category: string;
  image: string;
  excerpt: string;
  author: string;
  readTime: string;
  type: 'review' | 'article';
  slug: string;
  categorySlug?: string; // Add categorySlug for routing
  award?: string | null; // Add award property
  youtubeUrl?: string | null; // Add youtubeUrl property
}

interface Review extends BaseContent {
  type: 'review';
  rating: number;
}

interface Article extends BaseContent {
  type: 'article';
}

type ContentItem = Review | Article;

// Helper function to extract YouTube video ID
const extractYoutubeVideoId = (url: string | null): string | null => {
  if (!url) return null;
  
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(youtubeRegex);
  return match ? match[1] : null;
};

const ContentPreview = ({ item }: { item: ContentItem }) => {
  // Format award for display if one exists
  const getAwardDisplayName = (awardValue: string): string => {
    const awardMap: Record<string, string> = {
      "editors-choice": "Editor's Choice",
      "best-value": "Best Value",
      "best-performance": "Best Performance",
      "highly-recommended": "Highly Recommended",
      "budget-pick": "Budget Pick",
      "premium-choice": "Premium Choice",
      "most-innovative": "Most Innovative"
    };
    
    return awardMap[awardValue] || awardValue
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const formattedAward = item.award ? getAwardDisplayName(item.award) : null;
  
  return (
    <article className="review-card overflow-hidden animate-fade-in bg-white rounded-lg shadow-md h-full">
      <div className="relative">
        <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
        {formattedAward && (
          <div className="absolute top-2 right-2">
            <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 shadow-md">
              <Award className="h-3.5 w-3.5" />
              <span>{formattedAward}</span>
            </Badge>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.type === 'review' 
              ? "bg-purple-100 text-purple-700" 
              : "bg-blue-100 text-blue-700"
          }`}>
            {item.type === 'review' ? "Review" : "Article"}
          </span>
          {item.type === 'review' && (
            <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
              <Star className="h-4 w-4 fill-current" />
              {item.rating.toFixed(1)}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold mb-2 text-gray-800 line-clamp-2">{item.title}</h3>
        <div className="text-gray-600 mb-4 line-clamp-2" dangerouslySetInnerHTML={{ __html: item.excerpt }}></div>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {item.readTime}
          </span>
        </div>
      </div>
    </article>
  );
};

const FeaturedContent = () => {
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  
  // Fetch featured content from Supabase
  const { data: featuredContent, isLoading } = useQuery({
    queryKey: ['featuredContent'],
    queryFn: async () => {
      // Fetch featured content from featured_content table which links to content
      const { data, error } = await supabase
        .from('featured_content')
        .select(`
          id,
          position,
          content:content_id (
            id,
            title,
            type,
            description,
            featured_image,
            status,
            published_at,
            author_id,
            layout_settings,
            review_details (
              overall_score,
              youtube_url
            )
          )
        `)
        .order('position');

      if (error) {
        console.error("Error fetching featured content:", error);
        return [];
      }

      // Transform the data into our content structure
      const transformedContent: ContentItem[] = [];

      // Process and organize the data
      data?.forEach(item => {
        if (!item.content) return;
        
        const content = item.content;
        
        // Get award from layout_settings if it exists
        let award: string | null = null;
        
        // Safely parse layout_settings to extract award property
        if (content.layout_settings) {
          try {
            // If layout_settings is a string, parse it
            const settings = typeof content.layout_settings === 'string'
              ? JSON.parse(content.layout_settings)
              : content.layout_settings;
              
            // Check if settings is an object and has award property
            if (settings && typeof settings === 'object' && ('award' in settings || 'awardLevel' in settings)) {
              award = settings.award || settings.awardLevel;
            }
          } catch (e) {
            console.error("Error parsing layout_settings:", e);
          }
        }
        
        // Extract YouTube URL if available (for reviews)
        let youtubeUrl: string | null = null;
        if (content.review_details && 
            Array.isArray(content.review_details) && 
            content.review_details.length > 0 &&
            content.review_details[0].youtube_url) {
          youtubeUrl = content.review_details[0].youtube_url;
        }
        
        // Base content structure
        const baseItem: BaseContent = {
          id: content.id,
          title: content.title,
          category: "Technology", // Default category, would come from category relationship
          categorySlug: "technology", // Default category slug for routing
          image: content.featured_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
          excerpt: content.description || "No description available",
          author: "Tech Team", // Would come from author relationship
          readTime: "5 min read", // Would be calculated
          slug: content.id, // Using ID as slug for now
          type: content.type as 'review' | 'article',
          award: award, // Include award information
          youtubeUrl: youtubeUrl // Include YouTube URL if available
        };

        // Add to appropriate array based on type
        if (content.type === 'review') {
          // Fix the specific error - properly handling null and undefined values
          let score = 0;
          
          // Check if review_details exists and has items
          if (content.review_details && 
              Array.isArray(content.review_details) && 
              content.review_details.length > 0) {
            
            // Get the first review detail safely
            const reviewDetail = content.review_details[0];
            
            // Check if reviewDetail exists and has overall_score property
            if (reviewDetail && 
                typeof reviewDetail === 'object' && 
                reviewDetail !== null && 
                'overall_score' in reviewDetail && 
                reviewDetail.overall_score !== null) {
              
              // Convert to number with fallback to 0
              score = Number(reviewDetail.overall_score) || 0;
            }
          }
          
          const review: Review = {
            ...baseItem,
            type: 'review',
            rating: score
          };
          transformedContent.push(review);
        } else if (content.type === 'article') {
          const article: Article = {
            ...baseItem,
            type: 'article'
          };
          transformedContent.push(article);
        }
      });

      // Sort the combined array
      return transformedContent.sort((a, b) => {
        // Sort by type first (reviews first)
        if (a.type === 'review' && b.type !== 'review') return -1;
        if (a.type !== 'review' && b.type === 'review') return 1;
        
        // Then sort by rating for reviews
        if (a.type === 'review' && b.type === 'review') {
          return (b as Review).rating - (a as Review).rating;
        }
        
        return 0;
      });
    }
  });

  // Update state when data is fetched
  useEffect(() => {
    if (featuredContent) {
      setAllContent(featuredContent);
    }
  }, [featuredContent]);

  // Use empty placeholders when loading
  const mainFeatured = allContent[0] || null;
  const secondaryFeatured = allContent.slice(1, 5) || [];
  const remainingContent = allContent.slice(5) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="content-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Content</h2>
          </div>
          
          <div className="h-96 flex items-center justify-center">
            <div className="text-gray-500">Loading featured content...</div>
          </div>
        </div>
      </section>
    );
  }

  // Handle no content case
  if (!mainFeatured) {
    return (
      <section className="py-16 bg-white">
        <div className="content-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Content</h2>
          </div>
          
          <div className="h-40 flex items-center justify-center">
            <div className="text-gray-500">No featured content available</div>
          </div>
          
          {/* View All Buttons */}
          <div className="mt-8 flex justify-center gap-4">
            <Button 
              asChild
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Link to="/reviews">
                View all reviews
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline" 
              className="border-purple-600 text-purple-600 hover:bg-purple-50"
            >
              <Link to="/articles">
                View all articles
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // Extract and format award for the main featured item
  const getAwardDisplayName = (awardValue: string): string => {
    const awardMap: Record<string, string> = {
      "editors-choice": "Editor's Choice",
      "best-value": "Best Value",
      "best-performance": "Best Performance",
      "highly-recommended": "Highly Recommended",
      "budget-pick": "Budget Pick",
      "premium-choice": "Premium Choice",
      "most-innovative": "Most Innovative"
    };
    
    return awardMap[awardValue] || awardValue
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formattedMainAward = mainFeatured?.award ? getAwardDisplayName(mainFeatured.award) : null;

  return (
    <section className="py-16 bg-white">
      <div className="content-container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Content</h2>
          <div className="flex space-x-2">
            <Link to="/reviews" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
              All reviews
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link to="/articles" className="text-purple-600 hover:text-purple-800 flex items-center gap-1">
              All articles
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Featured Item */}
          {mainFeatured && (
            <article className="md:col-span-8 review-card animate-fade-in rounded-xl overflow-hidden shadow-xl">
              {/* Fix the routing by adding the categorySlug */}
              <Link to={`/${mainFeatured.categorySlug}/content/${mainFeatured.slug}`} className="block">
                <div className="relative">
                  <img src={mainFeatured.image} alt={mainFeatured.title} className="w-full h-[500px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  
                  {/* Award Badge with properly formatted name */}
                  {formattedMainAward && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="award" className="flex items-center gap-1 px-4 py-2 text-sm shadow-lg">
                        <Award className="h-4 w-4" />
                        <span>{formattedMainAward}</span>
                      </Badge>
                    </div>
                  )}
                  
                  <div className="absolute bottom-0 left-0 p-8 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mainFeatured.type === 'review' 
                          ? "bg-purple-600 text-white" 
                          : "bg-blue-600 text-white"
                      }`}>
                        {mainFeatured.type === 'review' ? "Review" : "Article"}
                      </span>
                      {mainFeatured.type === 'review' && (
                        <span className="bg-orange-500 px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {(mainFeatured as Review).rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-4xl font-bold mb-3">{mainFeatured.title}</h2>
                    <div className="text-gray-200 text-lg mb-4" dangerouslySetInnerHTML={{ __html: mainFeatured.excerpt }}></div>
                    <div className="flex items-center gap-4 text-sm">
                      <span>{mainFeatured.author}</span>
                      <span>•</span>
                      <span>{mainFeatured.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
              
              {/* YouTube Video Preview removed */}
            </article>
          )}

          {/* Secondary Features */}
          <div className="md:col-span-4 grid grid-cols-1 gap-6">
            {secondaryFeatured.map((item) => (
              <Link 
                key={item.id} 
                to={`/${item.categorySlug}/content/${item.slug}`}
                className="block h-full"
              >
                <ContentPreview item={item} />
              </Link>
            ))}
          </div>
        </div>
        
        {/* Additional Content (Grid Layout) */}
        {remainingContent.length > 0 && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">More Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {remainingContent.map((item) => (
                <Link 
                  key={item.id} 
                  to={`/${item.categorySlug}/content/${item.slug}`}
                  className="block h-full"
                >
                  <ContentPreview item={item} />
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* View All Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button 
            asChild
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Link to="/reviews">
              View all reviews
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline" 
            className="border-purple-600 text-purple-600 hover:bg-purple-50"
          >
            <Link to="/articles">
              View all articles
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  // Define top-rated reviews data for display in the "Top-Rated Products" section
  const [topRatedReviews, setTopRatedReviews] = useState<Review[]>([]);
  
  // Fetch top-rated reviews
  const { data: reviewData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['topRatedReviews'],
    queryFn: async () => {
      // Fetch content items that are reviews, with high ratings
      const { data, error } = await supabase
        .from('content')
        .select(`
          id,
          title,
          description,
          featured_image,
          layout_settings,
          review_details (
            overall_score,
            youtube_url
          )
        `)
        .eq('type', 'review')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching top rated reviews:", error);
        return [];
      }

      // Transform to our Review type
      return data.map(item => {
        // Safely extract award from layout_settings
        let award: string | null = null;
        if (item.layout_settings) {
          try {
            // If layout_settings is a string, parse it
            const settings = typeof item.layout_settings === 'string'
              ? JSON.parse(item.layout_settings)
              : item.layout_settings;
              
            // Check if settings is an object and has award property
            if (settings && typeof settings === 'object' && ('award' in settings || 'awardLevel' in settings)) {
              award = settings.award || settings.awardLevel;
            }
          } catch (e) {
            console.error("Error parsing layout_settings:", e);
          }
        }
        
        // Extract YouTube URL if available
        let youtubeUrl: string | null = null;
        if (item.review_details && 
            Array.isArray(item.review_details) && 
            item.review_details.length > 0 &&
            item.review_details[0].youtube_url) {
          youtubeUrl = item.review_details[0].youtube_url;
        }
        
        // Get score safely
        let score = 0;
        if (item.review_details && 
            Array.isArray(item.review_details) && 
            item.review_details.length > 0 && 
            item.review_details[0].overall_score !== null) {
          score = Number(item.review_details[0].overall_score) || 0;
        }
        
        return {
          id: item.id,
          title: item.title,
          excerpt: item.description || "No description available",
          image: item.featured_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
          category: "Technology",
          categorySlug: "technology",
          author: "Tech Team",
          readTime: "5 min read",
          type: 'review' as const,
          slug: item.id,
          rating: score,
          award: award,
          youtubeUrl: youtubeUrl
        };
      });
    }
  });

  // Update top rated reviews when data is fetched
  useEffect(() => {
    if (reviewData) {
      setTopRatedReviews(reviewData);
    }
  }, [reviewData]);

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white py-20">
        <div className="content-container relative">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-400 rounded-full opacity-10 blur-3xl"></div>
          </div>
          <div className="text-center animate-fade-in max-w-4xl mx-auto relative z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Bringing you the latest
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-12">
              daily dose of technology reviews, insights, and innovations
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/reviews" className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Latest Reviews
              </Link>
              <Link to="/articles" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-3 rounded-full font-medium hover:from-orange-600 hover:to-amber-600 transition-colors shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                Top Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section with Unified Layout */}
      <FeaturedContent />

      {/* Top-Rated Products Section */}
      <section className="py-16 bg-white">
        <div className="content-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Top-Rated Products</h2>
            <Link to="/reviews" className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
              View all reviews
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRatedReviews.slice(0, 3).map((review, index) => {
              // Format award for display if one exists
              const formattedAward = review.award ? getAwardDisplayName(review.award) : null;
              
              return (
                <Card 
                  key={review.id} 
                  className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in h-full"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={review.image} 
                      alt={review.title} 
                      className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                    />
                    {formattedAward && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 shadow-md">
                          <Award className="h-3.5 w-3.5" />
                          <span>{formattedAward}</span>
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <Badge variant="default" className="bg-purple-600 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{review.rating.toFixed(1)}/10</span>
                      </Badge>
                    </div>
                  </div>
                  
                  {/* YouTube Video Preview removed */}
                  
                  <CardContent className="p-6">
                    <Link to={`/${review.categorySlug}/content/${review.slug}`}>
                      <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{review.title}</h3>
                    </Link>
                    <p className="text-gray-600 line-clamp-2">{review.excerpt}</p>
                  </CardContent>
                  <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center mt-auto">
                    <span className="text-sm text-gray-500">{review.readTime}</span>
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/${review.categorySlug}/content/${review.slug}`}>
                        Read Review
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
