
import { LayoutTemplate, LAYOUT_OPTIONS } from "@/types/content";

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
