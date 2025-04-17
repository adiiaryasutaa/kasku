"use client"

import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SearchInput } from "@/components/molecules/search-input"

interface RoleFiltersProps {
  activeTab: string
  onTabChange: (value: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function RoleFilters({ activeTab, onTabChange, searchQuery, onSearchChange }: RoleFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <TabsList>
        <TabsTrigger value="all">All Roles</TabsTrigger>
        <TabsTrigger value="system">System Roles</TabsTrigger>
        <TabsTrigger value="custom">Custom Roles</TabsTrigger>
      </TabsList>
      <div className="flex items-center gap-2">
        <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Search roles..." />
      </div>
    </div>
  )
}
