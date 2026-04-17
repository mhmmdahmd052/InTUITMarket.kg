const { createClient } = require('@sanity/client');

const client = createClient({
  projectId: 'o2gcr94x',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
});

async function debugData() {
  const data = await client.fetch('*[_type == "project"]{_id, name, description, category}');
  console.log(JSON.stringify(data, null, 2));
}

debugData();
