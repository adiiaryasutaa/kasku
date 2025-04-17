"use client";

import { useState, useEffect } from "react";
import {
  Wallet,
  Download,
  Plus,
  Search,
  FileText,
  PieChart,
  ArrowDownLeft,
  TrendingUp,
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
import {
  format,
  subDays,
  startOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";
import AppLayout from "../layouts/app-layout";
import db from "@/lib/data";

interface Income {
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

interface MonthlyIncome {
  month: string;
  amount: number;
}

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filteredIncomes, setFilteredIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlyIncomes, setMonthlyIncomes] = useState<MonthlyIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateRange, setDateRange] = useState("month");
  const [totalIncome, setTotalIncome] = useState(0);
  const [averageIncome, setAverageIncome] = useState(0);
  const [largestIncome, setLargestIncome] = useState(0);

  useEffect(() => {
    async function loadIncomes() {
      try {
        setIsLoading(true);

        // Fetch all incomes (transactions with type 'income')
        const incomesData = await db.transactions.findMany({
          where: { type: "income" },
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

        // Enhance incomes with category and creator names
        const enhancedIncomes = incomesData.map((inc) => ({
          ...inc,
          categoryName: categoryMap[inc.categoryId]?.name || "Uncategorized",
          creatorName: userMap[inc.createdBy] || "Unknown User",
        }));

        setIncomes(enhancedIncomes);
        setFilteredIncomes(enhancedIncomes);

        // Calculate summary statistics
        if (enhancedIncomes.length > 0) {
          const total = enhancedIncomes.reduce(
            (sum, inc) => sum + inc.amount,
            0
          );
          const average = total / enhancedIncomes.length;
          const largest = Math.max(...enhancedIncomes.map((inc) => inc.amount));

          setTotalIncome(total);
          setAverageIncome(average);
          setLargestIncome(largest);

          // Calculate category summary
          const categoryTotals: Record<string, number> = {};

          enhancedIncomes.forEach((inc) => {
            if (!categoryTotals[inc.categoryId]) {
              categoryTotals[inc.categoryId] = 0;
            }
            categoryTotals[inc.categoryId] += inc.amount;
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

          // Calculate monthly income for the last 6 months
          const now = new Date();
          const sixMonthsAgo = subMonths(now, 5); // 6 months including current

          // Get all months in the interval
          const months = eachMonthOfInterval({
            start: sixMonthsAgo,
            end: now,
          });

          // Initialize monthly data
          const monthlyData = months.map((month) => ({
            month: format(month, "MMM yyyy"),
            amount: 0,
          }));

          // Sum income by month
          enhancedIncomes.forEach((inc) => {
            const incomeDate = new Date(inc.createdAt);
            if (incomeDate >= sixMonthsAgo) {
              const monthIndex = months.findIndex(
                (month) =>
                  month.getMonth() === incomeDate.getMonth() &&
                  month.getFullYear() === incomeDate.getFullYear()
              );

              if (monthIndex !== -1) {
                monthlyData[monthIndex].amount += inc.amount;
              }
            }
          });

          setMonthlyIncomes(monthlyData);
        }
      } catch (error) {
        console.error("Error loading incomes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadIncomes();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...incomes];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (inc) =>
          inc.title.toLowerCase().includes(query) ||
          inc.description?.toLowerCase().includes(query) ||
          inc.categoryName?.toLowerCase().includes(query) ||
          inc.creatorName?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter) {
      result = result.filter((inc) => inc.categoryId === categoryFilter);
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
      result = result.filter((inc) => new Date(inc.createdAt) >= startDate);
    }

    setFilteredIncomes(result);

    // Recalculate summary statistics based on filtered data
    if (result.length > 0) {
      const total = result.reduce((sum, inc) => sum + inc.amount, 0);
      const average = total / result.length;
      const largest = Math.max(...result.map((inc) => inc.amount));

      setTotalIncome(total);
      setAverageIncome(average);
      setLargestIncome(largest);

      // Recalculate category summary
      const categoryTotals: Record<string, number> = {};

      result.forEach((inc) => {
        if (!categoryTotals[inc.categoryId]) {
          categoryTotals[inc.categoryId] = 0;
        }
        categoryTotals[inc.categoryId] += inc.amount;
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
  }, [incomes, searchQuery, categoryFilter, dateRange, categories]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Income
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Track and analyze your organization's income
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              New Income
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {totalIncome.toLocaleString(undefined, {
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
                  Average Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {averageIncome.toLocaleString(undefined, {
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
                  Largest Income
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  $
                  {largestIncome.toLocaleString(undefined, {
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
            {/* Monthly Income Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Income</CardTitle>
                <CardDescription>
                  Income trend over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : monthlyIncomes.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      No data available
                    </p>
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    {/* Simplified bar chart visualization */}
                    <div className="flex h-[250px] items-end gap-2 pt-6">
                      {monthlyIncomes.map((monthData, index) => {
                        const maxAmount = Math.max(
                          ...monthlyIncomes.map((m) => m.amount)
                        );
                        const height =
                          maxAmount > 0
                            ? (monthData.amount / maxAmount) * 100
                            : 0;

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center flex-1"
                          >
                            <div
                              className="w-full bg-green-500 dark:bg-green-600 rounded-t-sm"
                              style={{ height: `${Math.max(height, 5)}%` }}
                            >
                              <div className="invisible h-0">
                                {monthData.amount}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 truncate w-full text-center">
                              {monthData.month}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between mt-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="inline h-3 w-3 mr-1" />
                        {(() => {
                          // Calculate trend
                          if (monthlyIncomes.length < 2) return "No trend data";

                          const lastMonth =
                            monthlyIncomes[monthlyIncomes.length - 1].amount;
                          const previousMonth =
                            monthlyIncomes[monthlyIncomes.length - 2].amount;

                          if (previousMonth === 0) return "New income stream";

                          const percentChange =
                            ((lastMonth - previousMonth) / previousMonth) * 100;

                          return percentChange >= 0
                            ? `Up ${percentChange.toFixed(1)}% from last month`
                            : `Down ${Math.abs(percentChange).toFixed(
                                1
                              )}% from last month`;
                        })()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total: $
                        {monthlyIncomes
                          .reduce((sum, m) => sum + m.amount, 0)
                          .toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Income Sources */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Income Sources</CardTitle>
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
                              {totalIncome.toLocaleString(undefined, {
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
          </div>

          {/* Recent Income Transactions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Income</CardTitle>
                <CardDescription>
                  Your latest income transactions
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search income..."
                    className="pl-9 h-9 w-[200px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-[150px] h-9">
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
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                </div>
              ) : filteredIncomes.length === 0 ? (
                <div className="text-center p-8">
                  <Wallet className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No income found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {searchQuery || categoryFilter
                      ? "Try adjusting your filters to see more results"
                      : "Get started by recording your first income"}
                  </p>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Income
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Income Source</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIncomes.slice(0, 5).map((income) => (
                        <TableRow key={income.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <ArrowDownLeft className="h-4 w-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {income.title}
                                </div>
                                {income.description && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {income.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{income.categoryName}</TableCell>
                          <TableCell className="font-medium text-green-600 dark:text-green-400">
                            +${income.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {format(new Date(income.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            {income.status === "completed" ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              >
                                Completed
                              </Badge>
                            ) : income.status === "pending" ? (
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
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {income.attachmentUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span className="sr-only">View Receipt</span>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <Wallet className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {filteredIncomes.length > 5 && (
                    <div className="text-center mt-4">
                      <Button variant="outline" size="sm">
                        View All Income
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
