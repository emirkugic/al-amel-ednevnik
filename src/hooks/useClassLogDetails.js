import { useState, useEffect, useRef } from "react";
import classLogApi from "../api/classLogApi";
import useAuth from "./useAuth";

/**
 * Custom hook for fetching detailed class log information
 * @param {string} logId - The ID of the class log to fetch details for
 * @returns {Object} - Contains logDetails, loading state, and error information
 */
const useClassLogDetails = (logId) => {
	const [logDetails, setLogDetails] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const { user } = useAuth();

	// Keep track of the current request ID to prevent stale data
	const currentRequestIdRef = useRef(null);

	// Clear logDetails when logId changes
	useEffect(() => {
		// Reset the state immediately when logId changes
		setLogDetails(null);

		if (!logId || !user?.token) {
			setLoading(false);
			return;
		}

		const fetchLogDetails = async () => {
			// Create a unique ID for this request
			const requestId = Date.now();
			currentRequestIdRef.current = requestId;

			setLoading(true);

			try {
				const data = await classLogApi.getClassLogDetails(logId, user.token);

				// Only update state if this is still the current request
				if (currentRequestIdRef.current === requestId) {
					setLogDetails(data);
					setError(null);
				}
			} catch (err) {
				// Only update error if this is still the current request
				if (currentRequestIdRef.current === requestId) {
					console.error("Error fetching class log details:", err);
					setError("Failed to load class log details. Please try again.");
				}
			} finally {
				// Only update loading state if this is still the current request
				if (currentRequestIdRef.current === requestId) {
					setLoading(false);
				}
			}
		};

		fetchLogDetails();

		// Cleanup function to handle component unmount or logId change
		return () => {
			// Mark any in-progress requests as stale
			currentRequestIdRef.current = null;
		};
	}, [logId, user?.token]);

	// Function to manually refetch the details with the same guard
	const refetchDetails = async () => {
		if (!logId || !user?.token) return;

		const requestId = Date.now();
		currentRequestIdRef.current = requestId;

		try {
			setLoading(true);
			const data = await classLogApi.getClassLogDetails(logId, user.token);

			if (currentRequestIdRef.current === requestId) {
				setLogDetails(data);
				setError(null);
			}
		} catch (err) {
			if (currentRequestIdRef.current === requestId) {
				console.error("Error refetching class log details:", err);
				setError("Failed to reload class log details. Please try again.");
			}
		} finally {
			if (currentRequestIdRef.current === requestId) {
				setLoading(false);
			}
		}
	};

	return { logDetails, loading, error, refetchDetails };
};

export default useClassLogDetails;
