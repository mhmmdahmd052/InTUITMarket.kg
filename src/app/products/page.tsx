import { client } from "@/sanity/client";
import CatalogClient from "@/components/CatalogClient";

async function getProducts(query?: string) {
  const groq = `*[_type == "project"] | order(_createdAt desc) {
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
    return await client.fetch(groq);
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const initialQuery = params.q || "";
  const products = await getProducts(initialQuery);

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen pt-32 pb-20 px-4 md:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <CatalogClient initialProjects={products} initialQuery={initialQuery} />
      </div>
    </div>
  );
}
