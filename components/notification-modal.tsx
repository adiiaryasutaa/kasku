"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Info,
  CreditCard,
  User,
  DollarSign,
  FileText,
  Check,
  MoreHorizontal,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { formatDistanceToNow } from "date-fns"
import db from "@/lib/data"

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

type NotificationType = "approval" | "alert" | "transaction" | "system" | "member"
type NotificationStatus = "unread" | "read"

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  status: NotificationStatus
  timestamp: Date
  data?: {
    amount?: string
    user?: string
    transactionId?: string
    budgetCategory?: string
    organizationId?: string
    [key: string]: any
  }
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    async function loadNotifications() {
      if (!isOpen) return

      try {
        setIsLoading(true)

        // Fetch pending transactions as approval notifications
        const pendingTransactions = await db.transactions.findMany({
          where: { status: "pending" },
        })

        // Fetch users for requester information
        const users = await db.users.findMany()
        const userMap = users.reduce(
          (map, user) => {
            map[user.id] = user
            return map
          },
          {} as Record<string, any>,
        )

        // Fetch categories for budget alerts
        const categories = await db.categories.findMany()

        // Create approval notifications from pending transactions
        const approvalNotifications = pendingTransactions.map((tx) => {
          const user = userMap[tx.createdBy] || { name: "Unknown User" }

          return {
            id: `approval-${tx.id}`,
            title: "Expense Approval Required",
            message: `${user.name} requested approval for ${tx.title} ($${tx.amount.toFixed(2)})`,
            type: "approval" as NotificationType,
            status: "unread" as NotificationStatus,
            timestamp: new Date(tx.createdAt),
            data: {
              amount: `$${tx.amount.toFixed(2)}`,
              user: user.name,
              transactionId: tx.id,
              organizationId: tx.organizationId,
            },
          }
        })

        // Create budget alert notifications
        // For demo purposes, we'll create alerts for categories with >80% utilization
        const budgetAlerts = categories
          .filter((cat) => {
            // Calculate spent amount for this category
            const spent = pendingTransactions
              .filter((tx) => tx.categoryId === cat.id && tx.type === "expense")
              .reduce((sum, tx) => sum + tx.amount, 0)

            const utilization = (spent / cat.budgetAllocation) * 100
            return utilization > 80
          })
          .map((cat) => {
            const spent = pendingTransactions
              .filter((tx) => tx.categoryId === cat.id && tx.type === "expense")
              .reduce((sum, tx) => sum + tx.amount, 0)

            const utilization = Math.round((spent / cat.budgetAllocation) * 100)

            return {
              id: `alert-${cat.id}`,
              title: "Budget Alert",
              message: `${cat.name} budget has reached ${utilization}% of allocation`,
              type: "alert" as NotificationType,
              status: "unread" as NotificationStatus,
              timestamp: new Date(),
              data: {
                budgetCategory: cat.name,
                amount: `$${spent.toFixed(2)}`,
                allocation: `$${cat.budgetAllocation.toFixed(2)}`,
                organizationId: cat.organizationId,
              },
            }
          })

        // Combine all notifications
        const allNotifications = [
          ...approvalNotifications,
          ...budgetAlerts,
          // Add some system notifications
          {
            id: "system-1",
            title: "System Update",
            message: "Kasku has been updated with new reporting features",
            type: "system" as NotificationType,
            status: "read" as NotificationStatus,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          },
        ]

        // Sort by timestamp (newest first)
        allNotifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

        setNotifications(allNotifications)
      } catch (error) {
        console.error("Error loading notifications:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [isOpen])

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return notification.status === "unread"
    return notification.type === activeTab
  })

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, status: "read" } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, status: "read" })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "approval":
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      case "alert":
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case "transaction":
        return <CreditCard className="w-4 h-4 text-green-500" />
      case "member":
        return <User className="w-4 h-4 text-purple-500" />
      case "system":
        return <Info className="w-4 h-4 text-gray-500" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getActionButton = (notification: Notification) => {
    if (notification.type === "approval" && notification.status === "unread") {
      return (
        <div className="flex gap-2 mt-2">
          <Button size="sm" variant="outline" className="h-8 text-xs">
            Decline
          </Button>
          <Button size="sm" className="h-8 text-xs">
            Approve
          </Button>
        </div>
      )
    }

    if (notification.type === "alert") {
      return (
        <Button size="sm" variant="outline" className="mt-2 h-8 text-xs">
          View Budget
        </Button>
      )
    }

    if (notification.type === "transaction") {
      return (
        <Button size="sm" variant="outline" className="mt-2 h-8 text-xs">
          View Transaction
        </Button>
      )
    }

    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>

          <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="text-xs">
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Mark all as read
          </Button>
        </DialogHeader>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
            <TabsTrigger value="all" className="text-xs">
              All
              {notifications.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {notifications.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approval" className="text-xs">
              Approvals
            </TabsTrigger>
            <TabsTrigger value="alert" className="text-xs">
              Alerts
            </TabsTrigger>
            <TabsTrigger value="transaction" className="text-xs">
              Transactions
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs">
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-12 h-12 rounded-full border-4 border-gray-200 border-t-gray-800 animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                  {activeTab === "unread"
                    ? "You've read all your notifications."
                    : "You don't have any notifications in this category."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      notification.status === "unread"
                        ? "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800"
                        : "bg-white dark:bg-zinc-800 border-gray-100 dark:border-zinc-700",
                      "relative",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{notification.title}</h4>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">More options</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {notification.status === "unread" && (
                                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  <span>Mark as read</span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => deleteNotification(notification.id)}>
                                <span className="text-red-600 dark:text-red-400">Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{notification.message}</p>

                        {notification.data && notification.data.amount && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <DollarSign className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                              {notification.data.amount}
                            </span>

                            {notification.data.transactionId && (
                              <>
                                <span className="text-gray-400 dark:text-gray-500 mx-1">•</span>
                                <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {notification.data.transactionId}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        {getActionButton(notification)}

                        <div className="flex items-center mt-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 mr-1.5" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {notification.status === "unread" && (
                      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

