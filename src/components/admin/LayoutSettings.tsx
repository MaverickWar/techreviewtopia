
import React, { useEffect, useState } from "react";
import { ArticleData, ContentType, LayoutTemplate } from "@/types/content";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Award, 
  Columns, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Image,
  Layers,
  Palette,
  Type,
  LayoutGrid,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  Star
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AwardBanner } from "@/components/layouts/article/AwardBanner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export interface LayoutSettingsProps {
  article: ArticleData;
  onSave: (settings: any) => void;
  layoutTemplate?: LayoutTemplate;
  contentType?: ContentType;
  layoutSettings?: Record<string, any>;
  onChange?: (settings: Record<string, any>) => void;
}

// Predefined award options to ensure consistency
const AWARD_OPTIONS = [
  { value: "empty_value", label: "No Award" }, // Changed empty string to "empty_value"
  { value: "editors-choice", label: "Editor's Choice" },
  { value: "best-value", label: "Best Value" },
  { value: "best-performance", label: "Best Performance" },
  { value: "highly-recommended", label: "Highly Recommended" },
  { value: "budget-pick", label: "Budget Pick" },
  { value: "premium-choice", label: "Premium Choice" },
  { value: "most-innovative", label: "Most Innovative" },
];

// Transform kebab-case to readable format
const formatAwardLabel = (awardValue: string): string => {
  if (!awardValue || awardValue === "empty_value") return "";
  
  // Find the matching label from options
  const option = AWARD_OPTIONS.find(opt => opt.value === awardValue);
  return option ? option.label : awardValue
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Color theme options
const COLOR_THEME_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "blue", label: "Blue" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "gray", label: "Gray" },
];

// Font options
const FONT_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];

