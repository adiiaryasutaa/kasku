"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Printer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, subMonths, startOfMonth, eachMonthOfInterval } from "date-fns";
import Layout from "../layout";
import db from "@/lib/data";

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  incomeCount: number;
  expenseCount: number;
  largestIncome: number;
  largestExpense: number;
}

interface CategorySummary {
  id: string;
  name: string;
  income: number;
  expenses: number;
  net: number;
  color: string;
}

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("year");
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netIncome: 0,
    incomeCount: 0,
    expenseCount: 0,
    largestIncome: 0,
    largestExpense: 0,
  });
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [organizationId, setOrganizationId] = useState("org_01"); // Default organization

  useEffect(() => {
    async function loadReportData() {
      try {
        setIsLoading(true);

        // Calculate date range based on selected time range
        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
          case "month":
            startDate = startOfMonth(now);
            break;
          case "quarter":
            startDate = subMonths(now, 3);
            break;
          case "year":
            startDate = new Date(now.getFullYear(), 0, 1); // Start of year
            break;
          case "all":
          default:
            startDate = new Date(0); // All time
        }

        // Format date for query
        const startDateStr = startDate.toISOString();

        // Fetch transactions within date range
        const transactions = await db.transactions.findMany({
          where: {
            organizationId,
            createdAt: { gte: startDateStr },
          },
        });

        // Fetch categories for names and colors
        const categories = await db.categories.findMany({
          where: { organizationId },
        });

        // Create a lookup map for category names and colors
        const categoryMap = categories.reduce((map, cat) => {
          map[cat.id] = { name: cat.name, color: cat.color };
          return map;
        }, {} as Record<string, { name: string; color: string }>);

        // Calculate financial summary
        const incomeTransactions = transactions.filter(
          (tx) => tx.type === "income"
        );
        const expenseTransactions = transactions.filter(
          (tx) => tx.type === "expense"
        );

        const totalIncome = incomeTransactions.reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        const totalExpenses = expenseTransactions.reduce(
          (sum, tx) => sum + tx.amount,
          0
        );
        const netIncome = totalIncome - totalExpenses;

        const largestIncome =
          incomeTransactions.length > 0
            ? Math.max(...incomeTransactions.map((tx) => tx.amount))
            : 0;

        const largestExpense =
          expenseTransactions.length > 0
            ? Math.max(...expenseTransactions.map((tx) => tx.amount))
            : 0;

        setSummary({
          totalIncome,
          totalExpenses,
          netIncome,
          incomeCount: incomeTransactions.length,
          expenseCount: expenseTransactions.length,
          largestIncome,
          largestExpense,
        });

        // Calculate category summary
        const categoryData: Record<
          string,
          { income: number; expenses: number }
        > = {};

        // Initialize categories
        categories.forEach((cat) => {
          categoryData[cat.id] = { income: 0, expenses: 0 };
        });

        // Sum transactions by category
        transactions.forEach((tx) => {
          if (!categoryData[tx.categoryId]) {
            categoryData[tx.categoryId] = { income: 0, expenses: 0 };
          }

          if (tx.type === "income") {
            categoryData[tx.categoryId].income += tx.amount;
          } else {
            categoryData[tx.categoryId].expenses += tx.amount;
          }
        });

        // Format category summary
        const formattedCategorySummary = Object.entries(categoryData)
          .map(([catId, data]) => ({
            id: catId,
            name: categoryMap[catId]?.name || "Uncategorized",
            income: data.income,
            expenses: data.expenses,
            net: data.income - data.expenses,
            color: categoryMap[catId]?.color || "#CBD5E1",
          }))
          // Sort by net income descending
          .sort((a, b) => b.net - a.net);

        setCategorySummary(formattedCategorySummary);

        // Calculate monthly data
        // For monthly view, we'll show daily data instead
        const monthCount =
          timeRange === "month"
            ? 1
            : timeRange === "quarter"
            ? 3
            : timeRange === "year"
            ? 12
            : 12; // Default to 12 months for "all"

        const months = eachMonthOfInterval({
          start: subMonths(now, monthCount - 1),
          end: now,
        });

        // Initialize monthly data
        const formattedMonthlyData = months.map((month) => ({
          month: format(month, "MMM yyyy"),
          income: 0,
          expenses: 0,
          net: 0,
        }));

        // Sum transactions by month
        transactions.forEach((tx) => {
          const txDate = new Date(tx.createdAt);
          const monthIndex = months.findIndex(
            (month) =>
              month.getMonth() === txDate.getMonth() &&
              month.getFullYear() === txDate.getFullYear()
          );

          if (monthIndex !== -1) {
            if (tx.type === "income") {
              formattedMonthlyData[monthIndex].income += tx.amount;
            } else {
              formattedMonthlyData[monthIndex].expenses += tx.amount;
            }

            // Recalculate net
            formattedMonthlyData[monthIndex].net =
              formattedMonthlyData[monthIndex].income -
              formattedMonthlyData[monthIndex].expenses;
          }
        });

        setMonthlyData(formattedMonthlyData);
      } catch (error) {
        console.error("Error loading report data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadReportData();
  }, [timeRange, organizationId]);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Financial Reports
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Analyze your organization's financial performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[150px] h-9">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">Last 3 Months</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income-expense">Income & Expenses</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    $
                    {summary.totalIncome.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {summary.incomeCount} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    $
                    {summary.totalExpenses.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {summary.expenseCount} transactions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Net Income
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      summary.netIncome >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    $
                    {Math.abs(summary.netIncome).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                    {summary.netIncome >= 0 ? " profit" : " loss"}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
                    {summary.netIncome >= 0 ? (
                      <>
                        <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                        Income exceeds expenses
                      </>
                    ) : (
                      <>
                        <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                        Expenses exceed income
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Income/Expense Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {summary.totalExpenses > 0
                      ? (summary.totalIncome / summary.totalExpenses).toFixed(2)
                      : "∞"}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {summary.totalExpenses > 0
                      ? `$${(
                          summary.totalIncome / summary.totalExpenses
                        ).toFixed(2)} income per $1 expense`
                      : "No expenses recorded"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Trend</CardTitle>
                <CardDescription>Income and expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : monthlyData.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      No data available
                    </p>
                  </div>
                ) : (
                  <div className="h-[300px] w-full">
                    {/* Simplified bar chart visualization */}
                    <div className="flex h-[250px] items-end gap-2 pt-6">
                      {monthlyData.map((monthData, index) => {
                        const maxValue = Math.max(
                          ...monthlyData.map((m) =>
                            Math.max(m.income, m.expenses)
                          )
                        );

                        const incomeHeight =
                          maxValue > 0
                            ? (monthData.income / maxValue) * 100
                            : 0;
                        const expenseHeight =
                          maxValue > 0
                            ? (monthData.expenses / maxValue) * 100
                            : 0;

                        return (
                          <div
                            key={index}
                            className="flex flex-col items-center flex-1 relative"
                          >
                            {/* Income bar */}
                            <div
                              className="w-[45%] absolute bottom-0 left-0 ml-[5%] bg-green-500 dark:bg-green-600 rounded-t-sm"
                              style={{
                                height: `${Math.max(incomeHeight, 5)}%`,
                              }}
                            >
                              <div className="invisible h-0">
                                {monthData.income}
                              </div>
                            </div>

                            {/* Expense bar */}
                            <div
                              className="w-[45%] absolute bottom-0 right-0 mr-[5%] bg-red-500 dark:bg-red-600 rounded-t-sm"
                              style={{
                                height: `${Math.max(expenseHeight, 5)}%`,
                              }}
                            >
                              <div className="invisible h-0">
                                {monthData.expenses}
                              </div>
                            </div>

                            <div className="absolute bottom-[-24px] text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                              {monthData.month}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between mt-8">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-green-500 dark:bg-green-600 rounded-sm mr-1"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Income
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-red-500 dark:bg-red-600 rounded-sm mr-1"></div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Expenses
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {timeRange === "month"
                          ? "Daily data"
                          : timeRange === "quarter"
                          ? "Last 3 months"
                          : timeRange === "year"
                          ? "This year"
                          : "Last 12 months"}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories</CardTitle>
                <CardDescription>
                  Categories with highest net income/expense
                </CardDescription>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Top Income Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Top Income Categories
                      </h3>
                      <div className="space-y-3">
                        {categorySummary
                          .filter((cat) => cat.income > 0)
                          .sort((a, b) => b.income - a.income)
                          .slice(0, 3)
                          .map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {category.name}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-green-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (category.income /
                                          summary.totalIncome) *
                                          100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                $
                                {category.income.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Top Expense Categories */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                        Top Expense Categories
                      </h3>
                      <div className="space-y-3">
                        {categorySummary
                          .filter((cat) => cat.expenses > 0)
                          .sort((a, b) => b.expenses - a.expenses)
                          .slice(0, 3)
                          .map((category) => (
                            <div
                              key={category.id}
                              className="flex items-center gap-2"
                            >
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {category.name}
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-red-500 h-1.5 rounded-full"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        (category.expenses /
                                          summary.totalExpenses) *
                                          100
                                      )}%`,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                $
                                {category.expenses.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  View Detailed Breakdown
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Income & Expenses Tab */}
        <TabsContent value="income-expense" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Income Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Income Analysis</CardTitle>
                  <CardDescription>
                    Total: $
                    {summary.totalIncome.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    </div>
                  ) : summary.incomeCount === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        No income data available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Largest Income
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            $
                            {summary.largestIncome.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Average Income
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            $
                            {(
                              summary.totalIncome / summary.incomeCount
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Income by Category
                        </h4>
                        <div className="space-y-3">
                          {categorySummary
                            .filter((cat) => cat.income > 0)
                            .sort((a, b) => b.income - a.income)
                            .slice(0, 5)
                            .map((category) => (
                              <div
                                key={category.id}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {category.name}
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-green-500 h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (category.income /
                                            summary.totalIncome) *
                                            100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  $
                                  {category.income.toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Income
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              {/* Expense Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Analysis</CardTitle>
                  <CardDescription>
                    Total: $
                    {summary.totalExpenses.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center p-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                    </div>
                  ) : summary.expenseCount === 0 ? (
                    <div className="text-center p-4">
                      <p className="text-gray-500 dark:text-gray-400">
                        No expense data available
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Largest Expense
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            $
                            {summary.largestExpense.toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Average Expense
                          </div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            $
                            {(
                              summary.totalExpenses / summary.expenseCount
                            ).toLocaleString(undefined, {
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                          Expenses by Category
                        </h4>
                        <div className="space-y-3">
                          {categorySummary
                            .filter((cat) => cat.expenses > 0)
                            .sort((a, b) => b.expenses - a.expenses)
                            .slice(0, 5)
                            .map((category) => (
                              <div
                                key={category.id}
                                className="flex items-center gap-2"
                              >
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {category.name}
                                  </div>
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                    <div
                                      className="bg-red-500 h-1.5 rounded-full"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          (category.expenses /
                                            summary.totalExpenses) *
                                            100
                                        )}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  $
                                  {category.expenses.toLocaleString(undefined, {
                                    maximumFractionDigits: 0,
                                  })}
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="ml-auto">
                    View All Expenses
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Monthly Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Income vs. Expenses over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : monthlyData.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      No data available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-[300px] w-full">
                      {/* Simplified line chart visualization */}
                      <div className="flex h-[250px] items-end gap-2 pt-6 relative">
                        {/* Background grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between border-t border-gray-200 dark:border-gray-800">
                          <div className="border-b border-gray-200 dark:border-gray-800 h-1/4"></div>
                          <div className="border-b border-gray-200 dark:border-gray-800 h-1/4"></div>
                          <div className="border-b border-gray-200 dark:border-gray-800 h-1/4"></div>
                          <div className="border-b border-gray-200 dark:border-gray-800 h-1/4"></div>
                        </div>

                        {monthlyData.map((monthData, index) => {
                          const maxValue = Math.max(
                            ...monthlyData.map((m) =>
                              Math.max(m.income, m.expenses)
                            )
                          );

                          const incomeHeight =
                            maxValue > 0
                              ? (monthData.income / maxValue) * 100
                              : 0;
                          const expenseHeight =
                            maxValue > 0
                              ? (monthData.expenses / maxValue) * 100
                              : 0;
                          const netHeight =
                            maxValue > 0
                              ? (Math.abs(monthData.net) / maxValue) * 100
                              : 0;

                          return (
                            <div
                              key={index}
                              className="flex flex-col items-center flex-1 relative"
                            >
                              {/* Net bar (positive or negative) */}
                              <div
                                className={`w-[30%] absolute bottom-[50%] mx-auto ${
                                  monthData.net >= 0
                                    ? "bg-green-300 dark:bg-green-800"
                                    : "bg-red-300 dark:bg-red-800"
                                } rounded-sm`}
                                style={{
                                  height: `${Math.max(netHeight, 2)}%`,
                                  bottom:
                                    monthData.net >= 0
                                      ? "50%"
                                      : `calc(50% - ${Math.max(
                                          netHeight,
                                          2
                                        )}%)`,
                                }}
                              />

                              <div className="absolute bottom-[-24px] text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                                {monthData.month}
                              </div>
                            </div>
                          );
                        })}

                        {/* Zero line */}
                        <div className="absolute left-0 right-0 top-[50%] border-t-2 border-gray-400 dark:border-gray-600"></div>
                      </div>

                      <div className="flex justify-between mt-8">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-300 dark:bg-green-800 rounded-sm mr-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Profit
                            </span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-300 dark:bg-red-800 rounded-sm mr-1"></div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Loss
                            </span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Net income/loss by month
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Profitable Months
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {monthlyData.filter((m) => m.net > 0).length}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Loss Months
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {monthlyData.filter((m) => m.net < 0).length}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Break-even Months
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {monthlyData.filter((m) => m.net === 0).length}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
                <CardDescription>
                  Financial performance by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : categorySummary.length === 0 ? (
                  <div className="text-center p-4">
                    <p className="text-gray-500 dark:text-gray-400">
                      No category data available
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Category performance table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                              Category
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                              Income
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                              Expenses
                            </th>
                            <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                              Net
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {categorySummary.map((category) => (
                            <tr
                              key={category.id}
                              className="border-b border-gray-100 dark:border-gray-800"
                            >
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {category.name}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-2 text-right text-sm text-green-600 dark:text-green-400">
                                $
                                {category.income.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </td>
                              <td className="py-3 px-2 text-right text-sm text-red-600 dark:text-red-400">
                                $
                                {category.expenses.toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })}
                              </td>
                              <td
                                className={`py-3 px-2 text-right text-sm font-medium ${
                                  category.net >= 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                $
                                {Math.abs(category.net).toLocaleString(
                                  undefined,
                                  { maximumFractionDigits: 0 }
                                )}
                                {category.net >= 0 ? " profit" : " loss"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-gray-200 dark:border-gray-700">
                            <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-white">
                              Total
                            </td>
                            <td className="py-3 px-2 text-right text-sm font-medium text-green-600 dark:text-green-400">
                              $
                              {summary.totalIncome.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td className="py-3 px-2 text-right text-sm font-medium text-red-600 dark:text-red-400">
                              $
                              {summary.totalExpenses.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </td>
                            <td
                              className={`py-3 px-2 text-right text-sm font-medium ${
                                summary.netIncome >= 0
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }`}
                            >
                              $
                              {Math.abs(summary.netIncome).toLocaleString(
                                undefined,
                                { maximumFractionDigits: 0 }
                              )}
                              {summary.netIncome >= 0 ? " profit" : " loss"}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    {/* Category visualization */}
                    <div className="pt-4">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                        Net Income/Loss by Category
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Profitable Categories */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                            Profitable Categories
                          </h5>
                          <div className="space-y-3">
                            {categorySummary
                              .filter((cat) => cat.net > 0)
                              .sort((a, b) => b.net - a.net)
                              .slice(0, 3)
                              .map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {category.name}
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                      <div
                                        className="bg-green-500 h-1.5 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            (category.net /
                                              Math.max(
                                                ...categorySummary
                                                  .filter((c) => c.net > 0)
                                                  .map((c) => c.net)
                                              )) *
                                              100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                    +$
                                    {category.net.toLocaleString(undefined, {
                                      maximumFractionDigits: 0,
                                    })}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>

                        {/* Loss Categories */}
                        <div>
                          <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
                            Loss Categories
                          </h5>
                          <div className="space-y-3">
                            {categorySummary
                              .filter((cat) => cat.net < 0)
                              .sort((a, b) => a.net - b.net)
                              .slice(0, 3)
                              .map((category) => (
                                <div
                                  key={category.id}
                                  className="flex items-center gap-2"
                                >
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: category.color }}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                      {category.name}
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                      <div
                                        className="bg-red-500 h-1.5 rounded-full"
                                        style={{
                                          width: `${Math.min(
                                            100,
                                            (Math.abs(category.net) /
                                              Math.max(
                                                ...categorySummary
                                                  .filter((c) => c.net < 0)
                                                  .map((c) => Math.abs(c.net))
                                              )) *
                                              100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div className="text-sm font-medium text-red-600 dark:text-red-400">
                                    -$
                                    {Math.abs(category.net).toLocaleString(
                                      undefined,
                                      { maximumFractionDigits: 0 }
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="ml-auto">
                  Download Category Report
                  <Download className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
