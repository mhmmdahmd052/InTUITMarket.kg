import { client } from "@/sanity/client";

async function getHomePageData() {
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
  return await client.fetch(query);
}

export default async function HomePage() {
  try {
    const projects = await getHomePageData();

    return (
      <div style={{ padding: 20 }}>
        <h1>DEBUG MODE</h1>
        <pre>{JSON.stringify(projects?.slice(0, 2), null, 2)}</pre>
      </div>
    );
  } catch (err) {
    return (
      <div style={{ padding: 20, color: "red" }}>
        <h1>SERVER ERROR</h1>
        <pre>{String(err)}</pre>
      </div>
    );
  }
}
