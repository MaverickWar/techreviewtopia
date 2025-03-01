
import React from "react";
import { Ribbon } from "lucide-react";

interface AwardRibbonProps {
  award?: string;
  awardLevel?: string;
}

// Reuse the same award mapping and color logic from AwardBanner
const getAwardDisplayName = (awardValue: string): string => {
  const awardMap: Record<string, string> = {
    "editors-choice": "Editor's Choice",
    "best-value": "Best Value",
    "best-performance": "Best Performance",
    "highly-recommended": "Highly Recommended",
    "budget-pick": "Budget Pick",
    "premium-choice": "Premium Choice",
    "most-innovative": "Most Innovative"
  };
  
  return awardMap[awardValue] || awardValue
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Determine colors based on award type - simplified version from AwardBanner
const getRibbonColors = (awardType: string) => {
  // Make sure to check for both kebab-case and display name versions
  switch (awardType.toLowerCase()) {
    case "editors-choice":
    case "editor's choice":
      return "bg-purple-500 text-white";
    case "best-value":
    case "best value":
      return "bg-blue-500 text-white";
    case "best-performance":
    case "best performance":
      return "bg-orange-500 text-white";
    case "highly-recommended":
    case "highly recommended":
      return "bg-green-500 text-white";
    case "budget-pick":
    case "budget pick":
      return "bg-amber-500 text-white";
    case "premium-choice":
    case "premium choice":
      return "bg-indigo-500 text-white";
    case "most-innovative":
    case "most innovative":
      return "bg-pink-500 text-white";
    default:
      return "bg-amber-500 text-white";
  }
};

export const AwardRibbon: React.FC<AwardRibbonProps> = ({ award, awardLevel }) => {
  // Use awardLevel as primary source with award as fallback for backward compatibility
  const awardValue = awardLevel || award;
  
  if (!awardValue || awardValue === "empty_value") return null;
  
  const awardDisplayName = getAwardDisplayName(awardValue);
  const ribbonColors = getRibbonColors(awardValue);

  return (
    <div className="absolute -top-1 -left-1 z-10 overflow-visible">
      <div className={`${ribbonColors} py-1 px-3 transform -translate-x-1/4 translate-y-1/4 -rotate-45 shadow-md font-medium text-xs uppercase tracking-wider flex items-center whitespace-nowrap max-w-[200px]`}>
        <Ribbon className="h-3 w-3 mr-1 flex-shrink-0" />
        <span className="truncate">{awardDisplayName}</span>
      </div>
    </div>
  );
};
