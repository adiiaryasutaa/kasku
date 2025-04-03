"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Filter, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CategoryDrawer from "@/components/category-drawer";
import { ConfirmationModal } from "@/components/confirmation-modal";
import db from "@/lib/data";
import Layout from "@/components/layout";

interface Category {
  id: string;
  name: string;
  description?: string;
  type: "income" | "expense" | "both";
  color: string;
  budgetAllocation: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setIsLoading(true);
      const data = await db.categories.findMany();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredCategories = categories
    .filter((category) => {
      // Filter by search query
      if (searchQuery) {
        return (
          category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (category.description &&
            category.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
        );
      }
      return true;
    })
    .filter((category) => {
      // Filter by tab
      if (activeTab === "all") return true;
      if (activeTab === "income")
        return category.type === "income" || category.type === "both";
      if (activeTab === "expense")
        return category.type === "expense" || category.type === "both";
      return true;
    });

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await db.categories.delete({
        where: { id: categoryToDelete.id },
      });

      setCategories((prev) =>
        prev.filter((cat) => cat.id !== categoryToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditDrawerOpen(true);
  };

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat))
    );
    setIsEditDrawerOpen(false);
    setSelectedCategory(null);
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories((prev) => [...prev, newCategory]);
    setIsCreateDrawerOpen(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Transaction Categories
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage categories for your transactions, budgets, and reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsCreateDrawerOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="income">Income</TabsTrigger>
                  <TabsTrigger value="expense">Expense</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search transactions..."
                      className="pl-9 h-9 md:w-[200px] lg:w-[300px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <div className="p-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium mb-2">Status</p>
                        <Select value={activeTab} onValueChange={setActiveTab}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="income">
                              Income Categories
                            </SelectItem>
                            <SelectItem value="expense">
                              Expense Categories
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs
              defaultValue="all"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsContent value={activeTab}>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No categories found</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setIsCreateDrawerOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </div>
                ) : (
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
                        {filteredCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                <div>
                                  <div className="font-medium">
                                    {category.name}
                                  </div>
                                  {category.description && (
                                    <div className="text-xs text-muted-foreground">
                                      {category.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  category.type === "income"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                    : category.type === "expense"
                                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                    : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                                }
                              >
                                {category.type === "both"
                                  ? "Both"
                                  : category.type === "income"
                                  ? "Income"
                                  : "Expense"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              ${category.budgetAllocation.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                category.updatedAt
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-600 dark:text-red-400"
                                  onClick={() => {
                                    setCategoryToDelete(category);
                                    setIsDeleteModalOpen(true);
                                  }}
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
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Create Category Drawer */}
        <CategoryDrawer
          isOpen={isCreateDrawerOpen}
          onClose={() => setIsCreateDrawerOpen(false)}
          type={
            activeTab === "all" ? "all" : (activeTab as "income" | "expense")
          }
          mode="create"
          onCategoryCreated={handleCategoryCreated}
        />

        {/* Edit Category Drawer */}
        {selectedCategory && (
          <CategoryDrawer
            isOpen={isEditDrawerOpen}
            onClose={() => {
              setIsEditDrawerOpen(false);
              setSelectedCategory(null);
            }}
            mode="edit"
            category={selectedCategory}
            onCategoryUpdated={handleCategoryUpdated}
          />
        )}

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCategoryToDelete(null);
          }}
          onConfirm={handleDeleteCategory}
          title="Delete Category"
          description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone and may affect existing transactions.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </Layout>
  );
}
