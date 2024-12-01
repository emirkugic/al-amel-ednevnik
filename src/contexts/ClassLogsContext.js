import React, { createContext } from "react";
import useClassLogs from "../hooks/useClassLogs";
import useAuth from "../hooks/useAuth";

export const ClassLogsContext = createContext();

export const ClassLogsProvider = ({ children }) => {
	const { user } = useAuth(); // Get user details from AuthContext
	const { classLogs, fetchClassLogs, loading, error } = useClassLogs(user); // Use the custom hook for class logs

	return (
		<ClassLogsContext.Provider
			value={{ classLogs, fetchClassLogs, loading, error }}
		>
			{children}
		</ClassLogsContext.Provider>
	);
};
