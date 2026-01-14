import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema Definition
 *
 * This schema defines the data model for the Convex POC application.
 * It includes a mockData table with sample fields for demonstrating
 * real-time data synchronization.
 *
 * References:
 * - Convex Schema Docs: https://docs.convex.dev/home
 * - End-to-end TypeScript with Convex: https://stack.convex.dev/end-to-end-ts
 *
 * Schema Definition Pattern:
 * - Use defineSchema() from "convex/server" to create the schema
 * - Use defineTable() to define individual tables
 * - Use validators from "convex/values" (v) to define field types
 * - Each table automatically gets an _id field of type Id<"tableName">
 */
export default defineSchema({
  /**
   * mockData table
   *
   * Stores sample data for demonstrating real-time CRUD operations.
   * The View page displays these records, and the Update page allows
   * users to modify the name and value fields.
   *
   * Fields:
   * - name: A descriptive name for the data item (required)
   * - value: A numeric value associated with the item (required)
   * - description: Optional additional context about the item
   * - _id: Auto-generated unique identifier (provided by Convex)
   * - _creationTime: Auto-generated timestamp (provided by Convex)
   */
  mockData: defineTable({
    name: v.string(),
    value: v.number(),
    description: v.optional(v.string()),
  }),
});
