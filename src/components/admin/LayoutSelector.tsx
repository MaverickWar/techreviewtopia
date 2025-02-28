
import { useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  FileText, 
  Layout, 
  Star, 
  Image, 
  Code,
  CheckCircle2
} from "lucide-react";
import { LayoutOption, LAYOUT_OPTIONS, ContentType } from "@/types/content";

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
  // Filter layout options based on content type
  const availableLayouts = LAYOUT_OPTIONS.filter(
    layout => layout.supportedTypes.includes(contentType)
  );

  // If selected layout is not valid for this content type, select the first valid option
  useEffect(() => {
    if (selectedLayout && !availableLayouts.some(l => l.id === selectedLayout)) {
      onChange(availableLayouts[0].id);
    }
  }, [contentType, selectedLayout, availableLayouts, onChange]);

  // Map layout icon string to component
  const getLayoutIcon = (iconName: string) => {
    switch (iconName) {
      case 'file-text': return <FileText className="h-5 w-5" />;
      case 'layout': return <Layout className="h-5 w-5" />;
      case 'star': return <Star className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'code': return <Code className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Select Layout Template</h3>
      </div>
      
      <RadioGroup
        value={selectedLayout}
        onValueChange={onChange}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {availableLayouts.map((layout) => (
          <div key={layout.id} className="relative">
            <RadioGroupItem
              value={layout.id}
              id={`layout-${layout.id}`}
              className="sr-only"
            />
            <Label
              htmlFor={`layout-${layout.id}`}
              className="cursor-pointer"
            >
              <Card className={`h-full p-4 transition-all ${
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
};
