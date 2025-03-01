
import React from "react";
import { Award } from "lucide-react";

interface AwardBannerProps {
  award?: string;
  awardLevel?: string;
  className?: string; // Keep className prop
}

// Map kebab-case award values to their display names
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

export const AwardBanner: React.FC<AwardBannerProps> = ({ award, awardLevel, className }) => {
  // Use awardLevel as primary source with award as fallback for backward compatibility
  const awardValue = awardLevel || award;
  
  if (!awardValue || awardValue === "empty_value") return null;
  
  const awardDisplayName = getAwardDisplayName(awardValue);

  // Determine colors based on award type
  const getBannerColors = (awardType: string) => {
    // Make sure to check for both kebab-case and display name versions
    switch (awardType.toLowerCase()) {
      case "editors-choice":
      case "editor's choice":
        return {
          class: "bg-purple-100 border-purple-500 text-purple-800",
          icon: "text-purple-500",
          glow: "after:bg-purple-500/20"
        };
      case "best-value":
      case "best value":
        return {
          class: "bg-blue-100 border-blue-500 text-blue-800",
          icon: "text-blue-500",
          glow: "after:bg-blue-500/20"
        };
      case "best-performance":
      case "best performance":
        return {
          class: "bg-orange-100 border-orange-500 text-orange-800",
          icon: "text-orange-500",
          glow: "after:bg-orange-500/20"
        };
      case "highly-recommended":
      case "highly recommended":
        return {
          class: "bg-green-100 border-green-500 text-green-800",
          icon: "text-green-500",
          glow: "after:bg-green-500/20"
        };
      case "budget-pick":
      case "budget pick":
        return {
          class: "bg-amber-100 border-amber-500 text-amber-800",
          icon: "text-amber-500",
          glow: "after:bg-amber-500/20"
        };
      case "premium-choice":
      case "premium choice":
        return {
          class: "bg-indigo-100 border-indigo-500 text-indigo-800",
          icon: "text-indigo-500",
          glow: "after:bg-indigo-500/20"
        };
      case "most-innovative":
      case "most innovative":
        return {
          class: "bg-pink-100 border-pink-500 text-pink-800",
          icon: "text-pink-500",
          glow: "after:bg-pink-500/20"
        };
      default:
        return {
          class: "bg-amber-100 border-amber-500 text-amber-800",
          icon: "text-amber-500",
          glow: "after:bg-amber-500/20"
        };
    }
  };

  const colors = getBannerColors(awardValue);

  return (
    <div className={`rounded-lg border-l-4 p-4 flex items-center ${colors.class} shadow-sm relative overflow-hidden after:absolute after:inset-0 after:opacity-50 after:rounded-full after:w-24 after:h-24 after:blur-3xl after:-top-10 after:-right-10 ${colors.glow} ${className}`}>
      <Award className={`h-6 w-6 mr-3 flex-shrink-0 ${colors.icon}`} />
      <div className="z-10">
        <h3 className="font-bold text-base">{awardDisplayName}</h3>
        <p className="text-xs opacity-90">Our editors have recognized this product</p>
      </div>
    </div>
  );
};
