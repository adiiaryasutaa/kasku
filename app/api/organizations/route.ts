import { NextResponse } from "next/server"
import db from "@/lib/data"

export async function GET() {
  try {
    const organizations = await db.organizations.findMany()
    return NextResponse.json(organizations)
  } catch (error) {
    console.error("Error fetching organizations:", error)
    return NextResponse.json({ error: "Failed to fetch organizations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.type) {
      return NextResponse.json({ error: "Name and type are required" }, { status: 400 })
    }

    // Create the organization
    const organization = await db.organizations.create({
      data: {
        name: data.name,
        description: data.description || "",
        type: data.type,
        currency: data.currency || "USD",
        logoUrl: data.logoUrl || "/placeholder.svg?height=100&width=100",
        fiscalYearStart: data.fiscalYearStart || new Date().toISOString(),
        createdBy: data.createdBy || "user_01", // Default to first user if not specified
      },
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error("Error creating organization:", error)
    return NextResponse.json({ error: "Failed to create organization" }, { status: 500 })
  }
}

