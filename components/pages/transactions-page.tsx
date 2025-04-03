"use client"

import { useState, useEffect } from "react"
import {
  Wallet,
  Filter,
  Download,
  Plus,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import Layout from "../layout"
import db from "@/lib/data"

interface Transaction {
  id: string
  title: string
  amount: number
  type: "income" | "expense"
  categoryId: string
  categoryName?: string
  createdBy: string
  creatorName?: string
  status: string
  createdAt: string
  description?: string
  attachmentUrl?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortField, setSortField] = useState("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    async function loadTransactions() {
      try {
        setIsLoading(true)

        // Fetch transactions
        const transactionsData = await db.transactions.findMany({
          orderBy: { createdAt: "desc" },
        })

        // Fetch categories for names
        const categoriesData = await db.categories.findMany()
        setCategories(categoriesData)

        // Create a lookup map for category names
        const categoryMap = categoriesData.reduce(
          (map, cat) => {
            map[cat.id] = cat.name
            return map
          },
          {} as Record<string, string>,
        )

        // Fetch users for creator names
        const users = await db.users.findMany()
        const userMap = users.reduce(
          (map, user) => {
            map[user.id] = user.name
            return map
          },
          {} as Record<string, string>,
        )

        // Enhance transactions with category and creator names
        const enhancedTransactions = transactionsData.map((tx) => ({
          ...tx,
          categoryName: categoryMap[tx.categoryId] || "Uncategorized",
          creatorName: userMap[tx.createdBy] || "Unknown User",
        }))

        setTransactions(enhancedTransactions)
        setFilteredTransactions(enhancedTransactions)
      } catch (error) {
        console.error("Error loading transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTransactions()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...transactions]

    // Filter by type (tab)
    if (activeTab !== "all") {
      result = result.filter((tx) => tx.type === activeTab)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (tx) =>
          tx.title.toLowerCase().includes(query) ||
          tx.description?.toLowerCase().includes(query) ||
          tx.categoryName?.toLowerCase().includes(query) ||
          tx.creatorName?.toLowerCase().includes(query),
      )
    }

    // Filter by category
    if (categoryFilter) {
      result = result.filter((tx) => tx.categoryId === categoryFilter)
    }

    // Filter by status
    if (statusFilter) {
      result = result.filter((tx) => tx.status === statusFilter)
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField as keyof Transaction]
      const bValue = b[sortField as keyof Transaction]

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      // Handle number comparison
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      // Default comparison
      return sortDirection === "asc" ? 1 : -1
    })

    setFilteredTransactions(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [transactions, activeTab, searchQuery, categoryFilter, statusFilter, sortField, sortDirection])

  // Calculate pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New field, default to descending
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4" />
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
          >
            Completed
          </Badge>
        )
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
          >
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
          >
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage all financial transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl border border-gray-200 dark:border-[#1F1F23] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-[#1F1F23]">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all">All Transactions</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expenses</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      className="pl-9 h-9 md:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <div className="p-2">
                        <p className="text-sm font-medium mb-2">Category</p>
                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Categories" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium mb-2">Status</p>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Tabs>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center p-8">
              <Wallet className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No transactions found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || categoryFilter || statusFilter
                  ? "Try adjusting your filters to see more results"
                  : "Get started by creating your first transaction"}
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">
                        <button className="flex items-center font-medium" onClick={() => handleSort("title")}>
                          Transaction {getSortIcon("title")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center font-medium" onClick={() => handleSort("categoryName")}>
                          Category {getSortIcon("categoryName")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center font-medium" onClick={() => handleSort("amount")}>
                          Amount {getSortIcon("amount")}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center font-medium" onClick={() => handleSort("createdAt")}>
                          Date {getSortIcon("createdAt")}
                        </button>
                      </TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                transaction.type === "income"
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-red-100 dark:bg-red-900/30"
                              }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{transaction.title}</div>
                              {transaction.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                  {transaction.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.categoryName}</TableCell>
                        <TableCell
                          className={`font-medium ${
                            transaction.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>{format(new Date(transaction.createdAt), "MMM d, yyyy")}</TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {transaction.attachmentUrl && (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Receipt</span>
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <CreditCard className="h-4 w-4" />
                              <span className="sr-only">View Details</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-[#1F1F23]">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage > 1) setCurrentPage(currentPage - 1)
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first page, last page, current page, and pages around current
                        let pageNum: number | null = null

                        if (i === 0) pageNum = 1
                        else if (i === 4) pageNum = totalPages
                        else if (totalPages <= 5) pageNum = i + 1
                        else {
                          // Complex pagination logic for many pages
                          if (currentPage <= 3) pageNum = i + 1
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                          else pageNum = currentPage - 1 + i
                        }

                        // Show ellipsis instead of page number in certain cases
                        if (totalPages > 5) {
                          if (i === 1 && currentPage > 3)
                            return (
                              <PaginationItem key="ellipsis-1">
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                          if (i === 3 && currentPage < totalPages - 2)
                            return (
                              <PaginationItem key="ellipsis-2">
                                <PaginationEllipsis />
                              </PaginationItem>
                            )
                        }

                        if (pageNum !== null) {
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(pageNum as number)
                                }}
                                isActive={currentPage === pageNum}
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }

                        return null
                      })}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}

