import React, { createContext, useState, useEffect } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [assignedSubjects, setAssignedSubjects] = useState([]);
	const [timetable, setTimetable] = useState([]);
	const navigate = useNavigate();

	useEffect(() => {
		const storedUser = JSON.parse(localStorage.getItem("user"));
		if (storedUser && storedUser.token) {
			const decodedToken = jwtDecode(storedUser.token);

			// Check if the token is expired
			if (decodedToken.exp * 1000 < Date.now()) {
				logout();
			} else {
				const userWithRoleAndId = {
					...storedUser,
					role: decodedToken.role,
					id: decodedToken.unique_name,
				};
				setUser(userWithRoleAndId);
				setAssignedSubjects(storedUser.assignedSubjects || []);
				setTimetable(storedUser.timetable || []);

				// Set a timeout to automatically log out the user when the token expires
				const timeout = decodedToken.exp * 1000 - Date.now();
				setTimeout(logout, timeout);
			}
		}
	}, []);

	const login = async (email, password) => {
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
		localStorage.setItem(
			"user",
			JSON.stringify({ ...userWithRoleAndId, ...data })
		);

		//automatically log out the user when the token expires
		const timeout = decodedToken.exp * 1000 - Date.now();
		setTimeout(logout, timeout);

		navigate("/");
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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
