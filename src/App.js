// src/App.js
import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

import DesktopSidebar from "./components/DesktopSidebar/DesktopSidebar";
import RightSidebarDesktop from "./components/RightSidebarDesktop/RightSidebarDesktop";
import Dashboard from "./components/pages/Dashboard";
import Students from "./components/pages/Students";
import Courses from "./components/pages/Courses";
import Schedule from "./components/pages/Schedule";
import Attendance from "./components/pages/Attendance";
import Grades from "./components/pages/Grades";
import Settings from "./components/pages/Settings";
import Help from "./components/pages/Help";
import Login from "./components/pages/Login";
import SubjectAssessmentManagement from "./components/pages/SubjectAssessmentManagement";
import Lectures from "./components/pages/Lectures";
import Develop from "./components/pages/Develop";
import Teachers from "./components/pages/Teachers";
import Subjects from "./components/pages/Subjects";

import "./App.css";

const AppContent = () => {
	const location = useLocation();

	return (
		<div className="App">
			{location.pathname !== "/login" && <DesktopSidebar />}
			<div className="main-content">
				<Routes>
					<Route path="/login" element={<Login />} />

					<Route element={<PrivateRoute />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/students" element={<Students />} />
						<Route path="/courses" element={<Courses />} />
						<Route path="/schedule" element={<Schedule />} />
						<Route path="/attendance" element={<Attendance />} />
						<Route path="/grades" element={<Grades />} />
						<Route path="/lectures" element={<Lectures />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/help" element={<Help />} />
						<Route path="/develop" element={<Develop />} />
						<Route path="/teachers" element={<Teachers />} />{" "}
						<Route path="/subjects" element={<Subjects />} />{" "}
						{/* Admin-only route */}
						<Route
							path="/courses/:subject"
							element={<SubjectAssessmentManagement />}
						/>
					</Route>
				</Routes>
			</div>
			{location.pathname !== "/login" && <RightSidebarDesktop />}
		</div>
	);
};

const App = () => (
	<Router>
		<AuthProvider>
			<AppContent />
		</AuthProvider>
	</Router>
);

export default App;
