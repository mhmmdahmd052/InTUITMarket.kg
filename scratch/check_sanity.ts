import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "o21bxt91",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-01",
});

async function checkImages() {
  const query = `*[_type == "project"] {
    _id,
    name,
    "imageUrl": image.asset->url
  }`;
  const data: any[] = await client.fetch(query);
  console.log("Found products:", data.length);
  const withImages = data.filter((d: any) => d.imageUrl);
  console.log("With images:", withImages.length);
  if (withImages.length > 0) {
    console.log("Sample product with image:", withImages[0]);
  } else {
    console.log("CRITICAL: ZERO products have images in Sanity.");
  }
}

checkImages();
