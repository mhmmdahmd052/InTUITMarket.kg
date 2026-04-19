import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  console.error("[SANITY CONFIG ERROR] Missing env vars", { projectId, dataset });
}

let clientInstance: any = null;

try {
  // We use "missing" as fallback only to prevent constructor throw if possible, 
  // but many clients throw if ID is obviously invalid.
  clientInstance = createClient({
    projectId: projectId || "missing-project-id",
    dataset: dataset || "production",
    apiVersion: "2024-01-01",
    useCdn: true,
  });
} catch (error) {
  console.error("[SANITY CLIENT INIT FATAL]", error);
}

export const client = clientInstance;
