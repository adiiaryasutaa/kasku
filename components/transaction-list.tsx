"use client"

import { cn } from "@/lib/utils"
import {
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  ShoppingCart,
  CreditCard,
  type LucideIcon,
  ArrowRight,
  Ticket,
  FileText,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import db from "@/lib/data"

interface Transaction {
  id: string
  title: string
  amount: string
  type: "income" | "expense"
  category: string
  icon: LucideIcon
  timestamp: string
  status: "completed" | "pending" | "failed"
  description?: string
  attachment?: boolean
}

interface TransactionListProps {
  className?: string
}

const categoryIcons: Record<string, LucideIcon> = {
  cat_01: Ticket, // Events & Activities
  cat_02: ShoppingCart, // Administrative
  cat_03: FileText, // Marketing
  cat_04: CreditCard, // Equipment
  cat_05: Wallet, // Miscellaneous
}

export default function TransactionList({ className }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadTransactions() {
      try {
        // Fetch transactions from our data provider
        const data = await db.transactions.findMany({
          where: { organizationId: "org_01" },
          orderBy: { createdAt: "desc" },
        })

        // Fetch categories to get names
        const categories = await db.categories.findMany({
          where: { organizationId: "org_01" },
        })

        // Create a lookup map for category names
        const categoryMap = categories.reduce(
          (map, cat) => {
            map[cat.id] = cat.name
            return map
          },
          {} as Record<string, string>,
        )

        // Transform data for the component
        const formattedTransactions = data.map((tx) => ({
          id: tx.id,
          title: tx.title,
          amount: `$${tx.amount.toFixed(2)}`,
          type: tx.type as "income" | "expense",
          category: categoryMap[tx.categoryId] || "Uncategorized",
          categoryId: tx.categoryId,
          icon: categoryIcons[tx.categoryId] || Wallet,
          timestamp: new Date(tx.createdAt).toLocaleString(),
          status: tx.status as "completed" | "pending" | "failed",
          description: tx.description,
          attachment: !!tx.attachmentUrl,
        }))

        setTransactions(formattedTransactions)
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  if (isLoading) {
    return <div className="p-4 text-center">Loading transactions...</div>
  }

  return (
    <div className={cn("w-full", "bg-white dark:bg-zinc-900/70", "rounded-lg", className)}>
      <div className="space-y-1">
        {transactions.map((transaction) => {
          const Icon = transaction.icon
          return (
            <div
              key={transaction.id}
              className={cn(
                "group flex items-center gap-3",
                "p-3 rounded-lg",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                "transition-all duration-200",
              )}
            >
              <div
                className={cn(
                  "p-2 rounded-lg",
                  transaction.type === "income"
                    ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 flex items-center justify-between min-w-0">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{transaction.title}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{transaction.timestamp}</p>
                    {transaction.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-500 italic">{transaction.description}</p>
                    )}
                    {transaction.attachment && (
                      <button className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-3">
                  <span
                    className={cn(
                      "text-sm font-medium",
                      transaction.type === "income"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400",
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {transaction.amount}
                  </span>
                  {transaction.type === "income" ? (
                    <ArrowDownLeft className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Button variant="outline" size="sm" className="text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
        <Button variant="default" size="sm" className="text-xs">
          View All
          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </div>
    </div>
  )
}

