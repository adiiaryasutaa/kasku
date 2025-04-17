"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-9 h-9 md:w-[200px] lg:w-[300px]"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
