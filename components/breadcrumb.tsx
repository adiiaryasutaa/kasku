"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumb() {
  const pathname = usePathname();

  // Skip rendering breadcrumbs on the home page
  if (pathname === "/") {
    return null;
  }

  // Convert path to breadcrumb items
  const pathSegments = pathname.split("/").filter(Boolean);

  // Map paths to readable names
  const pathNames: Record<string, string> = {
    dashboard: "Dashboard",
    transactions: "Transactions",
    expenses: "Expenses",
    income: "Income",
    reports: "Reports",
    members: "Members",
    roles: "Roles & Permissions",
    approvals: "Approvals",
  };

  return (
    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
      <Link
        href="/dashboard"
        className="flex items-center hover:text-gray-900 dark:hover:text-gray-200"
      >
        <Home className="h-4 w-4 mr-1" />
        <span>Dashboard</span>
      </Link>

      {pathSegments.map((segment, index) => {
        // If page is only dashboard, return null
        if (segment === "dashboard") {
          return null;
        }

        const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
        const isLast = index === pathSegments.length - 1;

        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-2" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-gray-200">
                {pathNames[segment] ||
                  segment.charAt(0).toUpperCase() + segment.slice(1)}
              </span>
            ) : (
              <Link
                href={path}
                className="hover:text-gray-900 dark:hover:text-gray-200"
              >
                {pathNames[segment] ||
                  segment.charAt(0).toUpperCase() + segment.slice(1)}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
