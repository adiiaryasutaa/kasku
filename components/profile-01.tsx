"use client"

import type React from "react"
import { LogOut, MoveUpRight, Settings, Shield, Bell, Lock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import db from "@/lib/data"

interface MenuItem {
  label: string
  value?: string
  href: string
  icon?: React.ReactNode
  external?: boolean
}

interface Profile01Props {
  name?: string
  role?: string
  avatar?: string
  subscription?: string
  userId?: string
}

export default function Profile01({ userId = "user_01", avatar }: Profile01Props) {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        // Fetch user data
        const userData = await db.users.findUnique({
          where: { id: userId },
        })

        if (userData) {
          setUser(userData)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [userId])

  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto p-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="w-full max-w-sm mx-auto p-6">
        <div className="text-center">
          <p className="text-red-500">User not found</p>
        </div>
      </div>
    )
  }

  const menuItems: MenuItem[] = [
    {
      label: "Role",
      value: user.role,
      href: "#",
      icon: <Shield className="w-4 h-4" />,
      external: false,
    },
    {
      label: "Account Settings",
      href: "#",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      label: "Notification Preferences",
      href: "#",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      label: "Privacy & Security",
      href: "#",
      icon: <Lock className="w-4 h-4" />,
      external: false,
    },
  ]

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="relative px-6 pt-12 pb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="relative shrink-0">
              <Image
                src={avatar || user.avatarUrl || "/placeholder.svg"}
                alt={user.name}
                width={72}
                height={72}
                className="rounded-full ring-4 ring-white dark:ring-zinc-900 object-cover"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</h2>
              <p className="text-zinc-600 dark:text-zinc-400">{user.role}</p>
            </div>
          </div>
          <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-6" />
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-between p-2 
                                    hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                    rounded-lg transition-colors duration-200"
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.label}</span>
                </div>
                <div className="flex items-center">
                  {item.value && <span className="text-sm text-zinc-500 dark:text-zinc-400 mr-2">{item.value}</span>}
                  {item.external && <MoveUpRight className="w-4 h-4" />}
                </div>
              </Link>
            ))}

            <button
              type="button"
              className="w-full flex items-center justify-between p-2 
                                hover:bg-zinc-50 dark:hover:bg-zinc-800/50 
                                rounded-lg transition-colors duration-200"
            >
              <div className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

