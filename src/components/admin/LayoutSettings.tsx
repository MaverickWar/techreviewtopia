
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Minus, UserCircle2, Share2, List, LayoutGrid, Image as ImageIcon, Code, Filter, Settings2 } from "lucide-react";
import { ArticleData, LayoutTemplate, ContentType } from "@/types/content";

interface LayoutSettingsProps {
  layoutTemplate: LayoutTemplate;
  contentType: ContentType;
  layoutSettings: Record<string, any>;
  onChange: (settings: Record<string, any>) => void;
}

export const LayoutSettings = ({ 
  layoutTemplate, 
  contentType, 
  layoutSettings = {}, 
  onChange 
}: LayoutSettingsProps) => {
  // Initialize settings with existing or default values
  const [settings, setSettings] = useState<Record<string, any>>(
    layoutSettings || getDefaultSettings(layoutTemplate, contentType)
  );

  // Update settings when layoutTemplate changes
  useEffect(() => {
    setSettings(prevSettings => {
      // Merge existing settings with new defaults
      return {
        ...getDefaultSettings(layoutTemplate, contentType),
        ...prevSettings
      };
    });
  }, [layoutTemplate, contentType]);

  // When settings change, call the onChange handler
  useEffect(() => {
    onChange(settings);
  }, [settings, onChange]);

  // Helper to update a setting value
  const updateSetting = (path: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [path]: value
    }));
  };

  // Helper to toggle boolean settings
  const toggleSetting = (path: string) => {
    setSettings(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  // Helper to add an item to an array setting
  const addArrayItem = (path: string, defaultItem: any) => {
    setSettings(prev => {
      const currentArray = Array.isArray(prev[path]) ? prev[path] : [];
      return {
        ...prev,
        [path]: [...currentArray, defaultItem]
      };
    });
  };

  // Helper to update an item in an array setting
  const updateArrayItem = (path: string, index: number, value: any) => {
    setSettings(prev => {
      const currentArray = Array.isArray(prev[path]) ? [...prev[path]] : [];
      currentArray[index] = value;
      return {
        ...prev,
        [path]: currentArray
      };
    });
  };

  // Helper to remove an item from an array setting
  const removeArrayItem = (path: string, index: number) => {
    setSettings(prev => {
      const currentArray = Array.isArray(prev[path]) ? [...prev[path]] : [];
      return {
        ...prev,
        [path]: currentArray.filter((_, i) => i !== index)
      };
    });
  };

  // Render common settings available for all layouts
  const renderCommonSettings = () => (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="showAuthor">Author Display</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="showAuthor" 
              checked={settings.showAuthor !== false} 
              onCheckedChange={() => toggleSetting('showAuthor')}
            />
            <label htmlFor="showAuthor" className="text-sm">
              Show author information
            </label>
          </div>
        </div>
        
        <div>
          <Label htmlFor="showDate">Date Display</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              id="showDate" 
              checked={settings.showDate !== false} 
              onCheckedChange={() => toggleSetting('showDate')}
            />
            <label htmlFor="showDate" className="text-sm">
              Show publication date
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="showShareButtons">Social Sharing</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="showShareButtons" 
            checked={settings.showShareButtons !== false} 
            onCheckedChange={() => toggleSetting('showShareButtons')}
          />
          <label htmlFor="showShareButtons" className="text-sm">
            Show social sharing buttons
          </label>
        </div>
      </div>
      
      <div>
        <Label htmlFor="showRelatedContent">Related Content</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="showRelatedContent" 
            checked={settings.showRelatedContent !== false} 
            onCheckedChange={() => toggleSetting('showRelatedContent')}
          />
          <label htmlFor="showRelatedContent" className="text-sm">
            Show related content section
          </label>
        </div>
      </div>
      
      {settings.showRelatedContent !== false && (
        <div>
          <Label htmlFor="relatedContentCount">Number of related items</Label>
          <Input
            id="relatedContentCount"
            type="number"
            min="1"
            max="10"
            value={settings.relatedContentCount || 3}
            onChange={(e) => updateSetting('relatedContentCount', parseInt(e.target.value) || 3)}
            className="mt-1"
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="customCSS">Custom CSS</Label>
        <textarea
          id="customCSS"
          value={settings.customCSS || ''}
          onChange={(e) => updateSetting('customCSS', e.target.value)}
          placeholder=".article-content h2 { color: blue; }"
          className="w-full h-20 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>
    </div>
  );

  // Render Classic Layout specific settings
  const renderClassicSettings = () => (
    <div className="space-y-4">
      <div>
        <Label>Sidebar Position</Label>
        <Select
          value={settings.sidebarPosition || 'right'}
          onValueChange={(value) => updateSetting('sidebarPosition', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="none">No Sidebar</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {settings.sidebarPosition !== 'none' && (
        <div>
          <Label>Sidebar Widgets</Label>
          <div className="space-y-2 mt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sidebarAuthorCard" 
                checked={settings.sidebarAuthorCard !== false} 
                onCheckedChange={() => toggleSetting('sidebarAuthorCard')}
              />
              <label htmlFor="sidebarAuthorCard" className="text-sm">
                Author Card
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sidebarTableOfContents" 
                checked={settings.sidebarTableOfContents !== false} 
                onCheckedChange={() => toggleSetting('sidebarTableOfContents')}
              />
              <label htmlFor="sidebarTableOfContents" className="text-sm">
                Table of Contents
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sidebarRelatedArticles" 
                checked={settings.sidebarRelatedArticles !== false} 
                onCheckedChange={() => toggleSetting('sidebarRelatedArticles')}
              />
              <label htmlFor="sidebarRelatedArticles" className="text-sm">
                Related Articles
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sidebarPopularPosts" 
                checked={settings.sidebarPopularPosts !== false} 
                onCheckedChange={() => toggleSetting('sidebarPopularPosts')}
              />
              <label htmlFor="sidebarPopularPosts" className="text-sm">
                Popular Posts
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="sidebarNewsletter" 
                checked={settings.sidebarNewsletter !== false} 
                onCheckedChange={() => toggleSetting('sidebarNewsletter')}
              />
              <label htmlFor="sidebarNewsletter" className="text-sm">
                Newsletter Signup
              </label>
            </div>
          </div>
        </div>
      )}
      
      <div>
        <Label>Featured Image Display</Label>
        <Select
          value={settings.featuredImageStyle || 'large'}
          onValueChange={(value) => updateSetting('featuredImageStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="large">Large (Full Width)</SelectItem>
            <SelectItem value="medium">Medium (Content Width)</SelectItem>
            <SelectItem value="small">Small (Thumbnail)</SelectItem>
            <SelectItem value="none">Don't Show</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Reading Time</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="showReadingTime" 
            checked={settings.showReadingTime !== false} 
            onCheckedChange={() => toggleSetting('showReadingTime')}
          />
          <label htmlFor="showReadingTime" className="text-sm">
            Show estimated reading time
          </label>
        </div>
      </div>
      
      <div>
        <Label>Comments Section</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="showComments" 
            checked={settings.showComments !== false} 
            onCheckedChange={() => toggleSetting('showComments')}
          />
          <label htmlFor="showComments" className="text-sm">
            Enable comments section
          </label>
        </div>
      </div>
    </div>
  );

  // Render Magazine Layout specific settings
  const renderMagazineSettings = () => (
    <div className="space-y-4">
      <div>
        <Label>Hero Section Style</Label>
        <Select
          value={settings.heroStyle || 'overlay'}
          onValueChange={(value) => updateSetting('heroStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overlay">Text Overlay</SelectItem>
            <SelectItem value="split">Split (Text/Image)</SelectItem>
            <SelectItem value="fullscreen">Fullscreen Cover</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="accentColor">Accent Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="accentColor"
            type="color"
            value={settings.accentColor || '#3b82f6'}
            onChange={(e) => updateSetting('accentColor', e.target.value)}
            className="w-20"
          />
          <Input
            type="text"
            value={settings.accentColor || '#3b82f6'}
            onChange={(e) => updateSetting('accentColor', e.target.value)}
            placeholder="#3b82f6"
          />
        </div>
      </div>
      
      <div>
        <Label>Grid Layout</Label>
        <Select
          value={settings.gridLayout || 'standard'}
          onValueChange={(value) => updateSetting('gridLayout', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard Grid</SelectItem>
            <SelectItem value="featured">Featured First</SelectItem>
            <SelectItem value="mixed">Mixed Sizes</SelectItem>
            <SelectItem value="masonry">Masonry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Typography Style</Label>
        <Select
          value={settings.typographyStyle || 'modern'}
          onValueChange={(value) => updateSetting('typographyStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="bold">Bold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Pull Quotes Style</Label>
        <Select
          value={settings.pullQuoteStyle || 'modern'}
          onValueChange={(value) => updateSetting('pullQuoteStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="modern">Modern</SelectItem>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="minimal">Minimal</SelectItem>
            <SelectItem value="highlight">Highlight</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Highlight Boxes</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="enableHighlightBoxes" 
            checked={settings.enableHighlightBoxes !== false} 
            onCheckedChange={() => toggleSetting('enableHighlightBoxes')}
          />
          <label htmlFor="enableHighlightBoxes" className="text-sm">
            Enable highlight boxes in content
          </label>
        </div>
      </div>
      
      <div>
        <Label>Footer Style</Label>
        <Select
          value={settings.footerStyle || 'standard'}
          onValueChange={(value) => updateSetting('footerStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="standard">Standard</SelectItem>
            <SelectItem value="newsletter">Newsletter Focus</SelectItem>
            <SelectItem value="author">Author Focus</SelectItem>
            <SelectItem value="related">Related Content</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Render Gallery Layout specific settings
  const renderGallerySettings = () => (
    <div className="space-y-4">
      <div>
        <Label>Gallery Type</Label>
        <Select
          value={settings.galleryType || 'masonry'}
          onValueChange={(value) => updateSetting('galleryType', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masonry">Masonry Grid</SelectItem>
            <SelectItem value="grid">Uniform Grid</SelectItem>
            <SelectItem value="carousel">Carousel</SelectItem>
            <SelectItem value="slideshow">Slideshow</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Lightbox Settings</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableLightbox" 
              checked={settings.enableLightbox !== false} 
              onCheckedChange={() => toggleSetting('enableLightbox')}
            />
            <label htmlFor="enableLightbox" className="text-sm">
              Enable lightbox for images
            </label>
          </div>
          
          {settings.enableLightbox !== false && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lightboxCaptions" 
                  checked={settings.lightboxCaptions !== false} 
                  onCheckedChange={() => toggleSetting('lightboxCaptions')}
                />
                <label htmlFor="lightboxCaptions" className="text-sm">
                  Show captions in lightbox
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lightboxFullscreen" 
                  checked={settings.lightboxFullscreen !== false} 
                  onCheckedChange={() => toggleSetting('lightboxFullscreen')}
                />
                <label htmlFor="lightboxFullscreen" className="text-sm">
                  Allow fullscreen mode
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lightboxThumbnails" 
                  checked={settings.lightboxThumbnails !== false} 
                  onCheckedChange={() => toggleSetting('lightboxThumbnails')}
                />
                <label htmlFor="lightboxThumbnails" className="text-sm">
                  Show thumbnails in lightbox
                </label>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div>
        <Label htmlFor="imagesPerRow">Images Per Row</Label>
        <Input
          id="imagesPerRow"
          type="number"
          min="1"
          max="6"
          value={settings.imagesPerRow || 3}
          onChange={(e) => updateSetting('imagesPerRow', parseInt(e.target.value) || 3)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          For grid layout only. Masonry adapts automatically.
        </p>
      </div>
      
      <div>
        <Label>Image Size</Label>
        <Select
          value={settings.imageSize || 'medium'}
          onValueChange={(value) => updateSetting('imageSize', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
            <SelectItem value="original">Original</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Caption Style</Label>
        <Select
          value={settings.captionStyle || 'below'}
          onValueChange={(value) => updateSetting('captionStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="below">Below Image</SelectItem>
            <SelectItem value="overlay">Overlay on Hover</SelectItem>
            <SelectItem value="hidden">Hidden (Lightbox Only)</SelectItem>
            <SelectItem value="none">No Captions</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Display EXIF Data</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="showExifData" 
            checked={settings.showExifData === true}
            onCheckedChange={() => toggleSetting('showExifData')}
          />
          <label htmlFor="showExifData" className="text-sm">
            Show camera and exposure information
          </label>
        </div>
      </div>
      
      <div>
        <Label>Image Spacing</Label>
        <Input
          type="number"
          min="0"
          max="40"
          value={settings.imageSpacing || 8}
          onChange={(e) => updateSetting('imageSpacing', parseInt(e.target.value) || 8)}
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Space between images in pixels
        </p>
      </div>
    </div>
  );
  
  // Render Technical Layout specific settings
  const renderTechnicalSettings = () => (
    <div className="space-y-4">
      <div>
        <Label>Table of Contents</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="enableTOC" 
              checked={settings.enableTOC !== false} 
              onCheckedChange={() => toggleSetting('enableTOC')}
            />
            <label htmlFor="enableTOC" className="text-sm">
              Enable table of contents
            </label>
          </div>
          
          {settings.enableTOC !== false && (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="tocSticky" 
                  checked={settings.tocSticky !== false} 
                  onCheckedChange={() => toggleSetting('tocSticky')}
                />
                <label htmlFor="tocSticky" className="text-sm">
                  Sticky table of contents
                </label>
              </div>
              <div>
                <Label htmlFor="tocDepth">TOC Depth</Label>
                <Select
                  value={String(settings.tocDepth || 3)}
                  onValueChange={(value) => updateSetting('tocDepth', parseInt(value))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select depth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">H2 Only</SelectItem>
                    <SelectItem value="3">H2 & H3</SelectItem>
                    <SelectItem value="4">H2, H3 & H4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div>
        <Label>Code Blocks</Label>
        <div className="space-y-2 mt-2">
          <div>
            <Label>Syntax Highlighting Theme</Label>
            <Select
              value={settings.codeTheme || 'atom-one-dark'}
              onValueChange={(value) => updateSetting('codeTheme', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="atom-one-dark">Atom Dark</SelectItem>
                <SelectItem value="atom-one-light">Atom Light</SelectItem>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="monokai">Monokai</SelectItem>
                <SelectItem value="vs2015">Visual Studio</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="codeLineNumbers" 
              checked={settings.codeLineNumbers !== false} 
              onCheckedChange={() => toggleSetting('codeLineNumbers')}
            />
            <label htmlFor="codeLineNumbers" className="text-sm">
              Show line numbers
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="codeCopyButton" 
              checked={settings.codeCopyButton !== false} 
              onCheckedChange={() => toggleSetting('codeCopyButton')}
            />
            <label htmlFor="codeCopyButton" className="text-sm">
              Show copy button
            </label>
          </div>
        </div>
      </div>
      
      <div>
        <Label>Sidebar Position</Label>
        <Select
          value={settings.sidebarPosition || 'right'}
          onValueChange={(value) => updateSetting('sidebarPosition', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Sidebar Content</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showSidebarTOC" 
              checked={settings.showSidebarTOC !== false} 
              onCheckedChange={() => toggleSetting('showSidebarTOC')}
            />
            <label htmlFor="showSidebarTOC" className="text-sm">
              Show table of contents
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showSidebarAuthor" 
              checked={settings.showSidebarAuthor !== false} 
              onCheckedChange={() => toggleSetting('showSidebarAuthor')}
            />
            <label htmlFor="showSidebarAuthor" className="text-sm">
              Show author info
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showSidebarDownloads" 
              checked={settings.showSidebarDownloads === true}
              onCheckedChange={() => toggleSetting('showSidebarDownloads')}
            />
            <label htmlFor="showSidebarDownloads" className="text-sm">
              Show downloads section
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showSidebarRelated" 
              checked={settings.showSidebarRelated !== false} 
              onCheckedChange={() => toggleSetting('showSidebarRelated')}
            />
            <label htmlFor="showSidebarRelated" className="text-sm">
              Show related articles
            </label>
          </div>
        </div>
      </div>
      
      {settings.showSidebarDownloads === true && (
        <div>
          <Label>Downloads</Label>
          <div className="space-y-2 mt-2">
            {(settings.downloads || []).map((download: any, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Label"
                  value={download.label || ''}
                  onChange={(e) => {
                    const updated = { ...download, label: e.target.value };
                    updateArrayItem('downloads', index, updated);
                  }}
                />
                <Input
                  placeholder="URL"
                  value={download.url || ''}
                  onChange={(e) => {
                    const updated = { ...download, url: e.target.value };
                    updateArrayItem('downloads', index, updated);
                  }}
                />
                <Button 
                  variant="destructive" 
                  size="icon"
                  onClick={() => removeArrayItem('downloads', index)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('downloads', { label: '', url: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
  
  // Render Review Layout specific settings
  const renderReviewSettings = () => (
    <div className="space-y-4">
      <div>
        <Label>Review Style</Label>
        <Select
          value={settings.reviewStyle || 'detailed'}
          onValueChange={(value) => updateSetting('reviewStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="simple">Simple</SelectItem>
            <SelectItem value="comparison">Comparison</SelectItem>
            <SelectItem value="pros-cons">Pros & Cons Focus</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label>Rating Display</Label>
        <Select
          value={settings.ratingStyle || 'stars'}
          onValueChange={(value) => updateSetting('ratingStyle', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stars">Stars</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="percent">Percentage</SelectItem>
            <SelectItem value="bars">Bar Chart</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="accentColor">Rating Color</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="ratingColor"
            type="color"
            value={settings.ratingColor || '#fbbf24'}
            onChange={(e) => updateSetting('ratingColor', e.target.value)}
            className="w-20"
          />
          <Input
            type="text"
            value={settings.ratingColor || '#fbbf24'}
            onChange={(e) => updateSetting('ratingColor', e.target.value)}
            placeholder="#fbbf24"
          />
        </div>
      </div>
      
      <div>
        <Label>Pros & Cons</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showProsCons" 
              checked={settings.showProsCons !== false} 
              onCheckedChange={() => toggleSetting('showProsCons')}
            />
            <label htmlFor="showProsCons" className="text-sm">
              Show pros and cons section
            </label>
          </div>
          
          {settings.showProsCons !== false && (
            <div>
              <Label>Pros & Cons Style</Label>
              <Select
                value={settings.prosConsStyle || 'boxed'}
                onValueChange={(value) => updateSetting('prosConsStyle', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boxed">Boxed</SelectItem>
                  <SelectItem value="inline">Inline</SelectItem>
                  <SelectItem value="cards">Cards</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <Label>Product Specs</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showProductSpecs" 
              checked={settings.showProductSpecs !== false} 
              onCheckedChange={() => toggleSetting('showProductSpecs')}
            />
            <label htmlFor="showProductSpecs" className="text-sm">
              Show product specifications
            </label>
          </div>
          
          {settings.showProductSpecs !== false && (
            <div>
              <Label>Specs Style</Label>
              <Select
                value={settings.specsStyle || 'table'}
                onValueChange={(value) => updateSetting('specsStyle', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="table">Table</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                  <SelectItem value="cards">Cards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <Label>Verdict Section</Label>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox 
            id="showVerdict" 
            checked={settings.showVerdict !== false} 
            onCheckedChange={() => toggleSetting('showVerdict')}
          />
          <label htmlFor="showVerdict" className="text-sm">
            Show verdict section
          </label>
        </div>
      </div>
      
      <div>
        <Label>Awards</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showAwards" 
              checked={settings.showAwards === true}
              onCheckedChange={() => toggleSetting('showAwards')}
            />
            <label htmlFor="showAwards" className="text-sm">
              Show awards badges
            </label>
          </div>
          
          {settings.showAwards === true && (
            <div>
              <Label>Award Level</Label>
              <Select
                value={settings.awardLevel || 'none'}
                onValueChange={(value) => updateSetting('awardLevel', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select award" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Award</SelectItem>
                  <SelectItem value="bronze">Bronze Award</SelectItem>
                  <SelectItem value="silver">Silver Award</SelectItem>
                  <SelectItem value="gold">Gold Award</SelectItem>
                  <SelectItem value="platinum">Platinum Award</SelectItem>
                  <SelectItem value="editors-choice">Editor's Choice</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <Label>Purchase Links</Label>
        <div className="space-y-2 mt-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="showPurchaseLinks" 
              checked={settings.showPurchaseLinks === true}
              onCheckedChange={() => toggleSetting('showPurchaseLinks')}
            />
            <label htmlFor="showPurchaseLinks" className="text-sm">
              Show purchase links
            </label>
          </div>
          
          {settings.showPurchaseLinks === true && (
            <>
              {(settings.purchaseLinks || []).map((link: any, index: number) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Retailer"
                    value={link.retailer || ''}
                    onChange={(e) => {
                      const updated = { ...link, retailer: e.target.value };
                      updateArrayItem('purchaseLinks', index, updated);
                    }}
                  />
                  <Input
                    placeholder="URL"
                    value={link.url || ''}
                    onChange={(e) => {
                      const updated = { ...link, url: e.target.value };
                      updateArrayItem('purchaseLinks', index, updated);
                    }}
                  />
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => removeArrayItem('purchaseLinks', index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('purchaseLinks', { retailer: '', url: '' })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  // Function to return default settings based on layout and content type
  function getDefaultSettings(layout: LayoutTemplate, contentType: ContentType): Record<string, any> {
    const common = {
      showAuthor: true,
      showDate: true,
      showShareButtons: true,
      showRelatedContent: true,
      relatedContentCount: 3,
    };
    
    switch (layout) {
      case 'classic':
        return {
          ...common,
          sidebarPosition: 'right',
          sidebarAuthorCard: true,
          sidebarTableOfContents: true,
          sidebarRelatedArticles: true,
          sidebarPopularPosts: true,
          sidebarNewsletter: true,
          featuredImageStyle: 'large',
          showReadingTime: true,
          showComments: true,
        };
        
      case 'magazine':
        return {
          ...common,
          heroStyle: 'overlay',
          accentColor: '#3b82f6',
          gridLayout: 'standard',
          typographyStyle: 'modern',
          pullQuoteStyle: 'modern',
          enableHighlightBoxes: true,
          footerStyle: 'standard',
        };
        
      case 'gallery':
        return {
          ...common,
          galleryType: 'masonry',
          enableLightbox: true,
          lightboxCaptions: true,
          lightboxFullscreen: true,
          lightboxThumbnails: true,
          imagesPerRow: 3,
          imageSize: 'medium',
          captionStyle: 'below',
          showExifData: false,
          imageSpacing: 8,
        };
        
      case 'technical':
        return {
          ...common,
          enableTOC: true,
          tocSticky: true,
          tocDepth: 3,
          codeTheme: 'atom-one-dark',
          codeLineNumbers: true,
          codeCopyButton: true,
          sidebarPosition: 'right',
          showSidebarTOC: true,
          showSidebarAuthor: true,
          showSidebarDownloads: false,
          showSidebarRelated: true,
          downloads: [],
        };
        
      case 'review':
      case 'basic-review':
      case 'enhanced-review':
        return {
          ...common,
          reviewStyle: 'detailed',
          ratingStyle: 'stars',
          ratingColor: '#fbbf24',
          showProsCons: true,
          prosConsStyle: 'boxed',
          showProductSpecs: true,
          specsStyle: 'table',
          showVerdict: true,
          showAwards: false,
          awardLevel: 'none',
          showPurchaseLinks: false,
          purchaseLinks: [],
        };
        
      default:
        return common;
    }
  }

  return (
    <Card className="mt-4">
      <div className="p-4 border-b">
        <div className="flex items-center">
          <Settings2 className="mr-2 h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-lg">Layout Settings</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Customize how your content appears with these template-specific settings.
        </p>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="common">
          <TabsList className="mb-4 flex flex-wrap">
            <TabsTrigger value="common" className="flex items-center">
              <UserCircle2 className="h-4 w-4 mr-2" />
              Common
            </TabsTrigger>
            
            {layoutTemplate === 'classic' && (
              <TabsTrigger value="classic" className="flex items-center">
                <List className="h-4 w-4 mr-2" />
                Classic Layout
              </TabsTrigger>
            )}
            
            {layoutTemplate === 'magazine' && (
              <TabsTrigger value="magazine" className="flex items-center">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Magazine Layout
              </TabsTrigger>
            )}
            
            {layoutTemplate === 'gallery' && (
              <TabsTrigger value="gallery" className="flex items-center">
                <ImageIcon className="h-4 w-4 mr-2" />
                Gallery Layout
              </TabsTrigger>
            )}
            
            {layoutTemplate === 'technical' && (
              <TabsTrigger value="technical" className="flex items-center">
                <Code className="h-4 w-4 mr-2" />
                Technical Layout
              </TabsTrigger>
            )}
            
            {(layoutTemplate === 'review' || layoutTemplate === 'basic-review' || layoutTemplate === 'enhanced-review') && (
              <TabsTrigger value="review" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Review Layout
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="common">
            {renderCommonSettings()}
          </TabsContent>
          
          {layoutTemplate === 'classic' && (
            <TabsContent value="classic">
              {renderClassicSettings()}
            </TabsContent>
          )}
          
          {layoutTemplate === 'magazine' && (
            <TabsContent value="magazine">
              {renderMagazineSettings()}
            </TabsContent>
          )}
          
          {layoutTemplate === 'gallery' && (
            <TabsContent value="gallery">
              {renderGallerySettings()}
            </TabsContent>
          )}
          
          {layoutTemplate === 'technical' && (
            <TabsContent value="technical">
              {renderTechnicalSettings()}
            </TabsContent>
          )}
          
          {(layoutTemplate === 'review' || layoutTemplate === 'basic-review' || layoutTemplate === 'enhanced-review') && (
            <TabsContent value="review">
              {renderReviewSettings()}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Card>
  );
};

export default LayoutSettings;
