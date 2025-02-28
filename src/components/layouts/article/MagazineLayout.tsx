
import { Link } from "react-router-dom";
import { Star, Calendar, User, BookOpen, Share2, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface MagazineLayoutProps {
  article: ArticleData;
}

export const MagazineLayout = ({ article }: MagazineLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [readingTime, setReadingTime] = useState("8 min");

  useEffect(() => {
    const fetchAuthorProfile = async () => {
      if (article.author_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', article.author_id)
          .single();
        
        if (!error && data) {
          setAuthorProfile(data);
        }
      }
    };

    const fetchRelatedArticles = async () => {
      // In a real app, we would fetch related articles based on tags, categories, etc.
      const { data, error } = await supabase
        .from('content')
        .select('id, title, description, featured_image, published_at, type, review_details(*)')
        .eq('status', 'published')
        .neq('id', article.id)
        .limit(6);
      
      if (!error && data) {
        setRelatedArticles(data);
      }
    };

    // Calculate reading time (roughly)
    const calculateReadingTime = () => {
      if (article.content) {
        // Remove HTML tags
        const text = article.content.replace(/<[^>]*>/g, '');
        // Average reading speed: 200-250 words per minute
        const words = text.split(/\s+/).length;
        const minutes = Math.ceil(words / 200);
        setReadingTime(`${minutes} min read`);
      }
    };

    fetchAuthorProfile();
    fetchRelatedArticles();
    calculateReadingTime();
  }, [article]);

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (authorProfile?.display_name) {
      return authorProfile.display_name
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase();
    }
    return authorProfile?.email ? authorProfile.email.substring(0, 2).toUpperCase() : 'AU';
  };

  return (
    <article className="pb-12">
      {/* Hero Banner - full width with immersive design */}
      <div className="relative w-full mb-8 md:mb-16 h-[60vh] md:h-[80vh] min-h-[400px] md:min-h-[600px]">
        {article.featured_image ? (
          <img
            src={article.featured_image}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content container with responsive positioning */}
        <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 lg:px-24 py-12 md:py-20">
          <div className="max-w-5xl mx-auto">
            {/* Category tag */}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-full">
                {article.type === "review" ? "Product Review" : "Featured Article"}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-base md:text-xl text-white/90 mb-6 leading-relaxed max-w-3xl">
                {article.description}
              </p>
            )}
            
            {/* Article metadata with enhanced styling */}
            <div className="flex flex-wrap items-center gap-5 text-white/80 mb-4 text-sm">
              {article.published_at && (
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(article.published_at), 'MMMM d, yyyy')}
                </span>
              )}
              
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {readingTime}
              </span>
              
              {article.type === "review" && article.review_details?.[0]?.overall_score && (
                <span className="flex items-center gap-1 text-amber-400 font-medium">
                  <Star className="h-4 w-4 fill-current" />
                  {article.review_details[0].overall_score.toFixed(1)}
                </span>
              )}
            </div>
            
            {/* Author information in hero */}
            {authorProfile && (
              <div className="flex items-center gap-3 text-white">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                  <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{authorProfile.display_name || authorProfile.email}</div>
                  <div className="text-xs text-white/70">
                    {authorProfile.title || "Writer"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6">
        {/* Content grid - main content + featured aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Main content column */}
          <div className="lg:col-span-8">
            {/* Social sharing buttons */}
            <div className="flex justify-end mb-8 space-x-2">
              <Button variant="outline" size="sm" className="rounded-full">
                <Heart className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Save</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                <Share2 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Share</span>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Comment</span>
              </Button>
            </div>
            
            {/* Highlighted intro paragraph - pull quote style */}
            <div className="mb-10 border-l-4 border-blue-500 pl-6 py-2 italic text-xl text-gray-600">
              {article.description || "An in-depth look at this fascinating topic that will change how you view the world."}
            </div>
            
            {/* Main article content */}
            <div className="prose prose-lg max-w-none mb-10">
              {article.type === "review" && article.review_details?.[0]?.youtube_url && (
                <div className="aspect-video mb-8 rounded-lg overflow-hidden">
                  <iframe
                    src={article.review_details[0].youtube_url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              <span className="text-sm text-gray-500 mr-2">Related Topics:</span>
              <a href="#" className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition">#technology</a>
              <a href="#" className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition">#design</a>
              <a href="#" className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700 hover:bg-gray-200 transition">#productivity</a>
            </div>
          </div>
          
          {/* Sidebar column */}
          <div className="lg:col-span-4">
            {/* Author card */}
            {authorProfile && (
              <Card className="mb-8 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 h-24"></div>
                <CardContent className="pt-0 relative">
                  <Avatar className="h-20 w-20 absolute -top-10 left-1/2 transform -translate-x-1/2 border-4 border-white">
                    <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || authorProfile.email} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">{getInitials()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="pt-12 text-center mb-4">
                    <h3 className="font-bold text-lg">{authorProfile.display_name || authorProfile.email}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {authorProfile.bio || "Writer and content creator passionate about technology."}
                    </p>
                  </div>
                  
                  <div className="flex justify-center gap-3 mb-4">
                    <a href="#" className="text-gray-400 hover:text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-violet-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    </a>
                  </div>
                  
                  <Button className="w-full" variant="outline">Follow</Button>
                </CardContent>
              </Card>
            )}
            
            {/* Newsletter signup */}
            <Card className="mb-8 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Subscribe to our Newsletter</h3>
                <p className="text-sm text-gray-600 mb-4">Get the latest articles and news delivered to your inbox.</p>
                
                <div className="space-y-2">
                  <input 
                    type="email" 
                    placeholder="Your email address" 
                    className="w-full px-3 py-2 rounded-md border text-sm"
                  />
                  <Button className="w-full">Subscribe</Button>
                </div>
              </CardContent>
            </Card>
            
            {/* If review - show specs summary */}
            {article.type === "review" && article.review_details?.[0]?.product_specs && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4">Quick Specs</h3>
                  <div className="space-y-2">
                    {Object.entries(article.review_details[0].product_specs).map(([key, value], index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        
        {/* Related articles grid section */}
        {relatedArticles.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">More Articles You May Like</h2>
              <Link to="/" className="text-blue-600 hover:underline flex items-center">
                View all <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((relatedArticle) => (
                <Card key={relatedArticle.id} className="overflow-hidden group">
                  <Link to={`/${relatedArticle.id}`} className="block">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img 
                        src={relatedArticle.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-6">
                    {relatedArticle.type === "review" && relatedArticle.review_details?.[0]?.overall_score && (
                      <div className="flex items-center text-amber-500 mb-2">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="ml-1 text-sm font-medium">
                          {relatedArticle.review_details[0].overall_score.toFixed(1)}
                        </span>
                      </div>
                    )}
                    
                    <Link to={`/${relatedArticle.id}`} className="block group-hover:text-blue-600 transition-colors">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{relatedArticle.title}</h3>
                    </Link>
                    
                    {relatedArticle.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {relatedArticle.description}
                      </p>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {relatedArticle.published_at && format(new Date(relatedArticle.published_at), 'MMM d, yyyy')}
                      </span>
                      <Link to={`/${relatedArticle.id}`} className="text-blue-600 hover:underline flex items-center">
                        Read more <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {/* Additional article previews in magazine style */}
        {relatedArticles.length > 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Editor's Choice</h3>
              {relatedArticles.length > 3 && (
                <div className="grid grid-cols-1 gap-6">
                  {relatedArticles.slice(3, 5).map((article) => (
                    <Card key={article.id} className="overflow-hidden">
                      <div className="sm:flex">
                        <div className="sm:w-1/3 flex-shrink-0">
                          <img 
                            src={article.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                            alt={article.title}
                            className="w-full h-full object-cover aspect-[4/3] sm:aspect-auto"
                          />
                        </div>
                        <CardContent className="p-5 sm:w-2/3">
                          <h3 className="font-bold text-lg mb-2 hover:text-blue-600 transition-colors">
                            <Link to={`/${article.id}`}>{article.title}</Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {article.description}
                          </p>
                          <div className="text-sm text-gray-500">
                            {article.published_at && format(new Date(article.published_at), 'MMMM d, yyyy')}
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-4 border-b pb-2">Quick Reads</h3>
              <div className="space-y-4">
                {relatedArticles.slice(5, 8).map((article) => (
                  <div key={article.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden">
                      <img 
                        src={article.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition-colors">
                        <Link to={`/${article.id}`}>{article.title}</Link>
                      </h4>
                      <div className="text-xs text-gray-500">
                        {article.published_at && format(new Date(article.published_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Footer call-to-action */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ready to dive deeper?</h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Join our community of readers and get exclusive access to more articles, early previews, and special offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">Sign Up Now</Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
