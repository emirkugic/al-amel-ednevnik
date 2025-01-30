import { useState } from "react";
import classLogApi from "../api/classLogApi";

const useUpdateLog = (setClassLogs) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState(null);

	const updateLog = async (updatedLog, token) => {
		if (!token) {
			setError("Error: Missing token. Please log in again.");
			return;
		}

		setIsUpdating(true);
		setError(null);

		try {
			// Call the API to update the class log
			const updatedLogResponse = await classLogApi.updateClassLog(
				updatedLog.classLogId, // Ensure this matches your log ID key
				updatedLog,
				token
			);

			// Update the logs in the state
			setClassLogs((prevLogs) =>
				prevLogs.map((log) =>
					log.classLogId === updatedLog.classLogId
						? { ...log, ...updatedLogResponse }
						: log
				)
			);
		} catch (err) {
			console.error("useUpdatelog.js -> Error updating log:", err);
			setError("Failed to update log. Please try again.");
		} finally {
			setIsUpdating(false);
		}
	};

	return { updateLog, isUpdating, error };
};

export default useUpdateLog;
