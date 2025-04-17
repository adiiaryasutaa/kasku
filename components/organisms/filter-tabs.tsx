"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "@/components/molecules/search-input"
import { StatusBadge } from "@/components/atoms/status-badge"
import type { ReactNode } from "react"

interface TabOption {
  value: string
  label: string
  count?: number
  badgeVariant?: string
}

interface FilterTabsProps {
  activeTab: string
  onTabChange: (value: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  tabs: TabOption[]
  additionalFilters?: ReactNode
  searchPlaceholder?: string
}

export function FilterTabs({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  tabs,
  additionalFilters,
  searchPlaceholder = "Search...",
}: FilterTabsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <StatusBadge
                variant={(tab.badgeVariant || "pending") as any}
                label={tab.count.toString()}
                className="ml-2"
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      <div className="flex items-center gap-2">
        <SearchInput value={searchQuery} onChange={onSearchChange} placeholder={searchPlaceholder} />
        {additionalFilters}
      </div>
    </div>
  )
}
