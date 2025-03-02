
import { useState, useEffect } from 'react';
import { Laptop, Smartphone, Gamepad, Brain, Award, Star, Calendar, FileText, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

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
  categorySlug?: string;
  award?: string | null;
  youtubeUrl?: string | null;
}

interface Review extends BaseContent {
  type: 'review';
  rating: number;
}

interface Article extends BaseContent {
  type: 'article';
}

type ContentItem = Review | Article;

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

const ContentPreview = ({ item }: { item: ContentItem }) => {
  const formattedAward = item.award ? getAwardDisplayName(item.award) : null;

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow h-full">
      <Link to={`/${item.categorySlug}/content/${item.slug}`} className="block h-full">
        <div className="relative aspect-video">
          <img 
            src={item.image} 
            alt={item.title} 
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {formattedAward && (
            <div className="absolute top-2 right-2">
              <Badge variant="award" className="flex items-center gap-1 px-2 py-1 text-xs shadow-sm">
                <Award className="h-3 w-3" />
                <span>{formattedAward}</span>
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              item.type === 'review' 
                ? "bg-purple-100 text-purple-700" 
                : "bg-blue-100 text-blue-700"
            }`}>
              {item.type === 'review' ? "Review" : "Article"}
            </span>
            {item.type === 'review' && (
              <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                <Star className="h-3 w-3 fill-current" />
                {item.rating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold mb-1 line-clamp-2">{item.title}</h3>
          <div className="text-sm text-gray-600 line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: item.excerpt }} />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {item.readTime}
            </span>
            <span className="text-blue-600 flex items-center gap-1">
              Read more <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

const FeaturedContent = () => {
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [visibleItems, setVisibleItems] = useState(8);

  const { data: featuredContent, isLoading } = useQuery({
    queryKey: ['featuredContent'],
    queryFn: async () => {
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
      
      // Filter out any items where content is null
      const validData = data.filter(item => item.content);
      
      const transformedContent: ContentItem[] = validData
        .map(item => {
          // Safely destructure content with default values to prevent null reference errors
          const { 
            id = '',
            title = '',
            description = '',
            featured_image = '',
            type = 'article',
            review_details = []
          } = item.content || {};
          
          // Create safe base content object
          const baseContent: BaseContent = {
            id,
            title,
            category: 'Technology', // Default category
            image: featured_image || 'https://images.unsplash.com/photo-1661956602944-249bcd04b63f',
            excerpt: description || 'No description available',
            author: 'Tech Writer',
            readTime: '5 min read',
            type: type as 'review' | 'article',
            slug: id,
            categorySlug: 'technology',
            award: type === 'review' ? 'editors-choice' : null,
          };
          
          // For reviews, add rating information
          if (type === 'review') {
            const firstReview = Array.isArray(review_details) && review_details.length > 0 
              ? review_details[0] 
              : { overall_score: 4.5, youtube_url: null };
            
            return {
              ...baseContent,
              type: 'review' as const,
              rating: firstReview.overall_score || 4.5,
              youtubeUrl: firstReview.youtube_url
            };
          }
          
          // For articles
          return {
            ...baseContent,
            type: 'article' as const
          };
        });

      console.log("Transformed content:", transformedContent);

      return transformedContent.sort((a, b) => {
        if (a.type === 'review' && b.type !== 'review') return -1;
        if (a.type !== 'review' && b.type === 'review') return 1;
        if (a.type === 'review' && b.type === 'review') {
          return (b as Review).rating - (a as Review).rating;
        }
        return 0;
      });
    }
  });

  useEffect(() => {
    if (featuredContent && featuredContent.length > 0) {
      setAllContent(featuredContent);
    } else if (!isLoading && (!featuredContent || featuredContent.length === 0)) {
      // Fallback mock data if no featured content is available
      const mockContent: ContentItem[] = [
        {
          id: 'mock-1',
          title: 'Dell XPS 13 Plus Review',
          category: 'Laptops',
          image: 'https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf',
          excerpt: 'The latest Dell XPS 13 Plus brings innovative design and powerful performance.',
          author: 'Tech Reviewer',
          readTime: '8 min read',
          type: 'review',
          slug: 'dell-xps-13-plus-review',
          categorySlug: 'technology',
          rating: 4.7,
          award: 'editors-choice'
        },
        {
          id: 'mock-2',
          title: 'The Future of AI in Consumer Tech',
          category: 'Technology',
          image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
          excerpt: 'How artificial intelligence is changing the landscape of consumer technology.',
          author: 'AI Specialist',
          readTime: '6 min read',
          type: 'article',
          slug: 'future-of-ai-consumer-tech',
          categorySlug: 'technology'
        }
      ];
      
      // Add more mock items to have a decent amount for display
      const expandedMock = [...mockContent];
      for (let i = 3; i <= 8; i++) {
        expandedMock.push(
          i % 2 === 0 
            ? {
                id: `mock-${i}`,
                title: `Latest Gaming Laptop Review ${i}`,
                category: 'Gaming',
                image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
                excerpt: 'Reviewing the latest gaming laptop with cutting-edge graphics and performance.',
                author: 'Gaming Expert',
                readTime: '7 min read',
                type: 'review',
                slug: `gaming-laptop-review-${i}`,
                categorySlug: 'technology',
                rating: 4.2 + (i / 10),
              }
            : {
                id: `mock-${i}`,
                title: `Tech Trends ${2023 + i}`,
                category: 'Technology',
                image: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
                excerpt: 'Exploring the emerging technology trends to watch this year.',
                author: 'Trend Analyst',
                readTime: '5 min read',
                type: 'article',
                slug: `tech-trends-${2023 + i}`,
                categorySlug: 'technology',
              }
        );
      }
      
      setAllContent(expandedMock);
    }
  }, [featuredContent, isLoading]);

  // Handle the case when allContent is still empty
  if (allContent.length === 0) {
    return (
      <section className="py-12 bg-white">
        <div className="content-container">
          <div className="text-center py-12">
            <p className="text-gray-500">Loading featured content...</p>
          </div>
        </div>
      </section>
    );
  }

  const mainFeatured = allContent[0] || null;
  const secondaryFeatured = allContent.slice(1, 5);
  const remainingContent = allContent.slice(5);

  return (
    <section className="py-12 bg-white">
      <div className="content-container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold">Featured Content</h2>
          <div className="flex gap-3">
            <Button asChild variant="ghost" className="text-blue-600 hover:bg-blue-50 gap-1 px-3">
              <Link to="/reviews">
                All Reviews <span className="text-gray-400">→</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" className="text-purple-600 hover:bg-purple-50 gap-1 px-3">
              <Link to="/articles">
                All Articles <span className="text-gray-400">→</span>
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {mainFeatured && (
            <article className="md:col-span-7 rounded-lg overflow-hidden shadow-lg">
              <Link to={`/${mainFeatured.categorySlug}/content/${mainFeatured.slug}`} className="block">
                <div className="relative">
                  <img 
                    src={mainFeatured.image} 
                    alt={mainFeatured.title} 
                    className="w-full h-[400px] object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  {mainFeatured.award && (
                    <div className="absolute top-4 right-4">
                      <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 text-sm">
                        <Award className="h-4 w-4" />
                        {getAwardDisplayName(mainFeatured.award)}
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mainFeatured.type === 'review' 
                          ? "bg-purple-600" 
                          : "bg-blue-600"
                      }`}>
                        {mainFeatured.type === 'review' ? "Review" : "Article"}
                      </span>
                      {mainFeatured.type === 'review' && (
                        <span className="bg-amber-500 px-2 py-1 rounded-full flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3 fill-current" />
                          {(mainFeatured as Review).rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-bold mb-2 line-clamp-2">{mainFeatured.title}</h2>
                    <div className="text-gray-200 text-sm line-clamp-2" 
                      dangerouslySetInnerHTML={{ __html: mainFeatured.excerpt }} />
                  </div>
                </div>
              </Link>
            </article>
          )}

          <div className="md:col-span-5 grid grid-cols-1 gap-4">
            {secondaryFeatured.map((item) => (
              <ContentPreview key={item.id} item={item} />
            ))}
          </div>
        </div>

        {remainingContent.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4">More Content</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {remainingContent.slice(0, visibleItems).map((item) => (
                <ContentPreview key={item.id} item={item} />
              ))}
            </div>
            {visibleItems < remainingContent.length && (
              <div className="mt-6 text-center">
                <Button 
                  onClick={() => setVisibleItems(prev => prev + 8)}
                  variant="ghost"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  Load More Content
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

const Index = () => {
  const [topRatedReviews, setTopRatedReviews] = useState<Review[]>([]);

  const { data: reviewData } = useQuery({
    queryKey: ['topRatedReviews'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('content')
          .select(`
            id,
            title,
            description,
            featured_image,
            review_details(overall_score, youtube_url)
          `)
          .eq('type', 'review')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error("Error fetching top rated reviews:", error);
          return [];
        }

        // Transform the data to match our Review interface
        const reviews: Review[] = data
          .filter(item => item.review_details && item.review_details.length > 0)
          .map(item => {
            const reviewDetail = item.review_details[0];
            return {
              id: item.id,
              title: item.title || 'Untitled Review',
              category: 'Technology',
              image: item.featured_image || 'https://images.unsplash.com/photo-1661956602944-249bcd04b63f',
              excerpt: item.description || 'No description available',
              author: 'Tech Reviewer',
              readTime: '5 min read',
              type: 'review',
              slug: item.id,
              categorySlug: 'technology',
              rating: reviewDetail?.overall_score || 4.5,
              youtubeUrl: reviewDetail?.youtube_url || null
            };
          })
          .sort((a, b) => b.rating - a.rating);
        
        // If no real data, provide fallback data
        if (reviews.length === 0) {
          return [
            {
              id: 'mock-review-1',
              title: 'MacBook Pro M2 Pro Review',
              category: 'Laptops',
              image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
              excerpt: 'The definitive MacBook Pro review with M2 Pro chip benchmarks.',
              author: 'Apple Expert',
              readTime: '10 min read',
              type: 'review',
              slug: 'macbook-pro-m2-pro-review',
              categorySlug: 'technology',
              rating: 4.9
            },
            {
              id: 'mock-review-2',
              title: 'Asus ROG Zephyrus G14 Review',
              category: 'Gaming Laptops',
              image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89',
              excerpt: 'The pinnacle of AMD-powered gaming laptops in a compact form factor.',
              author: 'Gaming Reviewer',
              readTime: '8 min read',
              type: 'review',
              slug: 'asus-rog-zephyrus-g14-review',
              categorySlug: 'technology',
              rating: 4.7
            },
            {
              id: 'mock-review-3',
              title: 'Framework Laptop 13 Review',
              category: 'Laptops',
              image: 'https://images.unsplash.com/photo-1602080858428-57174f9431cf',
              excerpt: 'The most repairable and upgradeable laptop on the market gets better.',
              author: 'Hardware Expert',
              readTime: '7 min read',
              type: 'review',
              slug: 'framework-laptop-13-review',
              categorySlug: 'technology',
              rating: 4.6
            }
          ];
        }
        
        return reviews;
      } catch (error) {
        console.error("Error in topRatedReviews query:", error);
        return [];
      }
    }
  });

  useEffect(() => {
    if (reviewData) setTopRatedReviews(reviewData);
  }, [reviewData]);

  return (
    <>
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 text-white py-16">
        <div className="content-container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Tech Insights & Reviews
          </h1>
          <p className="text-lg text-gray-100 mb-8 max-w-2xl mx-auto">
            Expert analysis on the latest tech products and industry trends
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="px-6 py-3 text-base">
              <Link to="/reviews">
                Explore Reviews
              </Link>
            </Button>
            <Button asChild variant="secondary" className="px-6 py-3 text-base">
              <Link to="/articles">
                Read Articles
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <FeaturedContent />

      <section className="py-12 bg-gray-50">
        <div className="content-container">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold">Top-Rated Products</h2>
            <Button asChild variant="ghost" className="text-blue-600 hover:bg-blue-50 gap-1 px-3">
              <Link to="/reviews">
                All Reviews <span className="text-gray-400">→</span>
              </Link>
            </Button>
          </div>
          
          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide">
            {topRatedReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="min-w-[300px] flex-1">
                <Card className="h-full">
                  <Link to={`/${review.categorySlug}/content/${review.slug}`}>
                    <div className="aspect-video relative">
                      <img 
                        src={review.image} 
                        className="object-cover h-full w-full"
                        loading="lazy"
                        alt={review.title}
                      />
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-purple-600 flex items-center gap-1 text-xs">
                          <Star className="h-3 w-3" />
                          {review.rating.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 mb-2">{review.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{review.excerpt}</p>
                    </CardContent>
                  </Link>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
