"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Download,
  Plus,
  Search,
  PieChart,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format, subDays, startOfMonth } from "date-fns";
import Layout from "../layout";
import db from "@/lib/data";

interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  categoryName?: string;
  createdBy: string;
  creatorName?: string;
  status: string;
  createdAt: string;
  description?: string;
  attachmentUrl?: string;
}

interface CategorySummary {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [averageExpense, setAverageExpense] = useState(0);
  const [largestExpense, setLargestExpense] = useState(0);

  useEffect(() => {
    async function loadExpenses() {
      try {
        setIsLoading(true);

        // Fetch all expenses (transactions with type 'expense')
        const expensesData = await db.transactions.findMany({
          where: { type: "expense" },
          orderBy: { createdAt: "desc" },
        });

        // Fetch categories for names and colors
        const categoriesData = await db.categories.findMany();
        setCategories(categoriesData);

        // Create a lookup map for category names and colors
        const categoryMap = categoriesData.reduce((map, cat) => {
          map[cat.id] = { name: cat.name, color: cat.color };
          return map;
        }, {} as Record<string, { name: string; color: string }>);

        // Fetch users for creator names
        const users = await db.users.findMany();
        const userMap = users.reduce((map, user) => {
          map[user.id] = user.name;
          return map;
        }, {} as Record<string, string>);

        // Enhance expenses with category and creator names
        const enhancedExpenses = expensesData.map((exp) => ({
          ...exp,
          categoryName: categoryMap[exp.categoryId]?.name || "Uncategorized",
          creatorName: userMap[exp.createdBy] || "Unknown User",
        }));

        setExpenses(enhancedExpenses);
        setFilteredExpenses(enhancedExpenses);

        // Calculate summary statistics
        if (enhancedExpenses.length > 0) {
          const total = enhancedExpenses.reduce(
            (sum, exp) => sum + exp.amount,
            0
          );
          const average = total / enhancedExpenses.length;
          const largest = Math.max(
            ...enhancedExpenses.map((exp) => exp.amount)
          );

          setTotalExpenses(total);
          setAverageExpense(average);
          setLargestExpense(largest);

          // Calculate category summary
          const categoryTotals: Record<string, number> = {};

          enhancedExpenses.forEach((exp) => {
            if (!categoryTotals[exp.categoryId]) {
              categoryTotals[exp.categoryId] = 0;
            }
            categoryTotals[exp.categoryId] += exp.amount;
          });

          const summary = Object.entries(categoryTotals).map(
            ([catId, amount]) => ({
              id: catId,
              name: categoryMap[catId]?.name || "Uncategorized",
              amount,
              percentage: (amount / total) * 100,
              color: categoryMap[catId]?.color || "#CBD5E1", // Default color
            })
          );

          // Sort by amount descending
          summary.sort((a, b) => b.amount - a.amount);

          setCategorySummary(summary);
        }
      } catch (error) {
        console.error("Error loading expenses:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadExpenses();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...expenses];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (exp) =>
          exp.title.toLowerCase().includes(query) ||
          exp.description?.toLowerCase().includes(query) ||
          exp.categoryName?.toLowerCase().includes(query) ||
          exp.creatorName?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter) {
      result = result.filter((exp) => exp.categoryId === categoryFilter);
    }

    // Filter by date range
    const now = new Date();
    let startDate: Date;

    switch (dateRange) {
      case "week":
        startDate = subDays(now, 7);
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "quarter":
        startDate = subDays(now, 90);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1); // Start of year
        break;
      default:
        startDate = new Date(0); // All time
    }

    if (dateRange !== "all") {
      result = result.filter((exp) => new Date(exp.createdAt) >= startDate);
    }

    setFilteredExpenses(result);

    // Recalculate summary statistics based on filtered data
    if (result.length > 0) {
      const total = result.reduce((sum, exp) => sum + exp.amount, 0);
      const average = total / result.length;
      const largest = Math.max(...result.map((exp) => exp.amount));

      setTotalExpenses(total);
      setAverageExpense(average);
      setLargestExpense(largest);

      // Recalculate category summary
      const categoryTotals: Record<string, number> = {};

      result.forEach((exp) => {
        if (!categoryTotals[exp.categoryId]) {
          categoryTotals[exp.categoryId] = 0;
        }
        categoryTotals[exp.categoryId] += exp.amount;
      });

      const summary = Object.entries(categoryTotals).map(([catId, amount]) => {
        const category = categories.find((c) => c.id === catId);
        return {
          id: catId,
          name: category?.name || "Uncategorized",
          amount,
          percentage: (amount / total) * 100,
          color: category?.color || "#CBD5E1", // Default color
        };
      });

      // Sort by amount descending
      summary.sort((a, b) => b.amount - a.amount);

      setCategorySummary(summary);
    }
  }, [expenses, searchQuery, categoryFilter, dateRange, categories]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Expenses
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and analyze your organization's expenses
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Expense
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Expenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {totalExpenses.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {dateRange === "all"
                    ? "All time"
                    : dateRange === "week"
                    ? "Last 7 days"
                    : dateRange === "month"
                    ? "This month"
                    : dateRange === "quarter"
                    ? "Last 90 days"
                    : "This year"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {averageExpense.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Largest Expense
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {largestExpense.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Single transaction
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Category Breakdown */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Expense Categories</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : categorySummary.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      No data available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Simplified pie chart visualization */}
                    <div className="relative aspect-square flex items-center justify-center">
                      <PieChart className="absolute h-8 w-8 text-gray-400" />
                      <div className="w-full h-full">
                        {categorySummary.map((category, index) => {
                          // Create a simple pie chart segment
                          const rotation =
                            index * (360 / categorySummary.length);
                          const nextRotation =
                            (index + 1) * (360 / categorySummary.length);
                          const percentage = category.percentage;

                          return (
                            <div
                              key={category.id}
                              className="absolute inset-0 rounded-full"
                              style={{
                                background: `conic-gradient(${
                                  category.color
                                } ${rotation}deg, ${category.color} ${
                                  rotation + percentage * 3.6
                                }deg, transparent ${
                                  rotation + percentage * 3.6
                                }deg)`,
                                clipPath: "circle(50%)",
                              }}
                            />
                          );
                        })}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white dark:bg-[#0F0F12] rounded-full w-3/5 h-3/5 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Total
                            </span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              $
                              {totalExpenses.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Category list */}
                    <div className="space-y-2">
                      {categorySummary.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {category.name}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              $
                              {category.amount.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {category.percentage.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Expenses */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>
                    Your latest expense transactions
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search expenses..."
                      className="pl-9 h-9 w-[200px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="w-[130px] h-9">
                      <SelectValue placeholder="Time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last 7 days</SelectItem>
                      <SelectItem value="month">This month</SelectItem>
                      <SelectItem value="quarter">Last 90 days</SelectItem>
                      <SelectItem value="year">This year</SelectItem>
                      <SelectItem value="all">All time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : filteredExpenses.length === 0 ? (
                  <div className="text-center p-8">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                      No expenses found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchQuery || categoryFilter
                        ? "Try adjusting your filters to see more results"
                        : "Get started by creating your first expense"}
                    </p>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      New Expense
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Expense</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.slice(0, 5).map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                                  <ArrowUpRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {expense.title}
                                  </div>
                                  {expense.description && (
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                      {expense.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{expense.categoryName}</TableCell>
                            <TableCell className="font-medium text-red-600 dark:text-red-400">
                              -${expense.amount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(expense.createdAt),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              {expense.status === "completed" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                >
                                  Completed
                                </Badge>
                              ) : expense.status === "pending" ? (
                                <Badge
                                  variant="outline"
                                  className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                >
                                  Pending
                                </Badge>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                >
                                  Rejected
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {filteredExpenses.length > 5 && (
                      <div className="text-center mt-4">
                        <Button variant="outline" size="sm">
                          View All Expenses
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
