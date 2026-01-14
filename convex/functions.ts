import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

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

/**
 * updateMockData - Mutation Function
 *
 * Updates a single mock data record in the database.
 * This function is called by the Update page to modify existing data.
 *
 * Usage in React:
 * ```tsx
 * import { useMutation } from "convex/react";
 * import { api } from "../convex/_generated/api";
 *
 * function UpdatePage() {
 *   const updateMockData = useMutation(api.functions.updateMockData);
 *   const handleSubmit = () => {
 *     await updateMockData({ id: "abc123", name: "Updated Name", value: 42 });
 *   };
 * }
 * ```
 *
 * @param id - The document ID to update
 * @param name - The updated name field
 * @param value - The updated value field
 * @returns Promise<Id<"mockData">> - The ID of the updated document
 *
 * Mutation Context:
 * - ctx.db: Database interface for writing data
 * - ctx.db.patch(id, updates): Updates only the specified fields of a document
 */
export const updateMockData = mutation({
  args: {
    id: v.id("mockData"),
    name: v.string(),
    value: v.number(),
  },
  handler: async (ctx, args) => {
    // Update the document with the specified id
    const { id, name, value } = args;
    await ctx.db.patch(id, { name, value });
    return id;
  },
});
