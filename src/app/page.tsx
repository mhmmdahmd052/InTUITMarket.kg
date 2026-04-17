import { client } from "@/sanity/client";
import HomeContent from "@/components/home/HomeContent";
import { featuredProducts } from "@/lib/featuredProducts";

async function getHomePageData() {
  // STRICT SLUG FETCH: Fetch specifically requested featured products by slug
  const query = `*[_type == "project" && slug.current in $slugs] {
    _id,
    name,
    description,
    status,
    price,
    category,
    slug,
    "imageUrl": image.asset->url
  }`;
  
  try {
    const products = await client.fetch(query, { slugs: featuredProducts });
    
    // Ensure we maintain the exact order from featuredProducts array
    const sorted = featuredProducts
      .map(slug => products.find((p: any) => p.slug?.current === slug))
      .filter(Boolean);
      
    return sorted.slice(0, 4);
  } catch (err) {
    console.error(`[DATA INTEGRITY] Fetch failed:`, err);
    return [];
  }
}

export default async function HomePage() {
  const projects = await getHomePageData();

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <HomeContent projects={projects || []} />
    </div>
  );
}
