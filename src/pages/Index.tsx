import { Laptop, Smartphone, Gamepad, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const featuredReviews = [{
  id: 1,
  title: "iPhone 15 Pro Review",
  category: "Smartphones",
  image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7",
  excerpt: "Apple's latest flagship redefines mobile photography with its groundbreaking camera system.",
  author: "Sarah Chen",
  readTime: "8 min read",
  rating: 4.5
}, {
  id: 2,
  title: "MacBook Pro M3 Max",
  category: "Laptops",
  image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  excerpt: "The most powerful MacBook yet pushes the boundaries of what's possible.",
  author: "Mike Rivera",
  readTime: "10 min read",
  rating: 4.8
}, {
  id: 3,
  title: "PS5 Pro Analysis",
  category: "Gaming",
  image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
  excerpt: "Next-gen gaming reaches new heights with unprecedented performance.",
  author: "Alex Thompson",
  readTime: "12 min read",
  rating: 4.7
}];

const Index = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="content-container">
          <div className="text-center animate-fade-in max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">Bringing you the latest</h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-12">daily dose of technology reviews, insights, and innovations</p>
            <div className="flex justify-center gap-4">
              <Link to="/reviews" className="bg-white text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors">
                Latest Reviews
              </Link>
              <Link to="/deals" className="bg-orange-500 text-white px-8 py-3 rounded-full font-medium hover:bg-orange-600 transition-colors">
                Top Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews */}
      <section className="py-16 bg-white">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-12">Featured Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Main Featured Article */}
            <article className="md:col-span-8 review-card animate-fade-in">
              <div className="relative">
                <img src={featuredReviews[0].image} alt={featuredReviews[0].title} className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                  <div className="category-tag mb-4">{featuredReviews[0].category}</div>
                  <h2 className="text-4xl font-bold mb-3">{featuredReviews[0].title}</h2>
                  <p className="text-gray-200 text-lg mb-4">{featuredReviews[0].excerpt}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{featuredReviews[0].author}</span>
                    <span>•</span>
                    <span>{featuredReviews[0].readTime}</span>
                    <span>•</span>
                    <span className="bg-orange-500 px-2 py-1 rounded">
                      {featuredReviews[0].rating}/5
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* Secondary Features */}
            <div className="md:col-span-4 space-y-8">
              {featuredReviews.slice(1).map((review, index) => (
                <article 
                  key={review.id} 
                  className="review-card overflow-hidden animate-fade-in bg-white" 
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <img src={review.image} alt={review.title} className="w-full h-48 object-cover" />
                  <div className="p-6">
                    <div className="category-tag mb-3">{review.category}</div>
                    <h3 className="text-xl font-bold mb-2">{review.title}</h3>
                    <p className="text-gray-600 mb-4">{review.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{review.readTime}</span>
                      <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="content-container">
          <h2 className="text-3xl font-bold mb-12">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                key={category.id} 
                to={category.path} 
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in group"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <category.icon size={32} className="text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
