
import { Laptop, Smartphone, Gamepad, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { id: 1, name: "Smartphones", icon: Smartphone, path: "/smartphones" },
  { id: 2, name: "Laptops", icon: Laptop, path: "/laptops" },
  { id: 3, name: "Gaming", icon: Gamepad, path: "/gaming" },
  { id: 4, name: "AI & Software", icon: Brain, path: "/ai" },
];

const featuredReviews = [
  {
    id: 1,
    title: "iPhone 15 Pro Review",
    category: "Smartphones",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
    excerpt: "Apple's latest flagship redefines mobile photography",
  },
  {
    id: 2,
    title: "MacBook Pro M3 Max",
    category: "Laptops",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    excerpt: "The most powerful MacBook yet",
  },
  {
    id: 3,
    title: "PS5 Pro Analysis",
    category: "Gaming",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    excerpt: "Next-gen gaming reaches new heights",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="content-container">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">Tech365</h1>
            <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Your daily dose of technology reviews, insights, and innovations
            </p>
          </div>
        </section>

        {/* Featured Reviews */}
        <section className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main Featured Article */}
            <article className="md:col-span-8 glass-panel animate-fade-in overflow-hidden">
              <img 
                src={featuredReviews[0].image}
                alt={featuredReviews[0].title}
                className="w-full h-[400px] object-cover"
              />
              <div className="p-6">
                <div className="category-tag mb-4">{featuredReviews[0].category}</div>
                <h2 className="text-3xl font-bold mb-3">{featuredReviews[0].title}</h2>
                <p className="text-gray-600 text-lg">{featuredReviews[0].excerpt}</p>
              </div>
            </article>

            {/* Secondary Features */}
            <div className="md:col-span-4 space-y-8">
              {featuredReviews.slice(1).map((review, index) => (
                <article 
                  key={review.id}
                  className="glass-panel overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img 
                    src={review.image}
                    alt={review.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="category-tag mb-2">{review.category}</div>
                    <h3 className="text-xl font-bold mb-2">{review.title}</h3>
                    <p className="text-gray-600">{review.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 border-t">
          <h2 className="text-2xl font-bold mb-8 animate-fade-in">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link 
                key={category.id}
                to={category.path}
                className="p-6 border rounded-lg hover:bg-gray-50 transition-colors animate-fade-in flex items-center space-x-3"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <category.icon size={24} className="text-orange-500" />
                <span className="font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
