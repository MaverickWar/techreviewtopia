
import { LayoutTemplate, LAYOUT_OPTIONS } from "@/types/content";

// Page types for better organization
export const PAGE_TYPES = [
  { id: "category", name: "Category", description: "Main navigation category page" },
  { id: "subcategory", name: "Subcategory", description: "Content collection under a category" },
  { id: "standalone", name: "Standalone", description: "Independent page not tied to navigation" },
];

// Helper function to validate if a string is a valid LayoutTemplate
export const isValidLayoutTemplate = (layout: string): layout is LayoutTemplate => {
  return LAYOUT_OPTIONS.some(option => option.id === layout);
};

// Helper function to get a valid layout template or default to "classic"
export const getValidLayoutTemplate = (layout?: string): LayoutTemplate => {
  if (layout && isValidLayoutTemplate(layout)) {
    return layout;
  }
  return "classic";
};

// Helper to get friendly name for page type
export const getPageTypeName = (pageType: string): string => {
  const pageTypeObj = PAGE_TYPES.find(type => type.id === pageType);
  return pageTypeObj ? pageTypeObj.name : pageType.charAt(0).toUpperCase() + pageType.slice(1);
};
