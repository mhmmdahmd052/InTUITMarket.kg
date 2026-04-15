import { client } from "@/sanity/client";
import { notFound } from "next/navigation";
import ProductDetailClient from "@/components/ProductDetailClient";

async function getProjectById(id: string) {
  const query = `*[_type == "project" && _id == $id][0] {
    _id,
    name,
    description,
    status,
    price,
    "imageUrl": image.asset->url
  }`;
  return client.fetch(query, { id });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectById(resolvedParams.id);
  return {
    title: project ? `${project.name} | InTUITMarket.kg` : 'Product Not Found',
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectById(resolvedParams.id);

  if (!project) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen">
      <ProductDetailClient project={project} />
    </div>
  );
}
