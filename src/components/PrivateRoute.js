import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
	const { user, loading } = useAuth();
	const location = useLocation();

	// Show a loading indicator while checking authentication
	if (loading) {
		return <div className="loading-container">Loading...</div>;
	}

	// Check if the route is restricted to admins only
	if (location.pathname === "/teachers" && user?.role !== "Admin") {
		return <Navigate to="/" />; // Redirect non-admins to the home page
	}

	// Normal auth check
	return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
