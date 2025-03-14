import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
	const { user, loading } = useAuth();
	const location = useLocation();

	// Show a loading indicator or nothing while checking authentication
	if (loading) {
		return <div className="loading-container">Loading...</div>; // You can replace this with a spinner or other loading UI
	}

	// Check if the route is restricted to admins only
	if (location.pathname === "/teachers" && user?.role !== "Admin") {
		return <Navigate to="/" />; // Redirect non-admins to the home page
	}

	return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
