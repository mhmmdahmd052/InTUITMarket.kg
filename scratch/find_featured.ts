import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "o2gcr94x",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-01",
});

async function findFeatured() {
  const query = `*[_type == "project"] {
    _id,
    name,
    "imageUrl": image.asset->url
  }`;
  const data = await client.fetch(query);
  console.log("Found products in o2gcr94x:", data.length);
  data.forEach((p: any) => {
    console.log(`- ID: ${p._id} | Name: ${JSON.stringify(p.name)} | HasImage: ${!!p.imageUrl}`);
  });
}

findFeatured();
