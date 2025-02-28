
import { Link } from "react-router-dom";
import { Star, Calendar, User, BookOpen, Share, Heart, MessageSquare, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ArticleData } from "@/types/content";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ClassicLayoutProps {
  article: ArticleData;
}

export const ClassicLayout = ({ article }: ClassicLayoutProps) => {
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [popularArticles, setPopularArticles] = useState<any[]>([]);
  const [readingTime, setReadingTime] = useState("5 min");

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
      // For now, just get some sample articles
      const { data, error } = await supabase
        .from('content')
        .select('id, title, description, featured_image, published_at')
        .eq('status', 'published')
        .neq('id', article.id)
        .limit(3);
      
      if (!error && data) {
        setRelatedArticles(data);
      }
    };

    const fetchPopularArticles = async () => {
      // In a real app, we would fetch popular articles based on views, likes, etc.
      // For now, just get some sample articles
      const { data, error } = await supabase
        .from('content')
        .select('id, title, featured_image')
        .eq('status', 'published')
        .neq('id', article.id)
        .limit(5);
      
      if (!error && data) {
        setPopularArticles(data);
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
    fetchPopularArticles();
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

  // Format the published date nicely
  const formattedPublishedDate = article.published_at 
    ? format(new Date(article.published_at), 'MMMM d, yyyy')
    : null;

  // Social sharing functions (placeholder)
  const handleShare = (platform: string) => {
    console.log(`Share to ${platform}`);
    // Would implement actual sharing functionality here
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Content grid for desktop layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content area */}
        <main className="lg:col-span-8">
          {/* Article header */}
          <header className="mb-8">
            {/* Categories/tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                Technology
              </span>
              <span className="inline-block px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-800">
                Productivity
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>
            
            {article.description && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {article.description}
              </p>
            )}
            
            {/* Meta information bar */}
            <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 mb-6">
              {formattedPublishedDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formattedPublishedDate}
                </span>
              )}
              <span className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {readingTime}
              </span>
              {article.type === "review" && article.review_details?.[0]?.overall_score && (
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Star className="h-4 w-4 fill-current" />
                  {article.review_details[0].overall_score.toFixed(1)}
                </span>
              )}
            </div>
          </header>

          {/* Featured image - large and impactful */}
          {article.featured_image && (
            <figure className="mb-8 relative">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full rounded-xl overflow-hidden max-h-[500px] object-cover"
              />
              <figcaption className="text-sm text-gray-500 mt-2 italic">
                Featured image for {article.title}
              </figcaption>
            </figure>
          )}
          
          {/* Social sharing buttons - desktop position */}
          <div className="hidden md:flex items-center justify-center mb-8 space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => handleShare('twitter')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              Tweet
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => handleShare('facebook')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => handleShare('linkedin')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                // Would show a toast notification here
              }}
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>

          {/* Article content */}
          <div className="prose prose-lg max-w-none mb-8">
            {/* Article Content */}
            <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="text-sm text-gray-500 mr-2">Tags:</span>
            <a href="#" className="text-sm text-blue-600 hover:underline">#productivity</a>
            <a href="#" className="text-sm text-blue-600 hover:underline">#technology</a>
            <a href="#" className="text-sm text-blue-600 hover:underline">#design</a>
          </div>

          {/* Social interaction buttons - likes, comments, etc. */}
          <div className="flex items-center gap-6 py-4 border-t border-b border-gray-200 mb-8">
            <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition">
              <Heart className="h-5 w-5" />
              <span>42 Likes</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition">
              <MessageSquare className="h-5 w-5" />
              <span>12 Comments</span>
            </button>
            <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition md:hidden">
              <Share className="h-5 w-5" />
              <span>Share</span>
            </button>
          </div>

          {/* Author card (expanded version) */}
          {authorProfile && (
            <Card className="mb-8 overflow-hidden bg-gray-50">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-white shadow-sm">
                    <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || 'Author'} />
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">{getInitials()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center sm:text-left space-y-2">
                    <h3 className="font-semibold text-xl">{authorProfile.display_name || authorProfile.email}</h3>
                    <p className="text-gray-600">
                      {authorProfile.bio || "Writer and content creator passionate about technology and productivity."}
                    </p>
                    
                    {/* Social links */}
                    <div className="flex justify-center sm:justify-start gap-2 pt-2">
                      <a href="#" className="text-gray-400 hover:text-blue-500" aria-label="Twitter">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-blue-700" aria-label="LinkedIn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-900" aria-label="GitHub">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-violet-600" aria-label="Website">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-globe"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Related articles section (mobile only) - will show only on mobile */}
          {relatedArticles.length > 0 && (
            <div className="mb-8 lg:hidden">
              <h3 className="text-xl font-bold mb-4">You Might Also Like</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedArticles.map((relatedArticle) => (
                  <Card key={relatedArticle.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img 
                        src={relatedArticle.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold line-clamp-2 mb-2">{relatedArticle.title}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {relatedArticle.published_at && format(new Date(relatedArticle.published_at), 'MMM d, yyyy')}
                        </span>
                        <Button variant="ghost" size="sm" className="px-0" asChild>
                          <Link to={`/${relatedArticle.id}`}>
                            Read
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Comments section placeholder */}
          <div className="border-t pt-8 mb-8">
            <h3 className="text-xl font-bold mb-4">Comments (12)</h3>
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <p className="text-gray-600 mb-4">Join the conversation! Sign in to comment.</p>
              <Button>Sign In to Comment</Button>
            </div>
          </div>
        </main>
        
        {/* Sidebar - will only show on desktop */}
        <aside className="hidden lg:block lg:col-span-4 space-y-8">
          {/* Author card (sidebar version) */}
          {authorProfile && (
            <Card>
              <CardContent className="p-5">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={authorProfile.avatar_url || ''} alt={authorProfile.display_name || 'Author'} />
                    <AvatarFallback className="bg-primary/10 text-primary">{getInitials()}</AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold">{authorProfile.display_name || authorProfile.email}</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {authorProfile.bio ? authorProfile.bio.substring(0, 100) + (authorProfile.bio.length > 100 ? '...' : '') : 'Writer and content creator.'}
                  </p>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Table of contents */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Table of Contents</h3>
              <nav className="space-y-1">
                <a href="#" className="block text-sm text-blue-600 hover:underline">Introduction</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">Main Features</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">Use Cases</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">Comparison</a>
                <a href="#" className="block text-sm text-blue-600 hover:underline">Conclusion</a>
              </nav>
            </CardContent>
          </Card>
          
          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">You Might Also Like</h3>
                <div className="space-y-4">
                  {relatedArticles.map((relatedArticle) => (
                    <div key={relatedArticle.id} className="flex gap-3">
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                        <img 
                          src={relatedArticle.featured_image || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'} 
                          alt={relatedArticle.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium line-clamp-2">
                          <Link to={`/${relatedArticle.id}`} className="hover:text-blue-600">
                            {relatedArticle.title}
                          </Link>
                        </h4>
                        <span className="text-xs text-gray-500">
                          {relatedArticle.published_at && format(new Date(relatedArticle.published_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Popular posts */}
          {popularArticles.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold mb-3">Popular Posts</h3>
                <div className="space-y-3">
                  {popularArticles.map((popularArticle, index) => (
                    <div key={popularArticle.id} className="flex items-start gap-3">
                      <span className="text-lg font-bold text-gray-300">{index + 1}</span>
                      <h4 className="text-sm line-clamp-2">
                        <Link to={`/${popularArticle.id}`} className="hover:text-blue-600">
                          {popularArticle.title}
                        </Link>
                      </h4>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Newsletter subscription */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-2">Stay Updated</h3>
              <p className="text-sm text-gray-600 mb-4">Subscribe to our newsletter for latest updates and articles.</p>
              
              <div className="space-y-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <Button className="w-full">Subscribe</Button>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                By subscribing, you agree to our Privacy Policy.
              </p>
            </CardContent>
          </Card>
          
          {/* Social media links */}
          <Card>
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Follow Us</h3>
              <div className="flex justify-between">
                <a href="#" className="p-2 text-gray-500 hover:text-blue-500 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-blue-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-pink-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-red-600 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                </a>
                <a href="#" className="p-2 text-gray-500 hover:text-blue-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};
