
import { supabase } from '@/integrations/supabase/client';

interface ContentItem {
  title: string;
  description: string;
  content: string;
  type: 'article' | 'review';
  featured_image?: string;
  status: 'published';
  category_slug: string;
  subcategory_slug: string;
  review_details?: {
    overall_score: number;
    youtube_url?: string;
    gallery?: string[];
    product_specs?: Array<{ label: string; value: string }>;
  };
}

const sampleContent: ContentItem[] = [
  // Reviews Category
  {
    title: "iPhone 15 Pro Max Review",
    description: "A comprehensive review of Apple's latest flagship smartphone",
    content: `<h2>Design and Build Quality</h2>
    <p>The iPhone 15 Pro Max features a premium titanium design that's both lighter and more durable than its predecessors. The new material choice marks a significant departure from the stainless steel used in previous Pro models.</p>
    <h2>Camera System</h2>
    <p>With its 48MP main sensor and improved telephoto capabilities, the camera system represents a major leap forward in mobile photography.</p>`,
    type: "review",
    featured_image: "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/iphone15.jpg",
    status: "published",
    category_slug: "reviews",
    subcategory_slug: "smartphones",
    review_details: {
      overall_score: 9.5,
      youtube_url: "https://www.youtube.com/watch?v=xqyUdNxWazA",
      gallery: [
        "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/iphone15-1.jpg",
        "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/iphone15-2.jpg"
      ],
      product_specs: [
        { label: "Display", value: "6.7-inch Super Retina XDR OLED" },
        { label: "Processor", value: "A17 Pro chip" },
        { label: "Storage", value: "128GB/256GB/512GB/1TB" }
      ]
    }
  },
  {
    title: "Samsung Galaxy S24 Ultra Deep Dive",
    description: "Exploring Samsung's latest flagship with AI capabilities",
    content: `<h2>AI Features</h2>
    <p>The S24 Ultra introduces Samsung's most advanced AI features yet, transforming how we interact with our smartphones.</p>
    <h2>Performance</h2>
    <p>Powered by the latest Snapdragon chip, the S24 Ultra handles any task with ease.</p>`,
    type: "review",
    featured_image: "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/s24ultra.jpg",
    status: "published",
    category_slug: "reviews",
    subcategory_slug: "smartphones",
    review_details: {
      overall_score: 9.3,
      product_specs: [
        { label: "Display", value: "6.8-inch Dynamic AMOLED 2X" },
        { label: "Processor", value: "Snapdragon 8 Gen 3" },
        { label: "Battery", value: "5000mAh" }
      ]
    }
  },
  // News Category
  {
    title: "The Future of AI in 2024",
    description: "Exploring the latest developments in artificial intelligence",
    content: `<h2>Recent Breakthroughs</h2>
    <p>2024 has seen remarkable advances in AI technology, particularly in natural language processing and computer vision.</p>
    <h2>Impact on Industry</h2>
    <p>These developments are transforming industries from healthcare to finance.</p>`,
    type: "article",
    featured_image: "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/ai-future.jpg",
    status: "published",
    category_slug: "news",
    subcategory_slug: "technology"
  },
  {
    title: "Gaming Industry Trends 2024",
    description: "The latest developments in gaming technology and culture",
    content: `<h2>Cloud Gaming Revolution</h2>
    <p>Cloud gaming services are becoming increasingly sophisticated, offering console-quality gaming on any device.</p>
    <h2>Virtual Reality Advancements</h2>
    <p>New VR headsets are pushing the boundaries of immersive gaming experiences.</p>`,
    type: "article",
    featured_image: "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/gaming-trends.jpg",
    status: "published",
    category_slug: "news",
    subcategory_slug: "gaming"
  },
  // Guides Category
  {
    title: "Building Your First Gaming PC",
    description: "A comprehensive guide to assembling your own gaming computer",
    content: `<h2>Choosing Components</h2>
    <p>Learn how to select compatible components that match your budget and performance needs.</p>
    <h2>Assembly Guide</h2>
    <p>Step-by-step instructions for putting together your gaming rig safely and efficiently.</p>`,
    type: "article",
    featured_image: "https://cshonfrvhdqpsheighta.supabase.co/storage/v1/object/public/images/pc-build.jpg",
    status: "published",
    category_slug: "guides",
    subcategory_slug: "pc-building"
  }
];

export const importSampleContent = async () => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  if (!userId) throw new Error("No user logged in");

  for (const item of sampleContent) {
    try {
      // 1. Get category and subcategory IDs
      const { data: menuCategory } = await supabase
        .from('menu_categories')
        .select('id')
        .eq('slug', item.category_slug)
        .single();

      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('id, slug')
        .eq('slug', item.subcategory_slug)
        .eq('category_id', menuCategory?.id)
        .single();

      if (!menuCategory || !menuItem) {
        console.error(`Category or subcategory not found for: ${item.title}`);
        continue;
      }

      // 2. Get or create the page
      const { data: existingPage } = await supabase
        .from('pages')
        .select('id')
        .eq('menu_item_id', menuItem.id)
        .single();

      let pageId = existingPage?.id;

      if (!existingPage) {
        const { data: newPage, error: pageError } = await supabase
          .from('pages')
          .insert({
            menu_item_id: menuItem.id,
            title: item.title,
            description: item.description,
            page_type: 'subcategory',
            slug: menuItem.slug // Use the menu item's slug for the page
          })
          .select()
          .single();

        if (pageError) throw pageError;
        pageId = newPage.id;
      }

      // 3. Create the content
      const { data: content, error: contentError } = await supabase
        .from('content')
        .insert({
          title: item.title,
          description: item.description,
          content: item.content,
          type: item.type,
          status: item.status,
          featured_image: item.featured_image,
          author_id: userId
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // 4. Create review details if applicable
      if (item.type === 'review' && item.review_details) {
        const { error: reviewError } = await supabase
          .from('review_details')
          .insert({
            content_id: content.id,
            overall_score: item.review_details.overall_score,
            youtube_url: item.review_details.youtube_url,
            gallery: item.review_details.gallery,
            product_specs: item.review_details.product_specs
          });

        if (reviewError) throw reviewError;
      }

      // 5. Link content to page
      const { error: linkError } = await supabase
        .from('page_content')
        .insert({
          page_id: pageId,
          content_id: content.id,
          order_index: 0
        });

      if (linkError) throw linkError;

      console.log(`Successfully imported: ${item.title}`);
    } catch (error) {
      console.error(`Error importing ${item.title}:`, error);
    }
  }
};
