import React, { createContext } from "react";
import useClassLogs from "../hooks/useClassLogs";
import useAuth from "../hooks/useAuth";

export const ClassLogsContext = createContext();

export const ClassLogsProvider = ({ children }) => {
	const { user } = useAuth();
	const { classLogs, fetchClassLogs, loading, error, setClassLogs } =
		useClassLogs(user);

	return (
		<ClassLogsContext.Provider
			value={{ classLogs, fetchClassLogs, setClassLogs, loading, error }}
		>
			{children}
		</ClassLogsContext.Provider>
	);
};
