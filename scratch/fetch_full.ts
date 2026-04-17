import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'o2gcr94x',
  dataset: 'production',
  apiVersion: '2024-03-27',
  useCdn: false,
});

async function findAnything() {
  const query = `*[_type == "project"][0...5]`;
  const results = await client.fetch(query);
  console.log(JSON.stringify(results, null, 2));
}

findAnything();
