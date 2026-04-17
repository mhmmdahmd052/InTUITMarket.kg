import { NextResponse } from 'next/server'
import { serverClient } from '../../../sanity/serverClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const query = `*[_type == "project"] | order(_createdAt desc) {
      _id,
      name,
      description,
      status,
      price,
      "imageUrl": image.asset->url
    }`
    
    const projects = await serverClient.fetch(query)

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}
