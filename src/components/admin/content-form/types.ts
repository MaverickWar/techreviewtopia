
export interface ProductSpec {
  category: string;
  specs: Array<{
    label: string;
    value: string;
  }>;
}

export interface RatingCriterion {
  name: string;
  score: number;
}

export interface ContentFormData {
  id?: string;
  title: string;
  description: string | null;
  content: string | null;
  type: "article" | "review";
  status: "draft" | "published";
  author_id: string | null;
  page_id: string | null;
  featured_image: string | null;
  gallery: string[];
  product_specs: ProductSpec[];
  rating_criteria: RatingCriterion[];
  overall_score: number;
  youtube_url?: string | null;
  layout_template?: string;
  layout_settings?: Record<string, any>;
}
