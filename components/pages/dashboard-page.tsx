"use client";

import { useEffect, useState } from "react";
import db from "@/lib/data";
import AppLayout from "@/components/layouts/app-layout";
import {
  ApprovalRequestWidget,
  BudgetTrackingWidget,
  BudgetUtilizationWidget,
  MonthlyExpenseWidget,
  MonthlyIncomeWidget,
  RecentTransactionWidget,
  TotalBalanceWidget,
} from "@/components/organisms/dashboard";

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
    <AppLayout>
      <div className="space-y-4">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <TotalBalanceWidget totalBalance={summary.totalBalance} />

          <MonthlyIncomeWidget monthlyIncome={summary.monthlyIncome} />

          <MonthlyExpenseWidget monthlyExpenses={summary.monthlyExpenses} />

          <BudgetUtilizationWidget
            budgetUtilization={summary.budgetUtilization}
            totalBudget={summary.totalBudget}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <RecentTransactionWidget />

          <ApprovalRequestWidget />
        </div>

        <BudgetTrackingWidget />
      </div>
    </AppLayout>
  );
}
