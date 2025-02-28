
import { useState, useEffect } from 'react';
import { Laptop, Smartphone, Gamepad, Brain, Award, Star, Calendar, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
}

interface Review extends BaseContent {
  type: 'review';
  rating: number;
}

interface Article extends BaseContent {
  type: 'article';
}

type ContentItem = Review | Article;

const categories = [
  {
    id: 1,
    name: "Smartphones",
    icon: Smartphone,
    path: "/smartphones"
  },
  {
    id: 2,
    name: "Laptops",
    icon: Laptop,
    path: "/laptops"
  },
  {
    id: 3,
    name: "Gaming",
    icon: Gamepad,
    path: "/gaming"
  },
  {
    id: 4,
    name: "AI & Software",
    icon: Brain,
    path: "/ai"
  }
];

const ContentPreview = ({ item }: { item: ContentItem }) => {
  return (
    <article className="review-card overflow-hidden animate-fade-in bg-white rounded-lg shadow-md h-full">
      <div className="relative">
        <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
        {item.award && (
          <div className="absolute top-2 right-2">
            <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 shadow-md">
              <Award className="h-3.5 w-3.5" />
              <span>{item.award}</span>
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

const FeaturedContentTabs = () => {
  const [activeTab, setActiveTab] = useState<'reviews' | 'articles'>('reviews');
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [articlesData, setArticlesData] = useState<Article[]>([]);
  
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
              overall_score
            )
          )
        `)
        .order('position');

      if (error) {
        console.error("Error fetching featured content:", error);
        return { reviews: [], articles: [] };
      }

      // Transform the data into our content structure
      const reviews: Review[] = [];
      const articles: Article[] = [];

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
            if (settings && typeof settings === 'object' && 'award' in settings) {
              award = settings.award as string;
            }
          } catch (e) {
            console.error("Error parsing layout_settings:", e);
          }
        }
        
        // Base content structure
        const baseItem = {
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
          award: award // Include award information
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
          reviews.push(review);
        } else if (content.type === 'article') {
          const article: Article = {
            ...baseItem,
            type: 'article'
          };
          articles.push(article);
        }
      });

      return { reviews, articles };
    }
  });

  // Update state when data is fetched
  useEffect(() => {
    if (featuredContent) {
      setReviewsData(featuredContent.reviews);
      setArticlesData(featuredContent.articles);
    }
  }, [featuredContent]);

  // Use empty placeholders when loading
  const activeData = activeTab === 'reviews' ? reviewsData : articlesData;
  const mainFeatured = activeData[0] || null;
  const secondaryFeatured = activeData.slice(1) || [];

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="content-container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Content</h2>
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <Button 
                variant={activeTab === 'reviews' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('reviews')}
                className={activeTab === 'reviews' ? 'bg-blue-600' : ''}
              >
                Reviews
              </Button>
              <Button 
                variant={activeTab === 'articles' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('articles')}
                className={activeTab === 'articles' ? 'bg-blue-600' : ''}
              >
                Articles
              </Button>
            </div>
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
            <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
              <Button 
                variant={activeTab === 'reviews' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('reviews')}
                className={activeTab === 'reviews' ? 'bg-blue-600' : ''}
              >
                Reviews
              </Button>
              <Button 
                variant={activeTab === 'articles' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('articles')}
                className={activeTab === 'articles' ? 'bg-blue-600' : ''}
              >
                Articles
              </Button>
            </div>
          </div>
          
          <div className="h-40 flex items-center justify-center">
            <div className="text-gray-500">No featured {activeTab} available</div>
          </div>
          
          {/* View All Button */}
          <div className="mt-8 text-center">
            <Button 
              asChild
              variant="outline" 
              className="border-blue-600 text-blue-600 hover:bg-blue-50"
            >
              <Link to={`/${activeTab}`}>
                View all {activeTab}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="content-container">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Featured Content</h2>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <Button 
              variant={activeTab === 'reviews' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('reviews')}
              className={activeTab === 'reviews' ? 'bg-blue-600' : ''}
            >
              Reviews
            </Button>
            <Button 
              variant={activeTab === 'articles' ? 'default' : 'ghost'} 
              onClick={() => setActiveTab('articles')}
              className={activeTab === 'articles' ? 'bg-blue-600' : ''}
            >
              Articles
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Main Featured Item */}
          <article className="md:col-span-8 review-card animate-fade-in rounded-xl overflow-hidden shadow-xl">
            {/* Fix the routing by adding the categorySlug */}
            <Link to={`/${mainFeatured.categorySlug}/content/${mainFeatured.slug}`} className="block">
              <div className="relative">
                <img src={mainFeatured.image} alt={mainFeatured.title} className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                
                {/* Award Badge */}
                {mainFeatured.award && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge variant="award" className="flex items-center gap-1 px-4 py-2 text-sm shadow-lg">
                      <Award className="h-4 w-4" />
                      <span>{mainFeatured.award}</span>
                    </Badge>
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="category-tag mb-4">{mainFeatured.category}</div>
                  <h2 className="text-4xl font-bold mb-3">{mainFeatured.title}</h2>
                  <div className="text-gray-200 text-lg mb-4" dangerouslySetInnerHTML={{ __html: mainFeatured.excerpt }}></div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{mainFeatured.author}</span>
                    <span>•</span>
                    <span>{mainFeatured.readTime}</span>
                    {mainFeatured.type === 'review' && (
                      <>
                        <span>•</span>
                        <span className="bg-orange-500 px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {(mainFeatured as Review).rating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </article>

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
        
        {/* View All Button */}
        <div className="mt-8 text-center">
          <Button 
            asChild
            variant="outline" 
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Link to={`/${activeTab}`}>
              View all {activeTab}
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
            overall_score
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
            if (settings && typeof settings === 'object' && 'award' in settings) {
              award = settings.award as string;
            }
          } catch (e) {
            console.error("Error parsing layout_settings:", e);
          }
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
          award: award
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
      {/* Hero Section with improved gradients and animations */}
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

      {/* Featured Content Section with Tabs */}
      <FeaturedContentTabs />

      {/* Categories with improved card design */}
      <section className="py-16 bg-gray-50">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-12 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={category.id} 
                className="border-none hover:shadow-xl transition-all duration-300 animate-fade-in hover:translate-y-[-5px] group"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <Link to={category.path} className="block p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                      <category.icon size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">{category.name}</h3>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
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
            {topRatedReviews.slice(0, 3).map((review, index) => (
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
                  {review.award && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="award" className="flex items-center gap-1 px-3 py-1.5 shadow-md">
                        <Award className="h-3.5 w-3.5" />
                        <span>{review.award}</span>
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
                <CardContent className="p-6">
                  <Link to={`/${review.categorySlug}/content/${review.slug}`}>
                    <h3 className="text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{review.title}</h3>
                  </Link>
                  <p className="text-gray-600 line-clamp-2">{review.excerpt}</p>
                </CardContent>
                <CardFooter className="px-6 pb-6 pt-0 flex justify-between items-center">
                  <span className="text-sm text-gray-500">{review.readTime}</span>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/${review.categorySlug}/content/${review.slug}`}>
                      Read Review
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
