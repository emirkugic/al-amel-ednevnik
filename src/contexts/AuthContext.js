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
			const userWithRoleAndId = {
				...storedUser,
				role: decodedToken.role,
				id: decodedToken.unique_name,
			};
			setUser(userWithRoleAndId);
			setAssignedSubjects(storedUser.assignedSubjects || []);
			setTimetable(storedUser.timetable || []);
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
