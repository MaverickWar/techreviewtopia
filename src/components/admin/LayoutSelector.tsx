
import { useEffect, useRef } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Layout, 
  Star, 
  Image, 
  Code,
  CheckCircle2,
  ChevronDown,
  ThumbsUp,
  Award
} from "lucide-react";
import { LayoutOption, LAYOUT_OPTIONS, ContentType } from "@/types/content";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface LayoutSelectorProps {
  contentType: ContentType;
  selectedLayout: string;
  onChange: (layout: string) => void;
}

export const LayoutSelector = ({ 
  contentType, 
  selectedLayout, 
  onChange 
}: LayoutSelectorProps) => {
  console.log("🔍 LayoutSelector RENDER - props:", { contentType, selectedLayout });
  
  // Track mount state
  const isMounted = useRef(false);
  const renderCount = useRef(0);
  
  // Filter layout options based on content type
  const availableLayouts = LAYOUT_OPTIONS.filter(
    layout => layout.supportedTypes.includes(contentType)
  );
  
  console.log("🔍 LayoutSelector - Available layouts:", availableLayouts.map(l => l.id));

  // If selected layout is not valid for this content type, select the first valid option
  useEffect(() => {
    console.log("🔍 LayoutSelector - useEffect for layout validation running");
    console.log("🔍 Current selected layout:", selectedLayout);
    console.log("🔍 Available layouts:", availableLayouts.map(l => l.id));
    
    try {
      if (!isMounted.current) {
        console.log("🔍 LayoutSelector - Component mounted");
        isMounted.current = true;
      }
      
      renderCount.current += 1;
      console.log(`🔍 LayoutSelector - Render count: ${renderCount.current}`);
      
      if (selectedLayout && !availableLayouts.some(l => l.id === selectedLayout)) {
        if (availableLayouts.length > 0) {
          console.log("🔍 Selected layout not valid for content type, selecting first valid option:", availableLayouts[0].id);
          onChange(availableLayouts[0].id);
        } else {
          console.log("🔍 No layouts available for this content type!");
        }
      } else {
        console.log("🔍 Selected layout is valid:", selectedLayout);
      }
    } catch (error) {
      console.error("❌ ERROR in layout validation effect:", error);
    }
  }, [contentType, selectedLayout, availableLayouts, onChange]);

  // Get the selected layout object with error handling
  let selectedLayoutOption;
  try {
    selectedLayoutOption = availableLayouts.find(l => l.id === selectedLayout) || 
      (availableLayouts.length > 0 ? availableLayouts[0] : {
        id: 'classic',
        name: 'Classic Layout',
        description: 'Default layout',
        icon: 'file-text',
        supportedTypes: ['article', 'review']
      });
    console.log("🔍 Selected layout option:", selectedLayoutOption);
  } catch (error) {
    console.error("❌ ERROR getting selected layout option:", error);
    selectedLayoutOption = {
      id: 'classic',
      name: 'Classic Layout (Fallback)',
      description: 'Default layout',
      icon: 'file-text',
      supportedTypes: ['article', 'review']
    };
  }

  // Map layout icon string to component
  const getLayoutIcon = (iconName: string) => {
    console.log("🔍 Getting icon for:", iconName);
    try {
      switch (iconName) {
        case 'file-text': return <FileText className="h-5 w-5" />;
        case 'layout': return <Layout className="h-5 w-5" />;
        case 'star': return <Star className="h-5 w-5" />;
        case 'image': return <Image className="h-5 w-5" />;
        case 'code': return <Code className="h-5 w-5" />;
        case 'thumbs-up': return <ThumbsUp className="h-5 w-5" />;
        case 'award': return <Award className="h-5 w-5" />;
        default: 
          console.log("⚠️ Unknown icon name:", iconName);
          return <FileText className="h-5 w-5" />;
      }
    } catch (error) {
      console.error("❌ ERROR rendering icon:", error);
      return <FileText className="h-5 w-5" />;
    }
  };

  // Handle layout change with error checking
  const handleLayoutChange = (layoutId: string) => {
    console.log("🔍 Changing layout to:", layoutId);
    try {
      // Verify the layout is valid before changing
      if (availableLayouts.some(l => l.id === layoutId)) {
        console.log("✅ Layout is valid, setting to:", layoutId);
        onChange(layoutId);
      } else {
        console.error("❌ Invalid layout selected:", layoutId);
        // Fall back to first available layout
        if (availableLayouts.length > 0) {
          console.log("⚠️ Falling back to:", availableLayouts[0].id);
          onChange(availableLayouts[0].id);
        } else {
          console.error("❌ No available layouts!");
        }
      }
    } catch (error) {
      console.error("❌ ERROR changing layout:", error);
      // Prevent crashing by silently handling the error
    }
  };

  // Small screen dropdown version
  const renderDropdownSelector = () => {
    console.log("🔍 Rendering dropdown selector");
    try {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full flex justify-between items-center mb-4 md:hidden"
              onClick={() => console.log("🔍 Dropdown trigger clicked")}
            >
              <div className="flex items-center">
                <div className="p-2 rounded-md mr-2 bg-blue-100 text-blue-600">
                  {getLayoutIcon(selectedLayoutOption.icon)}
                </div>
                <span>{selectedLayoutOption.name}</span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-full min-w-[200px] bg-white z-50 border border-gray-200 shadow-md">
            {availableLayouts.map((layout) => (
              <DropdownMenuItem 
                key={layout.id}
                onClick={() => {
                  console.log("🔍 Dropdown item clicked:", layout.id);
                  handleLayoutChange(layout.id);
                }}
                className="cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center w-full">
                  <div className={`p-1 rounded-md mr-2 ${
                    selectedLayout === layout.id 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getLayoutIcon(layout.icon)}
                  </div>
                  <span>{layout.name}</span>
                  {selectedLayout === layout.id && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500 ml-auto" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    } catch (error) {
      console.error("❌ ERROR rendering dropdown selector:", error);
      // Provide a fallback to prevent crashes
      return (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
          Error rendering layout selector. Try refreshing the page.
          <pre className="text-xs mt-2 p-2 bg-amber-100 rounded">
            {String(error)}
          </pre>
        </div>
      );
    }
  };

  // If no layouts are available, show a helpful message
  if (availableLayouts.length === 0) {
    console.log("⚠️ No layouts available");
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
        No layout templates are available for this content type.
        Using default layout.
      </div>
    );
  }

  try {
    console.log("🔍 Rendering full layout selector");
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Select Layout Template</h3>
        </div>
        
        {/* Mobile dropdown */}
        {renderDropdownSelector()}
        
        {/* Radio group for larger screens */}
        <RadioGroup
          value={selectedLayout}
          onValueChange={(value) => {
            console.log("🔍 Radio group value changed:", value);
            handleLayoutChange(value);
          }}
          className="hidden md:grid md:grid-cols-3 gap-4"
        >
          {availableLayouts.map((layout) => (
            <div key={layout.id} className="relative">
              <RadioGroupItem
                value={layout.id}
                id={`layout-${layout.id}`}
                className="sr-only peer"
              />
              <Label
                htmlFor={`layout-${layout.id}`}
                className="cursor-pointer"
                onClick={() => console.log("🔍 Layout label clicked:", layout.id)}
              >
                <Card className={`h-full p-4 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 ${
                  selectedLayout === layout.id 
                    ? 'border-2 border-blue-500 shadow-md' 
                    : 'hover:border-gray-300'
                }`}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-center mb-2">
                      <div className={`p-2 rounded-md mr-2 ${
                        selectedLayout === layout.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getLayoutIcon(layout.icon)}
                      </div>
                      <div className="font-medium">{layout.name}</div>
                      {selectedLayout === layout.id && (
                        <CheckCircle2 className="h-5 w-5 text-blue-500 ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex-grow">
                      {layout.description}
                    </p>
                  </div>
                </Card>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  } catch (error) {
    console.error("❌ ERROR rendering layout selector:", error);
    // Provide a fallback to prevent crashes
    return (
      <div className="p-4 bg-amber-50 text-amber-800 rounded-md">
        <h3 className="font-bold mb-2">Error rendering layout selector</h3>
        <p>Try refreshing the page. If the problem persists, please contact support.</p>
        <pre className="text-xs mt-4 p-3 bg-amber-100 rounded overflow-auto max-h-[200px]">
          {String(error)}
          {error instanceof Error && error.stack ? `\n\nStack: ${error.stack}` : ''}
        </pre>
      </div>
    );
  }
};
