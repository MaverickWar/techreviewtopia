
import { Button } from "@/components/ui/button";
import { ContentType } from "@/types/content";
import { FileText, Star } from "lucide-react";

interface TypeSelectorProps {
  contentType: ContentType;
  onTypeChange: (type: ContentType) => void;
}

export const TypeSelector = ({ contentType, onTypeChange }: TypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Type</label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant={contentType === "article" ? "default" : "outline"}
          onClick={() => onTypeChange("article")}
        >
          <FileText className="mr-2 h-4 w-4" />
          Article
        </Button>
        <Button
          type="button"
          variant={contentType === "review" ? "default" : "outline"}
          onClick={() => onTypeChange("review")}
        >
          <Star className="mr-2 h-4 w-4" />
          Review
        </Button>
      </div>
    </div>
  );
};
