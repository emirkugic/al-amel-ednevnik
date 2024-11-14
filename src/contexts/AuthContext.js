// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import authApi from "../api/authApi";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();

	// Load user from localStorage on app load
	useEffect(() => {
		const storedUser = JSON.parse(localStorage.getItem("user"));
		if (storedUser) {
			setUser(storedUser);
		}
	}, []);

	const login = async (email, password) => {
		const data = await authApi.login(email, password);
		setUser(data);
		localStorage.setItem("user", JSON.stringify(data)); // Save user data in localStorage
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
