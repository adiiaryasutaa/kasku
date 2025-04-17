"use client"

import { Edit, Plus, Trash } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/atoms/status-badge"
import { ColorDot } from "@/components/atoms/color-dot"
import { EmptyState } from "@/components/molecules/empty-state"
import { LoadingSpinner } from "@/components/atoms/loading-spinner"
import { Category } from "@prisma/client";

interface CategoriesTableProps {
  categories: Category[]
  isLoading: boolean
  onAddCategory: () => void
  onEditCategory: (category: Category) => void
  onDeleteCategory: (category: Category) => void
}

export function CategoriesTable({
  categories,
  isLoading,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: CategoriesTableProps) {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Plus}
        title="No categories found"
        description="Get started by adding your first category"
        actionLabel="Add Category"
        onAction={onAddCategory}
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Budget Allocation</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <ColorDot color={category.color} />
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-muted-foreground">{category.description}</div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge
                  variant={category.type}
                  label={category.type === "both" ? "Both" : category.type === "income" ? "Income" : "Expense"}
                />
              </TableCell>
              <TableCell>${category.budgetAllocation.toLocaleString()}</TableCell>
              <TableCell>{new Date(category.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onEditCategory(category)}>
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 dark:text-red-400"
                    onClick={() => onDeleteCategory(category)}
                  >
                    <Trash className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
