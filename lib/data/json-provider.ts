// Import JSON data files statically
import categoriesData from "@/data/categories.json"
import transactionsData from "@/data/transactions.json"
import organizationsData from "@/data/organizations.json"
import usersData from "@/data/users.json"
import organizationMembersData from "@/data/organization-members.json"
import rolesData from "@/data/roles.json"
import permissionsData from "@/data/permissions.json"
import rolePermissionsData from "@/data/role-permissions.json"
import approvalsData from "@/data/approvals.json"

import type { DataProvider } from "./index"

// Static data store
const staticDataStore: Record<string, any[]> = {
  categories: [...categoriesData],
  transactions: [...transactionsData],
  organizations: [...organizationsData],
  users: [...usersData],
  organizationMembers: [...organizationMembersData],
  roles: [...rolesData],
  permissions: [...permissionsData],
  rolePermissions: [...rolePermissionsData],
  approvals: [...approvalsData],
}

// Helper function to generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Implementation of the JSON data provider
export class JsonDataProvider implements DataProvider {
  [key: string]: any

  constructor() {
    // Create a proxy to handle dynamic model access
    return new Proxy(this, {
      get: (target, prop) => {
        if (typeof prop === "string" && !target[prop]) {
          // Create model handler on demand
          target[prop] = this.createModelHandler(prop)
        }
        return target[prop]
      },
    })
  }

  private createModelHandler(model: string) {
    // Initialize the model data if it doesn't exist
    if (!staticDataStore[model]) {
      staticDataStore[model] = []
    }

    return {
      findMany: async (args?: { where?: any; orderBy?: any; take?: number; skip?: number }) => {
        let data = [...staticDataStore[model]]

        // Apply filtering if where clause is provided
        if (args?.where) {
          data = this.filterData(data, args.where)
        }

        // Apply sorting if orderBy is provided
        if (args?.orderBy) {
          data = this.sortData(data, args.orderBy)
        }

        // Apply pagination if take/skip are provided
        if (args?.skip) {
          data = data.slice(args.skip)
        }

        if (args?.take) {
          data = data.slice(0, args.take)
        }

        return data
      },

      findUnique: async (args: { where: any }) => {
        const data = staticDataStore[model]
        return data.find((item) => this.matchesWhere(item, args.where)) || null
      },

      findFirst: async (args?: { where?: any; orderBy?: any }) => {
        let data = [...staticDataStore[model]]

        // Apply filtering if where clause is provided
        if (args?.where) {
          data = this.filterData(data, args.where)
        }

        // Apply sorting if orderBy is provided
        if (args?.orderBy) {
          data = this.sortData(data, args.orderBy)
        }

        return data[0] || null
      },

      create: async (args: { data: any }) => {
        const newItem = {
          id: args.data.id || generateId(),
          ...args.data,
          createdAt: args.data.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        staticDataStore[model].push(newItem)

        return newItem
      },

      update: async (args: { where: any; data: any }) => {
        const data = staticDataStore[model]
        const index = data.findIndex((item) => this.matchesWhere(item, args.where))

        if (index === -1) {
          throw new Error(`${model} not found`)
        }

        const updatedItem = {
          ...data[index],
          ...args.data,
          updatedAt: new Date().toISOString(),
        }

        staticDataStore[model][index] = updatedItem

        return updatedItem
      },

      delete: async (args: { where: any }) => {
        const data = staticDataStore[model]
        const index = data.findIndex((item) => this.matchesWhere(item, args.where))

        if (index === -1) {
          throw new Error(`${model} not found`)
        }

        const deletedItem = data[index]
        staticDataStore[model].splice(index, 1)

        return deletedItem
      },

      count: async (args?: { where?: any }) => {
        let data = staticDataStore[model]

        if (args?.where) {
          data = this.filterData(data, args.where)
        }

        return data.length
      },
    }
  }

  // Helper method to filter data based on where clause
  private filterData(data: any[], where: any): any[] {
    return data.filter((item) => this.matchesWhere(item, where))
  }

  // Helper method to check if an item matches a where clause
  private matchesWhere(item: any, where: any): boolean {
    for (const key in where) {
      if (key === "OR" && Array.isArray(where.OR)) {
        if (!where.OR.some((subWhere: any) => this.matchesWhere(item, subWhere))) {
          return false
        }
      } else if (key === "AND" && Array.isArray(where.AND)) {
        if (!where.AND.every((subWhere: any) => this.matchesWhere(item, subWhere))) {
          return false
        }
      } else if (typeof where[key] === "object" && where[key] !== null) {
        // Handle operators like contains, equals, gt, lt, etc.
        if (!this.matchesOperators(item[key], where[key])) {
          return false
        }
      } else if (item[key] !== where[key]) {
        return false
      }
    }

    return true
  }

  // Helper method to handle operators in where clauses
  private matchesOperators(value: any, operators: any): boolean {
    for (const op in operators) {
      switch (op) {
        case "equals":
          if (value !== operators.equals) return false
          break
        case "not":
          if (value === operators.not) return false
          break
        case "in":
          if (!operators.in.includes(value)) return false
          break
        case "notIn":
          if (operators.notIn.includes(value)) return false
          break
        case "lt":
          if (!(value < operators.lt)) return false
          break
        case "lte":
          if (!(value <= operators.lte)) return false
          break
        case "gt":
          if (!(value > operators.gt)) return false
          break
        case "gte":
          if (!(value >= operators.gte)) return false
          break
        case "contains":
          if (!value || !value.includes(operators.contains)) return false
          break
        case "startsWith":
          if (!value || !value.startsWith(operators.startsWith)) return false
          break
        case "endsWith":
          if (!value || !value.endsWith(operators.endsWith)) return false
          break
      }
    }

    return true
  }

  // Helper method to sort data based on orderBy
  private sortData(data: any[], orderBy: any): any[] {
    return [...data].sort((a, b) => {
      for (const key in orderBy) {
        const direction = orderBy[key] === "asc" ? 1 : -1

        if (a[key] < b[key]) return -1 * direction
        if (a[key] > b[key]) return 1 * direction
      }

      return 0
    })
  }
}

