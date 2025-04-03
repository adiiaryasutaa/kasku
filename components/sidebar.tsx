"use client";

import type React from "react";

import {
  Receipt,
  CreditCard,
  FileText,
  Wallet,
  Users2,
  Shield,
  CheckSquare,
  Settings,
  Group,
  HelpCircle,
  Menu,
  Home,
} from "lucide-react";

import Link from "next/link";
import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import db from "@/lib/data";

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export default function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentOrganization() {
      try {
        // Get the first organization as current
        const organizations = await db.organizations.findMany({
          take: 1,
        });

        if (organizations.length > 0) {
          setCurrentOrganization(organizations[0]);
        }
      } catch (error) {
        console.error("Error loading organization:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentOrganization();
  }, []);

  function handleNavigation() {
    setIsMobileMenuOpen(false);
  }

  function NavItem({
    href,
    icon: Icon,
    children,
  }: {
    href: string;
    icon: any;
    children: React.ReactNode;
  }) {
    const pathname = usePathname();
    const isActive =
      pathname === href || (href === "/" && pathname === "/dashboard");

    return (
      <Link
        href={href}
        onClick={handleNavigation}
        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
          isActive
            ? "bg-primary text-white dark:text-gray-900 font-medium"
            : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#1F1F23]"
        }`}
      >
        <Icon
          className={`h-4 w-4 mr-3 flex-shrink-0 ${
            isActive ? "text-white dark:text-gray-900" : ""
          }`}
        />
        {children}
      </Link>
    );
  }

  // Define navigation sections
  const navSections: NavSection[] = [
    {
      title: "Dashboard",
      items: [
        { href: "/", icon: Home, label: "Overview" },
        // { href: "/insights", icon: BarChart2, label: "Financial Insights" },
      ],
    },
    {
      title: "Finances",
      items: [
        { href: "/transactions", icon: Wallet, label: "Transactions" },
        { href: "/expenses", icon: Receipt, label: "Expenses" },
        { href: "/income", icon: CreditCard, label: "Income" },
        { href: "/reports", icon: FileText, label: "Reports" },
      ],
    },
    {
      title: "Management",
      items: [
        { href: "/categories", icon: Group, label: "Categories" },
        { href: "/members", icon: Users2, label: "Members" },
        { href: "/roles", icon: Shield, label: "Roles & Permissions" },
        { href: "/approvals", icon: CheckSquare, label: "Approvals" },
      ],
    },
  ];

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-[70] p-2 rounded-lg bg-white dark:bg-[#0F0F12] shadow-md"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      </button>
      <nav
        className={`
                fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-[#0F0F12] transform transition-transform duration-200 ease-in-out
                lg:translate-x-0 lg:static lg:w-64 border-r border-gray-200 dark:border-[#1F1F23]
                ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}
      >
        <div className="h-full flex flex-col">
          <Link
            href="#"
            className="h-16 px-6 flex items-center border-b border-gray-200 dark:border-[#1F1F23]"
          >
            <div className="flex items-center gap-3">
              {/* {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              ) : (
                <>
                  <Image
                    src={
                      currentOrganization?.logoUrl ||
                      "https://kokonutui.com/logo.svg"
                    }
                    alt="Kasku"
                    width={32}
                    height={32}
                    className="flex-shrink-0 hidden dark:block"
                  />
                  <Image
                    src={
                      currentOrganization?.logoUrl ||
                      "https://kokonutui.com/logo-black.svg"
                    }
                    alt="Kasku"
                    width={32}
                    height={32}
                    className="flex-shrink-0 block dark:hidden"
                  />
                </>
              )} */}
              <span className="text-lg font-semibold hover:cursor-pointer text-gray-900 dark:text-white">
                Kasku
              </span>
            </div>
          </Link>

          <div className="flex-1 overflow-y-auto py-4 px-4">
            <div className="space-y-6">
              {navSections.map((section) => (
                <div key={section.title}>
                  <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {section.title}
                  </div>
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                      >
                        {item.label}
                      </NavItem>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 py-4 border-t border-gray-200 dark:border-[#1F1F23]">
            <div className="space-y-1">
              <NavItem href="/settings" icon={Settings}>
                Settings
              </NavItem>
              <NavItem href="/help" icon={HelpCircle}>
                Help
              </NavItem>
            </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
