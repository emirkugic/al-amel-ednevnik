import React, { createContext, useState, useEffect } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [assignedSubjects, setAssignedSubjects] = useState([]);
	const [timetable, setTimetable] = useState([]);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	// This function checks if the token is valid
	const isTokenValid = (token) => {
		try {
			const decodedToken = jwtDecode(token);
			return decodedToken.exp * 1000 > Date.now();
		} catch (error) {
			return false;
		}
	};

	// Load user data from localStorage on mount
	useEffect(() => {
		const initializeAuth = () => {
			try {
				setLoading(true);
				const storedUser = JSON.parse(localStorage.getItem("user"));

				if (storedUser && storedUser.token && isTokenValid(storedUser.token)) {
					const decodedToken = jwtDecode(storedUser.token);

					const userWithRoleAndId = {
						...storedUser,
						role: decodedToken.role,
						id: decodedToken.unique_name,
					};

					setUser(userWithRoleAndId);
					setAssignedSubjects(storedUser.assignedSubjects || []);
					setTimetable(storedUser.timetable || []);

					// Set up auto-logout when token expires
					const timeout = decodedToken.exp * 1000 - Date.now();
					if (timeout > 0) {
						setTimeout(logout, timeout);
					}
				} else if (storedUser && storedUser.token) {
					// Token is invalid or expired
					logout();
				}
			} catch (error) {
				console.error("Error initializing auth:", error);
				logout();
			} finally {
				setLoading(false);
			}
		};

		initializeAuth();

		// Add an event listener for storage events to sync auth across tabs
		window.addEventListener("storage", handleStorageChange);

		return () => {
			window.removeEventListener("storage", handleStorageChange);
		};
	}, []);

	// Handle storage events (for multi-tab synchronization)
	const handleStorageChange = (event) => {
		if (event.key === "user") {
			if (!event.newValue) {
				// User was logged out in another tab
				setUser(null);
				setAssignedSubjects([]);
				setTimetable([]);
			} else {
				// User was updated in another tab
				const storedUser = JSON.parse(event.newValue);
				if (storedUser && storedUser.token && isTokenValid(storedUser.token)) {
					const decodedToken = jwtDecode(storedUser.token);
					setUser({
						...storedUser,
						role: decodedToken.role,
						id: decodedToken.unique_name,
					});
					setAssignedSubjects(storedUser.assignedSubjects || []);
					setTimetable(storedUser.timetable || []);
				}
			}
		}
	};

	const login = async (email, password) => {
		try {
			const data = await authApi.login(email, password);
			const decodedToken = jwtDecode(data.token);

			const userWithRoleAndId = {
				token: data.token,
				role: decodedToken.role,
				id: decodedToken.unique_name,
			};

			setUser(userWithRoleAndId);
			setAssignedSubjects(data.assignedSubjects || []);
			setTimetable(data.timetable || []);

			// Store complete user info in localStorage
			localStorage.setItem(
				"user",
				JSON.stringify({
					...userWithRoleAndId,
					...data,
					assignedSubjects: data.assignedSubjects || [],
					timetable: data.timetable || [],
				})
			);

			// Set up auto-logout when token expires
			const timeout = decodedToken.exp * 1000 - Date.now();
			setTimeout(logout, timeout);

			navigate("/logs");
			return userWithRoleAndId;
		} catch (error) {
			console.error("Login error:", error);
			throw error;
		}
	};

	const logout = () => {
		setUser(null);
		setAssignedSubjects([]);
		setTimetable([]);
		localStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				assignedSubjects,
				timetable,
				login,
				logout,
				loading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
