
export type MenuType = 'standard' | 'megamenu';

export interface MenuItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  orderIndex: number | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  type: MenuType;
  orderIndex: number | null;
  items?: MenuItem[];
}

export interface ContentType {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  featured_image: string | null;
  type: 'article' | 'review';
  status: string;
  created_at: string | null;
  author_id: string;
  page_id: string | null;
  published_at: string | null;
  slug?: string;
  review_details?: Array<{
    id: string;
    content_id: string;
    overall_score: number;
    gallery?: string[];
    product_specs?: Record<string, any>;
    youtube_url?: string | null;
  }>;
}
