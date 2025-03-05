
import { ContentStatus } from "@/types/content";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Globe, FileEdit } from "lucide-react";

interface StatusToggleProps {
  status: ContentStatus;
  onStatusChange: (status: ContentStatus) => void;
}

export const StatusToggle = ({ status, onStatusChange }: StatusToggleProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Label htmlFor="publish-status" className="text-sm font-medium">
          Status:
        </Label>
        <div className="flex items-center space-x-2">
          <Switch
            id="publish-status"
            checked={status === "published"}
            onCheckedChange={(checked) => 
              onStatusChange(checked ? "published" : "draft")
            }
          />
          <span className="text-sm">
            {status === "published" ? (
              <div className="flex items-center text-green-600">
                <Globe className="h-4 w-4 mr-1" />
                Published
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <FileEdit className="h-4 w-4 mr-1" />
                Draft
              </div>
            )}
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {status === "published" 
          ? "Content is visible to the public" 
          : "Content is only visible to you"
        }
      </p>
    </div>
  );
};
