import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'o2gcr94x',
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false,
});

async function findAnythingWithImage() {
  const query = `*[defined(image.asset)] {
    _id,
    _type,
    name,
    "imageUrl": image.asset->url
  }`;
  const results = await client.fetch(query);
  console.log(JSON.stringify(results, null, 2));
}

findAnythingWithImage();
