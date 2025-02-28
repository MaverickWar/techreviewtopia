
import { useState, useEffect } from "react";
import { ContentType, LayoutTemplate } from "@/types/content";
import { ContentFormAdditions } from "./ContentFormAdditions";

interface ContentFormLayoutIntegrationProps {
  contentType: ContentType;
  initialLayoutTemplate?: LayoutTemplate;
  onLayoutChange: (layout: LayoutTemplate) => void;
}

// This is a helper component to integrate the layout selection into the ContentForm
export const ContentFormLayoutIntegration = ({
  contentType,
  initialLayoutTemplate = "classic",
  onLayoutChange
}: ContentFormLayoutIntegrationProps) => {
  const [layoutTemplate, setLayoutTemplate] = useState<LayoutTemplate>(initialLayoutTemplate);
  
  useEffect(() => {
    if (initialLayoutTemplate) {
      setLayoutTemplate(initialLayoutTemplate);
    }
  }, [initialLayoutTemplate]);
  
  const handleLayoutChange = (layout: LayoutTemplate) => {
    setLayoutTemplate(layout);
    onLayoutChange(layout);
  };
  
  return (
    <ContentFormAdditions
      contentType={contentType}
      layoutTemplate={layoutTemplate}
      onLayoutChange={handleLayoutChange}
    />
  );
};
