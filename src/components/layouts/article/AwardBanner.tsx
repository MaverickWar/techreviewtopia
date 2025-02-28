
import React from "react";
import { Award } from "lucide-react";

interface AwardBannerProps {
  award?: string;
}

export const AwardBanner: React.FC<AwardBannerProps> = ({ award }) => {
  if (!award) return null;

  // Determine colors based on award type
  const getBannerColors = (awardType: string) => {
    switch (awardType.toLowerCase()) {
      case "editor's choice":
        return "bg-purple-100 border-purple-500 text-purple-800";
      case "best value":
        return "bg-blue-100 border-blue-500 text-blue-800";
      case "best performance":
        return "bg-orange-100 border-orange-500 text-orange-800";
      case "highly recommended":
        return "bg-green-100 border-green-500 text-green-800";
      default:
        return "bg-gray-100 border-gray-500 text-gray-800";
    }
  };

  const bannerColors = getBannerColors(award);

  return (
    <div className={`mb-6 rounded-lg border-l-4 p-4 flex items-center ${bannerColors}`}>
      <Award className="h-6 w-6 mr-3 flex-shrink-0" />
      <div>
        <h3 className="font-bold text-lg">{award}</h3>
        <p className="text-sm opacity-80">Our editors have recognized this product for exceptional quality</p>
      </div>
    </div>
  );
};
