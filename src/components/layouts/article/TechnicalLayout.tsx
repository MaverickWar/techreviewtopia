
import React from "react";
import { ArticleData } from "@/types/content";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Check, Copy, FileCode, Flame, Github, Info, Link2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicalLayoutProps {
  article: ArticleData;
}

export const TechnicalLayout: React.FC<TechnicalLayoutProps> = ({ article }) => {
  return (
    <article className="max-w-5xl mx-auto p-4 md:p-8 relative">
      {/* Table of Contents - Fixed position on desktop */}
      <div className="hidden lg:block lg:fixed lg:top-24 lg:right-8 w-56 bg-white p-4 rounded-lg border shadow-sm">
        <h3 className="text-sm font-medium mb-3">Table of Contents</h3>
        <nav>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#introduction" className="text-blue-600 hover:text-blue-800">Introduction</a>
            </li>
            <li>
              <a href="#prerequisites" className="text-blue-600 hover:text-blue-800">Prerequisites</a>
            </li>
            <li>
              <a href="#installation" className="text-blue-600 hover:text-blue-800">Installation</a>
            </li>
            <li>
              <a href="#configuration" className="text-blue-600 hover:text-blue-800">Configuration</a>
            </li>
            <li>
              <a href="#usage" className="text-blue-600 hover:text-blue-800">Usage Examples</a>
            </li>
            <li>
              <a href="#troubleshooting" className="text-blue-600 hover:text-blue-800">Troubleshooting</a>
            </li>
            <li>
              <a href="#conclusion" className="text-blue-600 hover:text-blue-800">Conclusion</a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="lg:max-w-3xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
              <FileCode className="h-3.5 w-3.5 mr-1" />
              Tutorial
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              JavaScript
            </Badge>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
              React
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          
          {article.description && (
            <div
              className="text-lg text-gray-600 mb-6"
              dangerouslySetInnerHTML={{ __html: article.description }}
            />
          )}
          
          <div className="flex items-center flex-wrap gap-y-4">
            {article.author && (
              <div className="flex items-center mr-6">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || "Author"} />
                  <AvatarFallback>{article.author.display_name?.substring(0, 2) || "AU"}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">{article.author.display_name || "Anonymous"}</div>
                  <div className="text-gray-500">Developer</div>
                </div>
              </div>
            )}
            
            {article.published_at && (
              <div className="flex items-center text-sm text-gray-500 mr-6">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                </span>
              </div>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Flame className="h-4 w-4 mr-1" />
              <span>5 min read</span>
            </div>
          </div>
        </header>
        
        {article.featured_image && (
          <div className="mb-8">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        )}
        
        {/* GitHub Repository Info */}
        <div className="mb-8 bg-gray-50 border rounded-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center">
              <Github className="h-5 w-5 mr-2" />
              <span className="font-medium">GitHub Repository</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <a
                href="https://github.com/example/repo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm bg-white hover:bg-gray-100 border rounded px-3 py-1.5 transition-colors"
              >
                <Link2 className="h-4 w-4 mr-1" />
                <span>View Repo</span>
              </a>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center text-sm"
                onClick={() => navigator.clipboard.writeText("git clone https://github.com/example/repo.git")}
              >
                <Copy className="h-4 w-4 mr-1" />
                <span>Clone URL</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t text-sm flex flex-wrap gap-4">
            <div className="flex items-center">
              <span className="font-medium mr-2">Stars:</span> 1.2k
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">Last Updated:</span> 2 weeks ago
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-2">License:</span> MIT
            </div>
          </div>
        </div>
        
        {/* Prerequisites Notice */}
        <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg mb-8">
          <div className="flex">
            <Info className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-2">Prerequisites</h3>
              <ul className="text-blue-700 space-y-1 list-disc pl-5">
                <li>Node.js (v14 or later)</li>
                <li>npm or yarn package manager</li>
                <li>Basic knowledge of JavaScript and React</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="prose prose-blue prose-headings:scroll-mt-20 max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content || "" }} />
        </div>
        
        {/* Terminal Command Examples */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Quick Start Commands</h3>
          
          <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden mb-4">
            <div className="flex items-center bg-gray-800 px-4 py-2">
              <Terminal className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Install dependencies</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <code className="text-sm font-mono">npm install @example/package react react-dom</code>
            </div>
            <div className="border-t border-gray-700 flex justify-end">
              <button 
                onClick={() => navigator.clipboard.writeText("npm install @example/package react react-dom")}
                className="text-xs text-gray-400 hover:text-white flex items-center px-3 py-1.5"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </button>
            </div>
          </div>
          
          <div className="bg-gray-900 text-gray-100 rounded-lg overflow-hidden">
            <div className="flex items-center bg-gray-800 px-4 py-2">
              <Terminal className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Start development server</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <code className="text-sm font-mono">npm run dev</code>
            </div>
            <div className="border-t border-gray-700 flex justify-end">
              <button 
                onClick={() => navigator.clipboard.writeText("npm run dev")}
                className="text-xs text-gray-400 hover:text-white flex items-center px-3 py-1.5"
              >
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy
              </button>
            </div>
          </div>
        </div>
        
        {/* Troubleshooting Section */}
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 mb-2">Common Issues & Solutions</h3>
              <dl className="space-y-4">
                <div>
                  <dt className="font-medium text-amber-700">Error: Cannot find module 'react'</dt>
                  <dd className="text-amber-700 mt-1 pl-4 border-l-2 border-amber-200">
                    Make sure you have installed all dependencies correctly with <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-800">npm install</code>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-amber-700">CORS errors when fetching API</dt>
                  <dd className="text-amber-700 mt-1 pl-4 border-l-2 border-amber-200">
                    Add appropriate CORS headers on your server or use a proxy during development
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* Success Tips */}
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-green-800 mb-2">Pro Tips</h3>
              <ul className="text-green-700 space-y-2">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                  <span>Use React DevTools for debugging component state and props</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                  <span>Implement code splitting for better performance in larger applications</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-1" />
                  <span>Write unit tests for all utility functions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Related Resources */}
        <div className="mb-8">
          <h3 className="text-xl font-bold mb-4">Further Resources</h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="flex items-start group">
                <div className="mr-3 bg-gray-100 text-gray-600 rounded-full p-1 group-hover:bg-blue-100 group-hover:text-blue-600">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Official Documentation</h4>
                  <p className="text-sm text-gray-500">Complete guide to the API and examples</p>
                </div>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-start group">
                <div className="mr-3 bg-gray-100 text-gray-600 rounded-full p-1 group-hover:bg-blue-100 group-hover:text-blue-600">
                  <FileCode className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Video Tutorial</h4>
                  <p className="text-sm text-gray-500">Step-by-step walk-through for visual learners</p>
                </div>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-start group">
                <div className="mr-3 bg-gray-100 text-gray-600 rounded-full p-1 group-hover:bg-blue-100 group-hover:text-blue-600">
                  <Github className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 group-hover:text-blue-600">Example Repository</h4>
                  <p className="text-sm text-gray-500">Complete working example with all features</p>
                </div>
              </a>
            </li>
          </ul>
        </div>
        
        {/* Author Bio */}
        {article.author && (
          <div className="bg-gray-50 p-6 rounded-lg border mb-8">
            <div className="flex items-start">
              <Avatar className="h-12 w-12 mr-4">
                <AvatarImage src={article.author.avatar_url || ""} alt={article.author.display_name || "Author"} />
                <AvatarFallback>{article.author.display_name?.substring(0, 2) || "AU"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold mb-1">About the Author</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Senior developer with focus on JavaScript and React. Conference speaker and open source contributor.
                </p>
                <div className="flex space-x-3">
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                    <Github className="h-4 w-4 inline mr-1" />
                    GitHub
                  </a>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                    <Link2 className="h-4 w-4 inline mr-1" />
                    Website
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <Separator className="my-8" />
        
        {/* Footer */}
        <footer className="text-sm text-gray-500 flex justify-between items-center">
          <div>
            <p>Last updated: {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Recently"}</p>
          </div>
          <div className="flex space-x-4">
            <button className="hover:text-blue-600">Share</button>
            <button className="hover:text-blue-600">Report Issue</button>
          </div>
        </footer>
      </div>
      
      {/* Back to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
        aria-label="Back to top"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </article>
  );
};
