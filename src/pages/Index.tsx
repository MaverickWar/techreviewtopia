
import { useState } from 'react';
import { Laptop, Smartphone, Gamepad, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

// This would normally come from a database query, but we'll use mock data for now
const featuredReviewsData = [{
  id: 1,
  title: "iPhone 15 Pro Review",
  category: "Smartphones",
  image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
  excerpt: "Apple's latest flagship redefines mobile photography with its groundbreaking camera system.",
  author: "Sarah Chen",
  readTime: "8 min read",
  rating: 4.5,
  type: "review",
  slug: "iphone-15-pro"
}, {
  id: 2,
  title: "MacBook Pro M3 Max",
  category: "Laptops",
  image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  excerpt: "The most powerful MacBook yet pushes the boundaries of what's possible.",
  author: "Mike Rivera",
  readTime: "10 min read",
  rating: 4.8,
  type: "review",
  slug: "macbook-pro-m3-max"
}, {
  id: 3,
  title: "PS5 Pro Analysis",
  category: "Gaming",
  image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  excerpt: "Next-gen gaming reaches new heights with unprecedented performance.",
  author: "Alex Thompson",
  readTime: "12 min read",
  rating: 4.7,
  type: "review",
  slug: "ps5-pro-review"
}];

// Mock data for articles
const featuredArticlesData = [{
  id: 101,
  title: "The Future of AI in Consumer Technology",
  category: "AI & Software",
  image: "https://images.unsplash.com/photo-1677442136019-21780ffe6085",
  excerpt: "How artificial intelligence is reshaping the devices we use every day.",
  author: "Jamie Watson",
  readTime: "6 min read",
  type: "article",
  slug: "future-of-ai-consumer-tech"
}, {
  id: 102,
  title: "5G Technology: What You Need to Know",
  category: "Networking",
  image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
  excerpt: "The next generation of mobile networks explained in simple terms.",
  author: "Taylor Kim",
  readTime: "7 min read",
  type: "article",
  slug: "5g-technology-explained"
}, {
  id: 103,
  title: "Building a Smart Home in 2023",
  category: "Smart Home",
  image: "https://images.unsplash.com/photo-1558002038-1055e2a8e5a4",
  excerpt: "The essential devices and platforms for creating an integrated smart home.",
  author: "Jordan Reed",
  readTime: "9 min read",
  type: "article",
  slug: "smart-home-guide-2023"
}];

// Combine data for the tabs
const contentData = {
  reviews: featuredReviewsData,
  articles: featuredArticlesData
};

const ContentPreview = ({ item }: { item: any }) => {
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
  
  const activeData = contentData[activeTab];
  const mainFeatured = activeData[0];
  const secondaryFeatured = activeData.slice(1);
  
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
            <Link to={`/${mainFeatured.category.toLowerCase()}/${activeTab}/${mainFeatured.slug}`} className="block">
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
                          {mainFeatured.rating}/5
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
            {secondaryFeatured.map((item, index) => (
              <Link 
                key={item.id} 
                to={`/${item.category.toLowerCase()}/${activeTab}/${item.slug}`}
                className="block"
              >
                <ContentPreview 
                  item={item} 
                />
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
