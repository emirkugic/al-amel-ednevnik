import { useState, useEffect } from "react";
import classLogApi from "../api/classLogApi";
import useAuth from "./useAuth";

/**
 * Custom hook for fetching detailed class log information
 * @param {string} logId - The ID of the class log to fetch details for
 * @returns {Object} - Contains logDetails, loading state, and error information
 */
const useClassLogDetails = (logId) => {
	const [logDetails, setLogDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const { user } = useAuth();

	useEffect(() => {
		const fetchLogDetails = async () => {
			if (!logId || !user?.token) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const data = await classLogApi.getClassLogDetails(logId, user.token);
				setLogDetails(data);
				setError(null);
			} catch (err) {
				console.error("Error fetching class log details:", err);
				setError("Failed to load class log details. Please try again.");
			} finally {
				setLoading(false);
			}
		};

		fetchLogDetails();
	}, [logId, user?.token]);

	// Function to manually refetch the details
	const refetchDetails = async () => {
		if (!logId || !user?.token) return;

		try {
			setLoading(true);
			const data = await classLogApi.getClassLogDetails(logId, user.token);
			setLogDetails(data);
			setError(null);
		} catch (err) {
			console.error("Error refetching class log details:", err);
			setError("Failed to reload class log details. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return { logDetails, loading, error, refetchDetails };
};

export default useClassLogDetails;
