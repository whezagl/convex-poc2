import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../App.css";

/**
 * ViewPage Component
 *
 * Displays real-time data from Convex using the useQuery hook.
 * This component demonstrates Convex's reactive data subscription:
 * - Data automatically updates when changes occur in the database
 * - No manual refresh or re-subscription needed
 * - Handles loading state gracefully
 *
 * References:
 * - Convex useQuery Hook: https://docs.convex.dev/client/react
 * - Real-time Data Pattern: See spec.md "Real-time Data Query Pattern"
 *
 * The useQuery hook:
 * - Returns `undefined` during initial data load
 * - Returns query result when data is ready
 * - Automatically re-renders on data changes
 * - Maintains WebSocket connection for real-time updates
 */
export default function ViewPage() {
  // Fetch all mock data from Convex database
  // useQuery returns undefined while loading, then the data when ready
  const mockData = useQuery(api.functions.getMockData);

  // Handle loading state - useQuery returns undefined during initial load
  if (mockData === undefined) {
    return (
      <div className="page">
        <h1>View Mock Data</h1>
        <div className="loading-container">
          <p className="loading-text">Loading data from Convex...</p>
          <p className="loading-subtext">Connecting to real-time database</p>
        </div>
      </div>
    );
  }

  // Handle empty data state
  if (mockData.length === 0) {
    return (
      <div className="page">
        <h1>View Mock Data</h1>
        <div className="empty-state">
          <p>No data available in the database.</p>
          <p>Use the Update page to add some data.</p>
        </div>
      </div>
    );
  }

  // Display the data in a formatted table
  return (
    <div className="page">
      <h1>View Mock Data</h1>
      <p className="page-description">
        This page displays real-time data from Convex. Open this page in multiple
        browsers to see updates sync instantly.
      </p>

      <div className="data-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Value</th>
              <th>Description</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item) => (
              <tr key={item._id}>
                <td className="id-cell">
                  <code>{item._id.slice(0, 8)}...</code>
                </td>
                <td className="name-cell">{item.name}</td>
                <td className="value-cell">{item.value}</td>
                <td className="description-cell">
                  {item.description ?? <em>None</em>}
                </td>
                <td className="created-cell">
                  {new Date(item._creationTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-box">
        <h3>Real-time Updates Active</h3>
        <p>
          This view is subscribed to changes in the Convex database. Any updates
          made in the Update page will instantly appear here without a page
          refresh.
        </p>
      </div>
    </div>
  );
}
