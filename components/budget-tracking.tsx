"use client"

import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import db from "@/lib/data"

interface BudgetCategory {
  id: string
  name: string
  allocated: number
  spent: number
  remaining: number
  color: string
}

interface BudgetTrackingProps {
  categories?: BudgetCategory[]
  className?: string
}

export default function BudgetTracking({ className }: BudgetTrackingProps) {
  const [categories, setCategories] = useState<BudgetCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadBudgetData() {
      try {
        // Fetch categories from our data provider
        const categoryData = await db.categories.findMany({
          where: { organizationId: "org_01" },
        })

        // Fetch transactions to calculate spent amounts
        const transactions = await db.transactions.findMany({
          where: {
            organizationId: "org_01",
            type: "expense",
            status: "completed",
          },
        })

        // Calculate spent amount per category
        const spentByCategory: Record<string, number> = {}

        transactions.forEach((tx) => {
          if (!spentByCategory[tx.categoryId]) {
            spentByCategory[tx.categoryId] = 0
          }
          spentByCategory[tx.categoryId] += tx.amount
        })

        // Transform data for the component
        const budgetCategories = categoryData.map((cat) => {
          const spent = spentByCategory[cat.id] || 0
          return {
            id: cat.id,
            name: cat.name,
            allocated: cat.budgetAllocation,
            spent: spent,
            remaining: cat.budgetAllocation - spent,
            color: cat.color,
          }
        })

        setCategories(budgetCategories)
      } catch (error) {
        console.error("Error loading budget data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadBudgetData()
  }, [])

  if (isLoading) {
    return <div className="p-4 text-center">Loading budget data...</div>
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Budget Categories */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Budget Categories</h3>
            <Button variant="ghost" size="sm" className="text-xs">
              Manage Budgets
            </Button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => {
              const percentSpent = Math.round((category.spent / category.allocated) * 100)
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{category.name}</span>
                    <span className="text-xs text-zinc-600 dark:text-zinc-400">
                      ${category.spent.toLocaleString()} / ${category.allocated.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full")}
                      style={{ width: `${percentSpent}%`, backgroundColor: category.color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-600 dark:text-zinc-400">{percentSpent}% spent</span>
                    <span
                      className={cn(
                        category.remaining < category.allocated * 0.1
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400",
                      )}
                    >
                      ${category.remaining.toLocaleString()} remaining
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Budget Summary Chart */}
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Budget Overview</h3>
          </div>

          <div className="aspect-square flex items-center justify-center p-4">
            <div className="relative w-full h-full max-w-[200px] max-h-[200px] mx-auto">
              {/* Simplified donut chart representation */}
              {categories.map((category, index) => {
                const rotation = index * (360 / categories.length)
                return (
                  <div
                    key={category.id}
                    className="absolute inset-0 rounded-full border-8"
                    style={{
                      borderColor: category.color,
                      transform: `rotate(${rotation}deg)`,
                      clipPath: "polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)",
                    }}
                  />
                )
              })}

              {/* Center circle with total */}
              <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full bg-white dark:bg-[#0F0F12] flex flex-col items-center justify-center">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">Total Budget</span>
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  ${categories.reduce((sum, cat) => sum + cat.allocated, 0).toLocaleString()}
                </span>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">
                  {Math.round(
                    (categories.reduce((sum, cat) => sum + cat.spent, 0) /
                      categories.reduce((sum, cat) => sum + cat.allocated, 0)) *
                      100,
                  )}
                  % utilized
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{category.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button variant="outline" size="sm" className="text-xs">
          View Detailed Budget Report
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}

