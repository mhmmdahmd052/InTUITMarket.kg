import { client } from "@/sanity/client";
import HomeContent from "@/components/home/HomeContent";

// Ensure the page is always dynamic to fetch live data in production
export const dynamic = 'force-dynamic';

async function getHomePageData() {
  try {
    const query = `*[_type == "project"] | order(_createdAt desc) [0...4] {
      _id,
      name,
      description,
      status,
      price,
      category,
      slug,
      "imageUrl": image.asset->url
    }`;
    const products = await client.fetch(query).catch((e: any) => {
      console.error("Sanity Fetch Error:", e);
      return [];
    });
    return Array.isArray(products) ? products : [];
  } catch (err) {
    console.error("getHomePageData Fatal Error:", err);
    return [];
  }
}

export default async function Page() {
  try {
    const projects = await getHomePageData();

    return (
      <HomeContent projects={projects} />
    );

  } catch (err) {
    // Graceful server-side fallback if the entire component tree fails
    return (
      <div style={{ padding: '60px', background: '#0a0a0a', color: '#ef4444', minHeight: '100vh', fontFamily: 'monospace' }}>
        <h1 style={{ marginBottom: '20px' }}>InTUITMarket</h1>
        <div style={{ background: '#1a1a1a', padding: '20px', borderRadius: '12px', border: '1px solid #451a1a' }}>
          <p>The marketplace is currently undergoing maintenance. Please try again later.</p>
          {/* Diagnostic info remains hidden in source for dev use */}
          {/* <pre style={{ display: 'none' }}>{String(err)}</pre> */}
        </div>
      </div>
    );
  }
}
