import React, { useState, useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import {
	AuthProvider,
	ClassLogsProvider,
	NotificationProvider,
} from "./contexts";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/Sidebar/Sidebar";
import RightSidebar from "./components/RightSidebar/RightSidebar";
import MaintenancePage from "./pages/MaintenancePage/MaintenancePage";
import SettingsPage from "./pages/SettingsPage/SettingsPage";
import useAuth from "./hooks/useAuth";

// temp
import ClassGradesPage from "./pages/DepartmentPage/ClassGradesPage/ClassGradesPage";

import {
	LecturesPage,
	AssessmentPage,
	DepartmentPage,
	SchedulePage,
	LogsPage,
	TeachersPage,
	LoginPage,
	SubjectsPage,
	ParentsPage,
	ClassManagement,
	Dashboard,
	NotFoundPage,
} from "./pages";

import "./App.css";

const AppContent = () => {
	const location = useLocation();
	const { user } = useAuth();
	const [isMaintenanceTime, setIsMaintenanceTime] = useState(false);

	useEffect(() => {
		// Function to check if current time is within maintenance window
		const checkMaintenanceWindow = () => {
			const now = new Date();
			const hour = now.getHours();

			// Check if time is between 23:00h (11 PM) and 1:00h (1 AM)
			const inMaintenanceWindow = hour >= 23 || hour < 1;
			setIsMaintenanceTime(inMaintenanceWindow);
		};

		checkMaintenanceWindow();

		const intervalId = setInterval(checkMaintenanceWindow, 60000);

		return () => clearInterval(intervalId);
	}, []);

	const isLoginPage = location.pathname === "/login";
	const is404Page =
		!isLoginPage &&
		![
			"/",
			"/subjects",
			"/parents",
			"/schedule",
			"/logs",
			"/department",
			"/grades",
			"/teachers",
			"/classes",
			"/settings",
		].includes(location.pathname) &&
		!location.pathname.startsWith("/lectures/") &&
		!location.pathname.startsWith("/courses/");

	const isAdmin = user?.role === "Admin";

	const hideSidebars =
		(isMaintenanceTime && !isAdmin) || isLoginPage || is404Page;

	if (isMaintenanceTime && !isAdmin && location.pathname !== "/login") {
		return <MaintenancePage />;
	}

	return (
		<div className="App">
			{!hideSidebars && <Sidebar />}
			<div className={`main-content ${hideSidebars ? "no-margins" : ""}`}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="*" element={<NotFoundPage />} />

					<Route element={<PrivateRoute />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/subjects" element={<SubjectsPage />} />
						<Route path="/parents" element={<ParentsPage />} />
						<Route path="/schedule" element={<SchedulePage />} />
						<Route path="/logs" element={<LogsPage />} />
						<Route path="/lectures/:departmentId" element={<LecturesPage />} />
						<Route path="/department" element={<DepartmentPage />} />
						<Route path="/grades" element={<ClassGradesPage />} />
						<Route path="/teachers" element={<TeachersPage />} />
						<Route path="/classes" element={<ClassManagement />} />
						<Route path="/courses/:subject" element={<AssessmentPage />} />
						<Route path="/settings" element={<SettingsPage />} />
					</Route>
				</Routes>
			</div>
			{!hideSidebars && <RightSidebar />}
		</div>
	);
};

const App = () => (
	<Router>
		<NotificationProvider>
			<AuthProvider>
				<ClassLogsProvider>
					<AppContent />
				</ClassLogsProvider>
			</AuthProvider>
		</NotificationProvider>
	</Router>
);

export default App;
