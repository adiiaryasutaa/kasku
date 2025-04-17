import { JsonDataProvider } from "./json-provider"

// Define the common interface for all data providers
export interface DataProvider {
  [key: string]: {
    findMany: (args?: any) => Promise<any[]>
    findUnique: (args: { where: any }) => Promise<any | null>
    findFirst: (args?: { where?: any; orderBy?: any }) => Promise<any | null>
    create: (args: { data: any }) => Promise<any>
    update: (args: { where: any; data: any }) => Promise<any>
    delete: (args: { where: any }) => Promise<any>
    count: (args?: { where?: any }) => Promise<number>
  }
}

// Data source database
export type DataSourceType = "json"

// Factory function to create the appropriate data provider
export function createDataProvider(type: DataSourceType = "json"): DataProvider {
  switch (type) {
    case "json":
      return new JsonDataProvider()
    default:
      throw new Error(`Unsupported data provider type: ${type}`)
  }
}

// Create a default data provider instance
const dataProvider = createDataProvider("json")

// Export the data provider as the default export
export default dataProvider

// Also export a convenience function to switch data providers at runtime
export function useDataProvider(type: DataSourceType = "json"): DataProvider {
  return createDataProvider(type)
}

