import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId, useCdn } from './env';

export const serverClient = createClient({
  projectId: projectId,
  dataset: dataset,
  apiVersion: apiVersion,
  useCdn: useCdn,
  token: process.env.SANITY_TOKEN,
});
