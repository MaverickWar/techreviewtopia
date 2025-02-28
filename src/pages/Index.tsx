
import { useState, useEffect } from 'react';
import { Laptop, Smartphone, Gamepad, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <article className="review-card overflow-hidden animate-fade-in bg-white">
      <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <div className="category-tag mb-3">{item.category}</div>
        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
        <p className="text-gray-600 mb-4">{item.excerpt}</p>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{item.readTime}</span>
          {item.type === 'review' && (
            <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {item.rating}/5
            </span>
          )}
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
        
        // Base content structure
        const baseItem = {
          id: content.id,
          title: content.title,
          category: "Technology", // Default category, would come from category relationship
          image: content.featured_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
          excerpt: content.description || "No description available",
          author: "Tech Team", // Would come from author relationship
          readTime: "5 min read", // Would be calculated
          slug: content.id, // Using ID as slug for now
          type: content.type as 'review' | 'article'
        };

        // Add to appropriate array based on type
        if (content.type === 'review') {
          // Fix the specific error on line 146 - convert overall_score properly
          // Ensure we're properly handling the review_details data which may be coming in different formats
          let score = 0;
          if (content.review_details && content.review_details.length > 0) {
            const reviewDetail = content.review_details[0];
            if (reviewDetail && typeof reviewDetail === 'object' && 'overall_score' in reviewDetail) {
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
          <article className="md:col-span-8 review-card animate-fade-in">
            <Link to={`/content/${mainFeatured.slug}`} className="block">
              <div className="relative">
                <img src={mainFeatured.image} alt={mainFeatured.title} className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="category-tag mb-4">{mainFeatured.category}</div>
                  <h2 className="text-4xl font-bold mb-3">{mainFeatured.title}</h2>
                  <p className="text-gray-200 text-lg mb-4">{mainFeatured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{mainFeatured.author}</span>
                    <span>•</span>
                    <span>{mainFeatured.readTime}</span>
                    {mainFeatured.type === 'review' && (
                      <>
                        <span>•</span>
                        <span className="bg-orange-500 px-2 py-1 rounded">
                          {(mainFeatured as Review).rating}/5
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </article>

          {/* Secondary Features */}
          <div className="md:col-span-4 space-y-8">
            {secondaryFeatured.map((item) => (
              <Link 
                key={item.id} 
                to={`/content/${item.slug}`}
                className="block"
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
  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="content-container">
          <div className="text-center animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Bringing you the latest</h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-12">daily dose of technology reviews, insights, and innovations</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/reviews" className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Latest Reviews
              </Link>
              <Link to="/articles" className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors">
                Top Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content Section with Tabs */}
      <FeaturedContentTabs />

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card 
                key={category.id} 
                className="border-none hover:shadow-xl transition-all duration-300 animate-fade-in"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <Link to={category.path} className="block p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                      <category.icon size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-semibold">{category.name}</h3>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
