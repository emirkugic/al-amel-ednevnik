// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	useEffect(() => {
		const storedUser = JSON.parse(localStorage.getItem("user"));
		if (storedUser && storedUser.token) {
			const decodedToken = jwtDecode(storedUser.token);
			const userWithRole = { ...storedUser, role: decodedToken.role };
			setUser(userWithRole);
		}
	}, []);

	const login = async (email, password) => {
		const data = await authApi.login(email, password);
		const decodedToken = jwtDecode(data.token);
		console.log("Decoded token:", decodedToken); // Log the decoded token for verification
		const userWithRole = { ...data, role: decodedToken.role };

		setUser(userWithRole);
		localStorage.setItem("user", JSON.stringify(userWithRole));
		navigate("/");
	};

	const logout = () => {
		setUser(null);
		localStorage.removeItem("user");
		navigate("/login");
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};
