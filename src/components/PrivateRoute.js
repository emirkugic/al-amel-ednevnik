import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoute = () => {
	const { user } = useAuth();
	const storedUser = JSON.parse(localStorage.getItem("user"));

	return user || storedUser ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
