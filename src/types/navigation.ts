
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
