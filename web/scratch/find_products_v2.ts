import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'o2gcr94x',
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false,
});

async function findProducts() {
  const query = `*[_type == "project"] {
    _id,
    name,
    "slug": slug.current,
    "imageUrl": image.asset->url
  }`;
  const products = await client.fetch(query);
  console.log(JSON.stringify(products, null, 2));
}

findProducts();
