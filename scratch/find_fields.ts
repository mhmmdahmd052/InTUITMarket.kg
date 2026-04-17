import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "o2gcr94x",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-01",
});

async function findAnyFields() {
  const query = `*[_type == "project"][0]`;
  const data = await client.fetch(query);
  console.log("Full JSON of one product:", JSON.stringify(data, null, 2));
}

findAnyFields();
