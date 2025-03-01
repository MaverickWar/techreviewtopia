
import { ContentType, ContentStatus, LayoutTemplate, ArticleData } from "@/types/content";

export type RatingCriterion = {
  name: string;
  score: number;
  review_id?: string;
};

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ReviewDetails {
  id?: string;
  content_id?: string;
  youtube_url: string | null;
  gallery: string[];
  product_specs: ProductSpec[];
  overall_score: number;
}

export interface ContentFormData {
  id?: string;
  title: string;
  description: string | null;
  content: string | null;
  type: ContentType;
  status: ContentStatus;
  author_id: string | null;
  page_id: string | null;
  featured_image?: string | null;
  youtube_url?: string | null;
  gallery?: string[];
  product_specs?: ProductSpec[];
  rating_criteria?: RatingCriterion[];
  overall_score?: number;
  review_details?: ReviewDetails;
  layout_template?: LayoutTemplate;
  layout_settings?: Record<string, any>;
}

export interface ContentFormProps {
  initialData?: ContentFormData;
}