const LayoutSettings: React.FC<LayoutSettingsProps> = ({ 
  article, 
  onSave,
  layoutSettings,
  layoutTemplate,
  contentType,
  onChange 
}) => {
  // Use awardLevel as the primary key with fallback to award for backward compatibility
  const [awardLevel, setAwardLevel] = useState<string | undefined>(
    layoutSettings?.awardLevel || 
    layoutSettings?.award || 
    article?.layout_settings?.awardLevel ||
    article?.layout_settings?.award ||
    "empty_value" // Default to "empty_value" instead of empty string
  );
  
  const [showAwards, setShowAwards] = useState<boolean>(
    layoutSettings?.showAwards !== undefined ? 
    layoutSettings.showAwards :
    article?.layout_settings?.showAwards !== undefined ?
    article.layout_settings.showAwards : 
    true
  );

  // Text alignment settings
  const [contentAlignment, setContentAlignment] = useState<string>(
    layoutSettings?.contentAlignment || 
    article?.layout_settings?.contentAlignment || 
    "left"
  );

  // Feature image settings
  const [showFeaturedImage, setShowFeaturedImage] = useState<boolean>(
    layoutSettings?.showFeaturedImage !== undefined ? 
    layoutSettings.showFeaturedImage :
    article?.layout_settings?.showFeaturedImage !== undefined ?
    article.layout_settings.showFeaturedImage : 
    true
  );

  // Layout width settings
  const [layoutWidth, setLayoutWidth] = useState<string>(
    layoutSettings?.layoutWidth || 
    article?.layout_settings?.layoutWidth || 
    "standard"
  );

  // Show table of contents (for technical articles)
  const [showTableOfContents, setShowTableOfContents] = useState<boolean>(
    layoutSettings?.showTableOfContents !== undefined ? 
    layoutSettings.showTableOfContents :
    article?.layout_settings?.showTableOfContents !== undefined ?
    article.layout_settings.showTableOfContents : 
    false
  );

  // New settings
  // Color theme
  const [colorTheme, setColorTheme] = useState<string>(
    layoutSettings?.colorTheme || 
    article?.layout_settings?.colorTheme || 
    "default"
  );

  // Typography settings
  const [fontSize, setFontSize] = useState<string>(
    layoutSettings?.fontSize || 
    article?.layout_settings?.fontSize || 
    "medium"
  );

  const [headingStyle, setHeadingStyle] = useState<string>(
    layoutSettings?.headingStyle || 
    article?.layout_settings?.headingStyle || 
    "standard"
  );

  // Section visibility for reviews
  const [showProsConsSection, setShowProsConsSection] = useState<boolean>(
    layoutSettings?.showProsConsSection !== undefined ? 
    layoutSettings.showProsConsSection :
    article?.layout_settings?.showProsConsSection !== undefined ?
    article.layout_settings.showProsConsSection : 
    true
  );

  const [showVerdictSection, setShowVerdictSection] = useState<boolean>(
    layoutSettings?.showVerdictSection !== undefined ? 
    layoutSettings.showVerdictSection :
    article?.layout_settings?.showVerdictSection !== undefined ?
    article.layout_settings.showVerdictSection : 
    true
  );

  const [showRatingCriteria, setShowRatingCriteria] = useState<boolean>(
    layoutSettings?.showRatingCriteria !== undefined ? 
    layoutSettings.showRatingCriteria :
    article?.layout_settings?.showRatingCriteria !== undefined ?
    article.layout_settings.showRatingCriteria : 
    true
  );

  // Rating display style
  const [ratingDisplayStyle, setRatingDisplayStyle] = useState<string>(
    layoutSettings?.ratingDisplayStyle || 
    article?.layout_settings?.ratingDisplayStyle || 
    "numeric"
  );

  // Spacing settings
  const [sectionSpacing, setSectionSpacing] = useState<number>(
    layoutSettings?.sectionSpacing || 
    article?.layout_settings?.sectionSpacing || 
    4
  );

  useEffect(() => {
    // Update from article.layout_settings when it changes
    if (article?.layout_settings) {
      const newAwardLevel = article.layout_settings.awardLevel || 
                         article.layout_settings.award || 
                         "empty_value"; // Default to "empty_value"
      setAwardLevel(newAwardLevel);
      setShowAwards(article.layout_settings.showAwards !== undefined ? 
        article.layout_settings.showAwards : true);
      setContentAlignment(article.layout_settings.contentAlignment || "left");
      setShowFeaturedImage(article.layout_settings.showFeaturedImage !== undefined ?
        article.layout_settings.showFeaturedImage : true);
      setLayoutWidth(article.layout_settings.layoutWidth || "standard");
      setShowTableOfContents(article.layout_settings.showTableOfContents !== undefined ?
        article.layout_settings.showTableOfContents : false);
      
      // New settings
      setColorTheme(article.layout_settings.colorTheme || "default");
      setFontSize(article.layout_settings.fontSize || "medium");
      setHeadingStyle(article.layout_settings.headingStyle || "standard");
      setShowProsConsSection(article.layout_settings.showProsConsSection !== undefined ?
        article.layout_settings.showProsConsSection : true);
      setShowVerdictSection(article.layout_settings.showVerdictSection !== undefined ?
        article.layout_settings.showVerdictSection : true);
      setShowRatingCriteria(article.layout_settings.showRatingCriteria !== undefined ?
        article.layout_settings.showRatingCriteria : true);
      setRatingDisplayStyle(article.layout_settings.ratingDisplayStyle || "numeric");
      setSectionSpacing(article.layout_settings.sectionSpacing || 4);
    }
  }, [article?.layout_settings]);

  useEffect(() => {
    // Update from layoutSettings prop when it changes
    if (layoutSettings) {
      const newAwardLevel = layoutSettings.awardLevel || 
                         layoutSettings.award || 
                         "empty_value"; // Default to "empty_value"
      setAwardLevel(newAwardLevel);
      setShowAwards(layoutSettings.showAwards !== undefined ? 
        layoutSettings.showAwards : true);
      setContentAlignment(layoutSettings.contentAlignment || "left");
      setShowFeaturedImage(layoutSettings.showFeaturedImage !== undefined ?
        layoutSettings.showFeaturedImage : true);
      setLayoutWidth(layoutSettings.layoutWidth || "standard");
      setShowTableOfContents(layoutSettings.showTableOfContents !== undefined ?
        layoutSettings.showTableOfContents : false);
      
      // New settings
      setColorTheme(layoutSettings.colorTheme || "default");
      setFontSize(layoutSettings.fontSize || "medium");
      setHeadingStyle(layoutSettings.headingStyle || "standard");
      setShowProsConsSection(layoutSettings.showProsConsSection !== undefined ?
        layoutSettings.showProsConsSection : true);
      setShowVerdictSection(layoutSettings.showVerdictSection !== undefined ?
        layoutSettings.showVerdictSection : true);
      setShowRatingCriteria(layoutSettings.showRatingCriteria !== undefined ?
        layoutSettings.showRatingCriteria : true);
      setRatingDisplayStyle(layoutSettings.ratingDisplayStyle || "numeric");
      setSectionSpacing(layoutSettings.sectionSpacing || 4);
    }
  }, [layoutSettings]);

  const handleSave = async () => {
    console.log("Saving layout settings");
    // Convert "empty_value" back to empty string for storage if needed
    const storeAwardLevel = awardLevel === "empty_value" ? "" : awardLevel;
    
    const updatedSettings = {
      ...article.layout_settings,
      awardLevel: storeAwardLevel,
      showAwards,
      // Keep award for backward compatibility
      award: storeAwardLevel,
      // Add additional layout settings
      contentAlignment,
      showFeaturedImage,
      layoutWidth,
      showTableOfContents,
      // New settings
      colorTheme,
      fontSize,
      headingStyle,
      showProsConsSection,
      showVerdictSection,
      showRatingCriteria,
      ratingDisplayStyle,
      sectionSpacing
    };

    console.log("Updated settings:", updatedSettings);

    // Save the updated layout settings to the database
    const { error } = await supabase
      .from('content')
      .update({ layout_settings: updatedSettings })
      .eq('id', article.id);

    if (error) {
      console.error("Error updating layout settings:", error);
    } else {
      if (onChange) {
        // Call the new onChange handler if provided
        onChange(updatedSettings);
      }
      onSave(updatedSettings);
    }
  };

  const handleChange = (setting: string, value: any) => {
    console.log(`Setting ${setting} changed to:`, value);
    
    let updatedSettings: Record<string, any> = {};
    
    // Handle special case for award
    if (setting === 'award') {
      const storeAwardLevel = value === "empty_value" ? "" : value;
      setAwardLevel(value);
      updatedSettings = {
        ...(layoutSettings || article?.layout_settings || {}),
        awardLevel: storeAwardLevel,
        award: storeAwardLevel, // Keep award for backward compatibility
        showAwards
      };
    } else {
      // Handle other settings
      switch(setting) {
        case 'showAwards':
          setShowAwards(value);
          break;
        case 'contentAlignment':
          setContentAlignment(value);
          break;
        case 'showFeaturedImage':
          setShowFeaturedImage(value);
          break;
        case 'layoutWidth':
          setLayoutWidth(value);
          break;
        case 'showTableOfContents':
          setShowTableOfContents(value);
          break;
        case 'colorTheme':
          setColorTheme(value);
          break;
        case 'fontSize':
          setFontSize(value);
          break;
        case 'headingStyle':
          setHeadingStyle(value);
          break;
        case 'showProsConsSection':
          setShowProsConsSection(value);
          break;
        case 'showVerdictSection':
          setShowVerdictSection(value);
          break;
        case 'showRatingCriteria':
          setShowRatingCriteria(value);
          break;
        case 'ratingDisplayStyle':
          setRatingDisplayStyle(value);
          break;
        case 'sectionSpacing':
          setSectionSpacing(value);
          break;
      }
      
      // Create the updated settings object
      updatedSettings = {
        ...(layoutSettings || article?.layout_settings || {}),
        awardLevel: awardLevel === "empty_value" ? "" : awardLevel,
        award: awardLevel === "empty_value" ? "" : awardLevel,
        showAwards,
        contentAlignment,
        showFeaturedImage,
        layoutWidth,
        showTableOfContents,
        colorTheme,
        fontSize,
        headingStyle,
        showProsConsSection,
        showVerdictSection,
        showRatingCriteria,
        ratingDisplayStyle,
        sectionSpacing,
        [setting]: value
      };
    }
    
    // Call the onChange handler immediately for real-time updates if provided
    if (onChange) {
      onChange(updatedSettings);
    }
  };

  // Only render actual award banner preview if there is a real award (not empty_value)
  const shouldShowPreview = awardLevel && awardLevel !== "empty_value";

  // Determine which content type specific options to show
  const isReview = contentType === 'review' || 
                  layoutTemplate === 'review' || 
                  layoutTemplate === 'basic-review' || 
                  layoutTemplate === 'enhanced-review';

  return (
    <div className="bg-white p-6 rounded-lg border shadow-sm">
      <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
        <Layers className="h-5 w-5 text-blue-500" />
        Layout Settings
      </h2>
      
      <Tabs defaultValue="awards" className="w-full mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="awards" className="flex items-center gap-1">
            <Award className="h-4 w-4" />
            <span>Awards</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Columns className="h-4 w-4" />
            <span>Layout</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <AlignLeft className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1">
            <Palette className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
          {isReview && (
            <TabsTrigger value="review" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>Review</span>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="awards" className="space-y-4">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Award Badge</label>
            <Select
              value={awardLevel || "empty_value"}
              onValueChange={(value) => handleChange('award', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an award" />
              </SelectTrigger>
              <SelectContent>
                {AWARD_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              If an award is given, it will appear as a banner at the top of the article
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Show Awards</label>
              <p className="text-xs text-gray-500">
                Toggle the visibility of award badges on this article
              </p>
            </div>
            <Switch 
              checked={showAwards} 
              onCheckedChange={(checked) => handleChange('showAwards', checked)} 
            />
          </div>
          
          {/* Preview */}
          {shouldShowPreview && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                <AwardBanner awardLevel={awardLevel} />
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="layout" className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Layout Width</label>
            <Select
              value={layoutWidth}
              onValueChange={(value) => handleChange('layoutWidth', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select width" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="narrow">Narrow</SelectItem>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Controls the maximum width of the content area
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Section Spacing</label>
            <div className="flex items-center gap-4">
              <Slider 
                value={[sectionSpacing]} 
                min={1} 
                max={8} 
                step={1}
                onValueChange={(value) => handleChange('sectionSpacing', value[0])}
                className="flex-1"
              />
              <span className="text-sm font-medium w-8 text-center">{sectionSpacing}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Adjust spacing between content sections (1-8)
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Featured Image</label>
              <p className="text-xs text-gray-500">
                Show or hide the featured image at the top of the article
              </p>
            </div>
            <Switch 
              checked={showFeaturedImage} 
              onCheckedChange={(checked) => handleChange('showFeaturedImage', checked)} 
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm font-medium">Table of Contents</label>
              <p className="text-xs text-gray-500">
                Automatically generate a table of contents from headings
              </p>
            </div>
            <Switch 
              checked={showTableOfContents} 
              onCheckedChange={(checked) => handleChange('showTableOfContents', checked)} 
            />
          </div>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Text Alignment</label>
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={contentAlignment === "left" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('contentAlignment', 'left')}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Left align</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={contentAlignment === "center" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('contentAlignment', 'center')}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Center align</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant={contentAlignment === "right" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleChange('contentAlignment', 'right')}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Right align</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Controls the text alignment in the main content area
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Font Size</label>
            <Select
              value={fontSize}
              onValueChange={(value) => handleChange('fontSize', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Controls the base font size for the content
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Heading Style</label>
            <Select
              value={headingStyle}
              onValueChange={(value) => handleChange('headingStyle', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select heading style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="underlined">Underlined</SelectItem>
                <SelectItem value="bold">Extra Bold</SelectItem>
                <SelectItem value="colored">Colored</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Sets the style for headings throughout the article
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Color Theme</label>
            <Select
              value={colorTheme}
              onValueChange={(value) => handleChange('colorTheme', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select color theme" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_THEME_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Sets the color scheme for the entire article
            </p>
          </div>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Theme Preview</h3>
            <div className="grid grid-cols-3 gap-2">
              {COLOR_THEME_OPTIONS.filter(t => t.value !== "default").map((theme) => (
                <div 
                  key={theme.value}
                  className={`p-2 rounded cursor-pointer text-center border ${
                    colorTheme === theme.value ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  onClick={() => handleChange('colorTheme', theme.value)}
                >
                  <div 
                    className={`h-6 w-full rounded mb-1 bg-${theme.value}-500`}
                  ></div>
                  <span className="text-xs font-medium">{theme.label}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        {isReview && (
          <TabsContent value="review" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Pros & Cons Section</label>
                <p className="text-xs text-gray-500">
                  Show or hide the pros and cons comparison
                </p>
              </div>
              <Switch 
                checked={showProsConsSection} 
                onCheckedChange={(checked) => handleChange('showProsConsSection', checked)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Verdict Section</label>
                <p className="text-xs text-gray-500">
                  Show or hide the final verdict section
                </p>
              </div>
              <Switch 
                checked={showVerdictSection} 
                onCheckedChange={(checked) => handleChange('showVerdictSection', checked)} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <label className="text-sm font-medium">Rating Criteria</label>
                <p className="text-xs text-gray-500">
                  Show or hide detailed rating criteria
                </p>
              </div>
              <Switch 
                checked={showRatingCriteria} 
                onCheckedChange={(checked) => handleChange('showRatingCriteria', checked)} 
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Rating Display Style</label>
              <Select
                value={ratingDisplayStyle}
                onValueChange={(value) => handleChange('ratingDisplayStyle', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select display style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numeric">Numeric (e.g., 8.5/10)</SelectItem>
                  <SelectItem value="stars">Stars (★★★★☆)</SelectItem>
                  <SelectItem value="bars">Progress Bars</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Determines how ratings are displayed in the review
              </p>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Rating Style Preview</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card className={ratingDisplayStyle === "numeric" ? "ring-2 ring-blue-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Numeric</span>
                      <span className="text-xl font-bold">8.5<span className="text-sm text-gray-500">/10</span></span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={ratingDisplayStyle === "stars" ? "ring-2 ring-blue-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Stars</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={ratingDisplayStyle === "bars" ? "ring-2 ring-blue-200" : ""}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Progress Bars</span>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={ratingDisplayStyle === "minimal" ? "ring-2 ring-blue-200" : ""}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Minimal</span>
                      <Badge variant="secondary">8.5</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      <Separator className="my-6" />
      
      <Button onClick={handleSave} className="bg-blue-600 text-white hover:bg-blue-700">
        Save Settings
      </Button>
    </div>
  );
};

export default LayoutSettings;
