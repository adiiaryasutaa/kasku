"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import db from "@/lib/data"
import { FileUp } from "lucide-react"

interface IncomeDrawerProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => void
  income?: any // For editing existing income
  mode: "create" | "view" | "edit"
}

export default function IncomeDrawer({ isOpen, onClose, onSave, income, mode }: IncomeDrawerProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    categoryId: "",
    status: "pending",
    attachmentUrl: null,
  })
  const [categories, setCategories] = useState<any[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await db.categories.findMany({
          where: { type: "income" },
        })
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error loading categories:", error)
      }
    }

    loadCategories()

    // If editing or viewing, populate form with income data
    if (income && (mode === "edit" || mode === "view")) {
      setFormData({
        title: income.title || "",
        description: income.description || "",
        amount: income.amount ? income.amount.toString() : "",
        categoryId: income.categoryId || "",
        status: income.status || "pending",
        attachmentUrl: income.attachmentUrl || null,
      })
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        description: "",
        amount: "",
        categoryId: "",
        status: "pending",
        attachmentUrl: null,
      })
    }
  }, [isOpen, income, mode])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user database
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.amount) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be a positive number"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === "view") {
      onClose()
      return
    }

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const incomeData = {
        ...formData,
        amount: Number.parseFloat(formData.amount),
        type: "income",
        organizationId: "org_01", // Default organization
        createdBy: "user_01", // Current user
        createdAt: income?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (mode === "edit" && income) {
        // Update existing income
        const updatedIncome = await db.transactions.update({
          where: { id: income.id },
          data: incomeData,
        })
        onSave(updatedIncome)
      } else {
        // Create new income
        const newIncome = await db.transactions.create({
          data: {
            ...incomeData,
            id: `tx_${Date.now()}`,
          },
        })
        onSave(newIncome)
      }

      onClose()
    } catch (error) {
      console.error("Error saving income:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isReadOnly = mode === "view"

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Create New Income" : mode === "edit" ? "Edit Income" : "Income Details"}
          </SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Add a new income to your records"
              : mode === "edit"
                ? "Update income information"
                : "View income details"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title {!isReadOnly && <span className="text-red-500">*</span>}</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Membership Fees"
                className={errors.title ? "border-red-500" : ""}
                readOnly={isReadOnly}
              />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the income"
                className="resize-none"
                rows={3}
                readOnly={isReadOnly}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount {!isReadOnly && <span className="text-red-500">*</span>}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                <Input
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  className={`pl-8 ${errors.amount ? "border-red-500" : ""}`}
                  readOnly={isReadOnly}
                />
              </div>
              {errors.amount && <p className="text-xs text-red-500">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category {!isReadOnly && <span className="text-red-500">*</span>}</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => handleSelectChange("categoryId", value)}
                disabled={isReadOnly}
              >
                <SelectTrigger id="category" className={errors.categoryId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            </div>

            {/* Status */}
            {(mode === "edit" || mode === "view") && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Attachment */}
            {!isReadOnly && (
              <div className="space-y-2">
                <Label htmlFor="attachment">Attachment</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="w-full">
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Receipt or Invoice
                  </Button>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Optional: Attach a receipt or invoice (PDF, JPG, PNG)
                </p>
              </div>
            )}

            {/* View Attachment */}
            {isReadOnly && formData.attachmentUrl && (
              <div className="space-y-2">
                <Label>Attachment</Label>
                <Button variant="outline" className="w-full">
                  <FileUp className="mr-2 h-4 w-4" />
                  View Attachment
                </Button>
              </div>
            )}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {isReadOnly ? "Close" : "Cancel"}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : mode === "create" ? "Create" : "Save Changes"}
              </Button>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

