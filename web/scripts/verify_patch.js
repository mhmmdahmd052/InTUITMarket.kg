const { createClient } = require('@sanity/client');
require('dotenv').config({ path: '.env.local' });

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-03-27',
  token: process.env.SANITY_TOKEN
});

async function verify() {
  const res = await client.fetch('*[_type == "project"]{_id, name, slug, category, "imageUrl": image.asset->url}');
  console.log('--- DATA AUDIT ---');
  console.log(`Total Count: ${res.length}`);
  res.forEach(p => {
    console.log(`[${p._id}] Slug: ${p.slug?.current} | Cat: ${p.category} | Img: ${p.imageUrl ? 'OK' : 'MISSING'}`);
  });
}

verify();
