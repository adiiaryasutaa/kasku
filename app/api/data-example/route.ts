import { NextResponse } from "next/server"
import db from "@/lib/data"

export async function GET() {
  try {
    // Example: Get all categories
    const categories = await db.categories.findMany()

    // Example: Get a specific transaction
    const transaction = await db.transactions.findUnique({
      where: { id: "tx_01" },
    })

    // Example: Get all transactions for a specific category
    const categoryTransactions = await db.transactions.findMany({
      where: { categoryId: "cat_01" },
    })

    // Example: Count transactions by type
    const incomeCount = await db.transactions.count({
      where: { type: "income" },
    })

    const expenseCount = await db.transactions.count({
      where: { type: "expense" },
    })

    return NextResponse.json({
      categories,
      transaction,
      categoryTransactions,
      counts: {
        income: incomeCount,
        expense: expenseCount,
      },
    })
  } catch (error) {
    console.error("Error fetching data:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Example: Create a new category
    const newCategory = await db.categories.create({
      data: {
        name: "Travel",
        description: "Travel and transportation expenses",
        color: "#6366F1",
        icon: "Plane",
        budgetAllocation: 2500,
        organizationId: "org_01",
      },
    })

    return NextResponse.json({ category: newCategory })
  } catch (error) {
    console.error("Error creating data:", error)
    return NextResponse.json({ error: "Failed to create data" }, { status: 500 })
  }
}

