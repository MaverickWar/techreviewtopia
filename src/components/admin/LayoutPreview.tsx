import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ArticleData, LayoutTemplate } from "@/types/content";
import { Monitor, Smartphone, Tablet, RefreshCcw, ZoomIn, ZoomOut } from "lucide-react";

// Layout Preview Components
import { ClassicLayout } from "@/components/layouts/article/ClassicLayout";
import { MagazineLayout } from "@/components/layouts/article/MagazineLayout";
import { ReviewLayout } from "@/components/layouts/article/ReviewLayout";
import { GalleryLayout } from "@/components/layouts/article/GalleryLayout";
import { TechnicalLayout } from "@/components/layouts/article/TechnicalLayout";
import { BasicReviewLayout } from "@/components/layouts/article/BasicReviewLayout";
import { EnhancedReviewLayout } from "@/components/layouts/article/EnhancedReviewLayout";

interface LayoutPreviewProps {
  article: Partial<ArticleData>;
  selectedLayout: LayoutTemplate;
}

export const LayoutPreview = ({
  article,
  selectedLayout
}: LayoutPreviewProps) => {
  // Create a sample article for preview
  const previewArticle: ArticleData = {
    id: "preview",
    title: article.title || "Article Title",
    description: article.description || "Article description goes here. This is a preview of how your content will look with the selected layout.",
    content: article.content || "<p>Article content goes here.</p>",
    type: article.type || "article",
    featured_image: article.featured_image || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b",
    published_at: article.published_at || new Date().toISOString(),
    author_id: article.author_id || "author",
    layout_template: selectedLayout,
    layout_settings: article.layout_settings || { award: "Best Value" }, // Added award for preview
    review_details: article.review_details || [{
      id: "preview",
      content_id: "preview",
      youtube_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      gallery: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b"],
      product_specs: { 
        "CPU": "Intel i9", 
        "RAM": "32GB", 
        "Storage": "1TB SSD" 
      },
      overall_score: 8.5
    }],
    rating_criteria: article.rating_criteria || [
      { name: "Performance", score: 9.0 },
      { name: "Value", score: 8.0 },
      { name: "Design", score: 8.5 }
    ],
    author: {
      display_name: "John Doe",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  };

  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [previewScale, setPreviewScale] = useState(0.6); // Default scale for desktop
  const [previewRotation, setPreviewRotation] = useState(false); // For tablet/mobile orientation

  // Define preview dimensions based on device
  const getPreviewDimensions = () => {
    switch (previewDevice) {
      case "mobile":
        return previewRotation 
          ? { width: "568px", height: "320px" } // Landscape
          : { width: "320px", height: "568px" }; // Portrait
      case "tablet":
        return previewRotation 
          ? { width: "1024px", height: "768px" } // Landscape
          : { width: "768px", height: "1024px" }; // Portrait
      case "desktop":
      default:
        return { width: "100%", height: "auto", minHeight: "600px" };
    }
  };

  const dimensions = getPreviewDimensions();

  // Function to reset preview settings
  const resetPreview = () => {
    setPreviewScale(previewDevice === "desktop" ? 0.6 : 0.4);
    setPreviewRotation(false);
  };

  return (
    <Card className="mt-6 p-4 border relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Layout Preview</h3>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setPreviewDevice("desktop"); setPreviewScale(0.6); setPreviewRotation(false); }}
            className={previewDevice === "desktop" ? "bg-gray-100" : ""}
          >
            <Monitor className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Desktop</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setPreviewDevice("tablet"); setPreviewScale(0.4); setPreviewRotation(false); }}
            className={previewDevice === "tablet" ? "bg-gray-100" : ""}
          >
            <Tablet className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Tablet</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setPreviewDevice("mobile"); setPreviewScale(0.4); setPreviewRotation(false); }}
            className={previewDevice === "mobile" ? "bg-gray-100" : ""}
          >
            <Smartphone className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Mobile</span>
          </Button>
        </div>
      </div>
      
      {/* Preview Controls */}
      <div className="bg-gray-50 rounded-md p-3 mb-4 flex flex-wrap gap-4 relative z-10">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <ZoomOut className="h-4 w-4 text-gray-500" />
          <Slider 
            value={[previewScale * 100]}
            min={20}
            max={100}
            step={5}
            onValueChange={(value) => setPreviewScale(value[0] / 100)}
            className="flex-1"
          />
          <ZoomIn className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500 ml-2 w-12">{Math.round(previewScale * 100)}%</span>
        </div>
        
        {(previewDevice === "mobile" || previewDevice === "tablet") && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setPreviewRotation(!previewRotation)}
          >
            <RefreshCcw className="h-4 w-4 mr-1" />
            Rotate
          </Button>
        )}
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetPreview}
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>
      
      {/* Preview Container */}
      <div className="border rounded-md h-[500px] overflow-auto bg-gray-100 flex justify-center items-start p-4 relative">
        <div
          className="bg-white shadow-md origin-top-left transition-all duration-200 relative"
          style={{
            width: dimensions.width,
            height: previewDevice === "desktop" ? "auto" : dimensions.height,
            minHeight: previewDevice === "desktop" ? dimensions.minHeight : "auto",
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
          }}
        >
          {/* Add this wrapper to prevent layout shifts during scaling */}
          <div className="h-full overflow-auto relative">
            {/* Disable back-to-top buttons in preview */}
            <div className="preview-content">
              {renderLayout(previewArticle, selectedLayout)}
            </div>
            {/* Override any fixed position elements that might cause issues in the preview */}
            <style>
              {`
                .preview-content button[aria-label="Back to top"] {
                  display: none !important;
                }
              `}
            </style>
          </div>
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <p>
          Preview of <span className="font-medium">{selectedLayout}</span> layout
        </p>
        <p>
          {previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} view {previewRotation && (previewDevice !== "desktop") ? "(Landscape)" : ""}
        </p>
      </div>
    </Card>
  );
};

// Helper function to render the appropriate layout component
const renderLayout = (article: ArticleData, layoutTemplate: LayoutTemplate) => {
  switch (layoutTemplate) {
    case 'magazine':
      return <MagazineLayout article={article} />;
    case 'review':
      return <ReviewLayout article={article} />;
    case 'basic-review':
      return <BasicReviewLayout article={article} />;
    case 'enhanced-review':
      return <EnhancedReviewLayout article={article} />;
    case 'gallery':
      return <GalleryLayout article={article} />;
    case 'technical':
      return <TechnicalLayout article={article} />;
    case 'classic':
    default:
      return <ClassicLayout article={article} />;
  }
};
