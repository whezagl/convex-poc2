import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import "../App.css";

/**
 * UpdatePage Component
 *
 * Provides a form interface for updating existing mock data records in Convex.
 * This component demonstrates Convex's mutation capabilities:
 * - Fetches existing data using useQuery
 * - Updates data using useMutation
 * - Real-time sync: changes instantly appear in all connected ViewPage instances
 * - No manual refresh or cache invalidation needed
 *
 * References:
 * - Convex useMutation Hook: https://docs.convex.dev/client/react
 * - Mutation Pattern: See spec.md "Mutation Pattern for Updates"
 *
 * The useMutation hook:
 * - Returns a function that executes the mutation when called
 * - Automatically retries until confirmed
 * - Handles optimistic updates automatically
 * - No manual invalidation or refresh needed
 *
 * Form Workflow:
 * 1. Select an existing record from the dropdown
 * 2. Edit the name and/or value fields
 * 3. Submit the form to update the record
 * 4. Changes instantly sync to all ViewPage instances
 */
export default function UpdatePage() {
  // Fetch all mock data to populate the record selector
  const mockData = useQuery(api.functions.getMockData);

  // Mutation function for updating records
  // useMutation returns a function that executes the mutation
  const updateMockData = useMutation(api.functions.updateMockData);

  // Form state
  const [selectedId, setSelectedId] = useState("");
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Handle record selection from dropdown
  const handleRecordSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);

    // Find the selected record and populate form fields
    const selectedRecord = mockData?.find((item) => item._id === id);
    if (selectedRecord) {
      setName(selectedRecord.name);
      setValue(selectedRecord.value.toString());
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedId) {
      setErrorMessage("Please select a record to update.");
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Name cannot be empty.");
      return;
    }
    if (value === "" || isNaN(Number(value))) {
      setErrorMessage("Value must be a valid number.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Execute the mutation
      // Convex automatically handles retries and optimistic updates
      await updateMockData({
        id: selectedId,
        name: name.trim(),
        value: Number(value),
      });

      // Show success message
      setSuccessMessage("Record updated successfully! Check the View page to see the change.");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      // Handle any errors (network issues, validation, etc.)
      setErrorMessage(`Failed to update record: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle loading state
  if (mockData === undefined) {
    return (
      <div className="page">
        <h1>Update Mock Data</h1>
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
        <h1>Update Mock Data</h1>
        <div className="empty-state">
          <p>No data available in the database.</p>
          <p>Please seed the database first using the data seeding script.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Update Mock Data</h1>
      <p className="page-description">
        Select a record to update and modify its values. Changes will instantly
        appear in the View page of all connected browsers.
      </p>

      <div className="update-form-container">
        <form className="update-form" onSubmit={handleSubmit}>
          {/* Record Selector */}
          <div className="form-group">
            <label htmlFor="record-select">Select Record to Update:</label>
            <select
              id="record-select"
              value={selectedId}
              onChange={handleRecordSelect}
              className="form-control"
              disabled={isSubmitting}
            >
              <option value="">-- Choose a record --</option>
              {mockData.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} (Value: {item.value})
                </option>
              ))}
            </select>
          </div>

          {/* Name Field */}
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
              placeholder="Enter name"
              disabled={!selectedId || isSubmitting}
            />
          </div>

          {/* Value Field */}
          <div className="form-group">
            <label htmlFor="value">Value:</label>
            <input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="form-control"
              placeholder="Enter numeric value"
              disabled={!selectedId || isSubmitting}
              step="any"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="submit-button"
            disabled={!selectedId || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Record"}
          </button>

          {/* Messages */}
          {errorMessage && (
            <div className="message error-message">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="message success-message">{successMessage}</div>
          )}
        </form>

        {/* Selected Record Info */}
        {selectedId && (
          <div className="selected-record-info">
            <h3>Current Record Details</h3>
            {mockData
              .filter((item) => item._id === selectedId)
              .map((item) => (
                <div key={item._id} className="record-details">
                  <p>
                    <strong>ID:</strong> <code>{item._id.slice(0, 8)}...</code>
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {item.description ?? <em>None</em>}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(item._creationTime).toLocaleString()}
                  </p>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="info-box" style={{ marginTop: "2rem" }}>
        <h3>Real-time Update Demo</h3>
        <p>
          Open the <strong>View</strong> page in a separate browser window or
          device. When you submit an update here, the changes will instantly
          appear there without any page refresh. This demonstrates Convex's
          real-time data synchronization.
        </p>
      </div>
    </div>
  );
}
