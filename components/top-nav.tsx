"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Bell, ChevronRight, ChevronDown, Building2, Plus } from "lucide-react";
import Profile01 from "./profile-01";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { useState, useEffect } from "react";
import CreateOrganizationModal from "./create-organization-modal";
import NotificationModal from "./notification-modal";
import { Badge } from "@/components/ui/badge";
import db from "@/lib/data";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface OrganizationFormData {
  name: string;
  type: string;
  description: string;
  currency: string;
  fiscalYearStart: Date | undefined;
  initialBalance: string;
  logoUrl?: string | null;
}

interface Organization {
  id: string;
  name: string;
  logoUrl?: string;
}

export default function TopNav() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Kasku", href: "#" },
    { label: "Financial Dashboard", href: "#" },
  ];

  useEffect(() => {
    async function loadOrganizations() {
      try {
        const data = await db.organizations.findMany();
        setOrganizations(data);

        // Set the first organization as current if available
        if (data.length > 0) {
          setCurrentOrganization(data[0]);
        }

        // Count pending transactions as notifications
        const pendingTransactions = await db.transactions.count({
          where: { status: "pending" },
        });

        setUnreadNotifications(pendingTransactions);
      } catch (error) {
        console.error("Error loading organizations:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrganizations();
  }, []);

  const handleCreateOrganization = async (data: OrganizationFormData) => {
    try {
      // Convert the form data to the format expected by our data layer
      const organizationData = {
        name: data.name,
        description: data.description,
        type: data.type,
        currency: data.currency,
        fiscalYearStart:
          data.fiscalYearStart?.toISOString() || new Date().toISOString(),
        createdBy: "user_01", // Default to first user
        logoUrl: data.logoUrl || "/placeholder.svg?height=100&width=100",
      };

      // Create the organization
      const newOrganization = await db.organizations.create({
        data: organizationData,
      });

      // Add the new organization to the list
      setOrganizations((prev) => [...prev, newOrganization]);

      // Set as current organization
      setCurrentOrganization(newOrganization);
    } catch (error) {
      console.error("Error creating organization:", error);
    }
  };

  return (
    <>
      <nav className="px-3 sm:px-6 flex items-center justify-between bg-white dark:bg-[#0F0F12] border-b border-gray-200 dark:border-[#1F1F23] h-full">
        <div className="font-medium text-sm hidden sm:flex items-center space-x-1 truncate max-w-[300px]">
          {breadcrumbs.map((item, index) => (
            <div key={item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-500 dark:text-gray-400 mx-1" />
              )}
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-900 dark:text-gray-100">
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-[#1F1F23] transition-colors">
              <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              <span className="hidden sm:inline text-gray-700 dark:text-gray-300">
                {isLoading
                  ? "Loading..."
                  : currentOrganization?.name || "Select Organization"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                Your Organizations
              </div>
              {organizations.map((org) => (
                <DropdownMenuItem
                  key={org.id}
                  className="cursor-pointer"
                  onClick={() => setCurrentOrganization(org)}
                >
                  <Building2 className="h-4 w-4 mr-2 text-gray-600 dark:text-gray-300" />
                  <span>{org.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-600 dark:text-blue-400">
                  Create New Organization
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="relative">
            <button
              type="button"
              className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-[#1F1F23] rounded-full transition-colors"
              onClick={() => setIsNotificationModalOpen(true)}
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 dark:text-gray-300" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] text-[10px] flex items-center justify-center"
                >
                  {unreadNotifications}
                </Badge>
              )}
            </button>
          </div>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Image
                src="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png"
                alt="User avatar"
                width={28}
                height={28}
                className="rounded-full ring-2 ring-gray-200 dark:ring-[#2B2B30] sm:w-8 sm:h-8 cursor-pointer"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-[280px] sm:w-80 bg-background border-border rounded-lg shadow-lg"
            >
              <Profile01 avatar="https://ferf1mheo22r9ira.public.blob.vercel-storage.com/avatar-01-n0x8HFv8EUetf9z6ht0wScJKoTHqf8.png" />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateOrganization={handleCreateOrganization}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
}
