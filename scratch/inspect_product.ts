import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "o21bxt91",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-03-01",
});

async function inspectProduct() {
  const id = "Mi1NsiniSKJIMcE6xDgfcL";
  const query = `*[_id == $id || _id == "drafts." + $id][0]`;
  const data = await client.fetch(query, { id });
  console.log("Product JSON:", JSON.stringify(data, null, 2));
}

inspectProduct();
