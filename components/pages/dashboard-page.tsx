"use client";

import {
  Calendar,
  CreditCard,
  Wallet,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import TransactionList from "@/components/transaction-list";
import BudgetTracking from "@/components/budget-tracking";
import ApprovalRequests from "@/components/approval-requests";
import { useEffect, useState } from "react";
import db from "@/lib/data";

interface FinancialSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  budgetUtilization: number;
  totalBudget: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    budgetUtilization: 0,
    totalBudget: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFinancialSummary() {
      try {
        // Get current date and first day of month for filtering
        const now = new Date();
        const firstDayOfMonth = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        ).toISOString();

        // Fetch all transactions
        const transactions = await db.transactions.findMany({
          where: { organizationId: "org_01" },
        });

        // Fetch categories to get budget allocation
        const categories = await db.categories.findMany({
          where: { organizationId: "org_01" },
        });

        // Calculate total budget
        const totalBudget = categories.reduce(
          (sum, cat) => sum + cat.budgetAllocation,
          0
        );

        // Calculate monthly income
        const monthlyIncome = transactions
          .filter(
            (tx) =>
              tx.type === "income" &&
              tx.status === "completed" &&
              tx.createdAt >= firstDayOfMonth
          )
          .reduce((sum, tx) => sum + tx.amount, 0);

        // Calculate monthly expenses
        const monthlyExpenses = transactions
          .filter(
            (tx) =>
              tx.type === "expense" &&
              tx.status === "completed" &&
              tx.createdAt >= firstDayOfMonth
          )
          .reduce((sum, tx) => sum + tx.amount, 0);

        // Calculate total balance (all time)
        const totalIncome = transactions
          .filter((tx) => tx.type === "income" && tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const totalExpenses = transactions
          .filter((tx) => tx.type === "expense" && tx.status === "completed")
          .reduce((sum, tx) => sum + tx.amount, 0);

        const totalBalance = totalIncome - totalExpenses;

        // Calculate budget utilization
        const budgetUtilization =
          totalBudget > 0
            ? Math.round((monthlyExpenses / totalBudget) * 100)
            : 0;

        setSummary({
          totalBalance,
          monthlyIncome,
          monthlyExpenses,
          budgetUtilization,
          totalBudget,
        });
      } catch (error) {
        console.error("Error loading financial summary:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadFinancialSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 flex items-center border border-gray-200 dark:border-[#1F1F23]">
          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mr-4">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Balance
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              $
              {summary.totalBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              +2.5% from last month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 flex items-center border border-gray-200 dark:border-[#1F1F23]">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mr-4">
            <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly Income
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              $
              {summary.monthlyIncome.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-green-600 dark:text-green-400">
              +15% from last month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 flex items-center border border-gray-200 dark:border-[#1F1F23]">
          <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 mr-4">
            <CreditCard className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Monthly Expenses
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              $
              {summary.monthlyExpenses.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-red-600 dark:text-red-400">
              +8% from last month
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-4 flex items-center border border-gray-200 dark:border-[#1F1F23]">
          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mr-4">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Budget Utilization
            </p>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {summary.budgetUtilization}%
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Budget: $
              {summary.totalBudget.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <Wallet className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
            Recent Transactions
          </h2>
          <div className="flex-1">
            <TransactionList />
          </div>
        </div>

        {/* Approval Requests */}
        <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col border border-gray-200 dark:border-[#1F1F23]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
            Pending Approvals
          </h2>
          <div className="flex-1">
            <ApprovalRequests />
          </div>
        </div>
      </div>

      {/* Budget Tracking */}
      <div className="bg-white dark:bg-[#0F0F12] rounded-xl p-6 flex flex-col items-start justify-start border border-gray-200 dark:border-[#1F1F23]">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-left flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-900 dark:text-zinc-50" />
          Budget Tracking
        </h2>
        <BudgetTracking />
      </div>
    </div>
  );
}
