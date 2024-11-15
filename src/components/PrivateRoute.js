// src/components/PrivateRoute.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
	const { user } = useAuth();
	const location = useLocation();
	const storedUser = JSON.parse(localStorage.getItem("user"));

	// Check if the route is restricted to admins only
	if (
		location.pathname === "/teachers" &&
		user?.role !== "Admin" &&
		storedUser?.role !== "Admin"
	) {
		return <Navigate to="/" />; // Redirect non-admins to the home page
	}

	return user || storedUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
