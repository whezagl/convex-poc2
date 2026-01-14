import { query } from "./_generated/server";

/**
 * Convex Functions - Query and Mutation Functions
 *
 * This file defines the backend functions for the Convex POC application.
 * It includes query functions for reading data and mutation functions for
 * modifying data.
 *
 * References:
 * - Convex Query Functions: https://docs.convex.dev/functions/query-functions
 * - Convex Mutation Functions: https://docs.convex.dev/functions/mutation-functions
 *
 * Function Naming Pattern:
 * - Queries: Functions that read data from the database (use `query` constructor)
 * - Mutations: Functions that write data (use `mutation` constructor)
 * - Actions: Functions that perform complex operations or call external APIs
 *
 * Client Usage:
 * - Query: useQuery(api.functions.getMockData)
 * - Mutation: useMutation(api.functions.updateMockData)
 */

/**
 * getMockData - Query Function
 *
 * Retrieves all mock data records from the database.
 * This function is called by the View page to display data in real-time.
 *
 * Usage in React:
 * ```tsx
 * import { useQuery } from "convex/react";
 * import { api } from "../convex/_generated/api";
 *
 * function ViewPage() {
 *   const mockData = useQuery(api.functions.getMockData);
 *   // mockData is undefined during loading, array of data when ready
 * }
 * ```
 *
 * @returns Promise<Array<Document>> - All records from the mockData table
 *
 * Query Context:
 * - ctx.db: Database interface for querying data
 * - ctx.auth: Authentication context (not used in this POC)
 * - ctx.storage: File storage interface (not used in this POC)
 */
export const getMockData = query({
  args: {},
  handler: async (ctx) => {
    // Query the mockData table and return all documents
    const mockData = await ctx.db.query("mockData").collect();
    return mockData;
  },
});
