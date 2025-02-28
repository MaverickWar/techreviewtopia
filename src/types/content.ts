
export type ContentType = "article" | "review";
export type ContentStatus = "draft" | "published";
export type LayoutTemplate = "classic" | "magazine" | "review" | "gallery" | "technical" | "basic-review" | "enhanced-review";

export interface RatingCriterion {
  name: string;
  score: number;
  review_id?: string;
}

export interface ReviewDetails {
  id?: string;
  content_id?: string;
  youtube_url: string | null;
  gallery: string[];
  product_specs: Record<string, any> | null;
  overall_score: number;
}

export interface ArticleData {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  type: ContentType;
  featured_image: string | null;
  published_at: string | null;
  author_id: string;
  author?: Record<string, any> | null;
  layout_template?: LayoutTemplate;
  review_details?: ReviewDetails[];
  rating_criteria?: RatingCriterion[];
  layout_settings?: Record<string, any>;
  // Additional fields from database schema
  status?: string;
  created_at?: string;
  page_id?: string | null;
}

export interface LayoutOption {
  id: LayoutTemplate;
  name: string;
  description: string;
  icon: string;
  supportedTypes: ContentType[];
}

export const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "classic",
    name: "Classic Blog",
    description: "Traditional blog layout with a featured image and content.",
    icon: "file-text",
    supportedTypes: ["article", "review"]
  },
  {
    id: "magazine",
    name: "Magazine Style",
    description: "Modern magazine layout with large featured image and styled sections.",
    icon: "layout",
    supportedTypes: ["article", "review"]
  },
  {
    id: "review",
    name: "Standard Review",
    description: "Specialized layout for product reviews with ratings and specifications.",
    icon: "star",
    supportedTypes: ["review"]
  },
  {
    id: "basic-review",
    name: "Basic Review",
    description: "Clean, simple layout focusing on essential review components.",
    icon: "thumbs-up",
    supportedTypes: ["review"]
  },
  {
    id: "enhanced-review",
    name: "Enhanced Review",
    description: "Comprehensive review layout with detailed scoring, gallery, and specs.",
    icon: "award",
    supportedTypes: ["review"]
  },
  {
    id: "gallery",
    name: "Gallery Focus",
    description: "Image-centric layout perfect for showcasing visual content.",
    icon: "image",
    supportedTypes: ["article", "review"]
  },
  {
    id: "technical",
    name: "Technical Article",
    description: "Layout optimized for technical tutorials with table of contents.",
    icon: "code",
    supportedTypes: ["article"]
  }
];
