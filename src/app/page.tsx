import { client } from "@/sanity/client";
import HomeContent from "@/components/home/HomeContent";

async function getHomePageData() {
  try {
    const query = `*[_type == "project"]{
      _id,
      name,
      slug,
      "imageUrl": image.asset->url
    }`;

    const products = await client.fetch(query);
    return products?.slice(0, 4) || [];

  } catch (err) {
    console.error("SANITY ERROR:", err);
    return [];
  }
}

export default async function HomePage() {
  const projects = await getHomePageData();

  if (!projects || projects.length === 0) {
    return (
      <div style={{padding: "40px", textAlign: "center"}}>
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <HomeContent projects={projects} />
    </div>
  );
}
