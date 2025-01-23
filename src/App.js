import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ClassLogsProvider } from "./contexts/ClassLogsContext";

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
import Develop from "./components/pages/Develop";
import Teachers from "./components/pages/Teachers";
import Subjects from "./components/pages/Subjects";
import Classes from "./components/pages/Classes";
import Parents from "./components/pages/Parents";

import { LecturesPage, AssessmentPage, DepartmentPage } from "./pages/index.js";

import "./App.css";

const AppContent = () => {
	const location = useLocation();
	const isLoginPage = location.pathname === "/login";

	return (
		<div className="App">
			{!isLoginPage && <DesktopSidebar />}
			<div className={`main-content ${isLoginPage ? "no-margins" : ""}`}>
				<Routes>
					<Route path="/login" element={<Login />} />

					<Route element={<PrivateRoute />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/students" element={<Students />} />
						<Route path="/courses" element={<Courses />} />
						<Route path="/schedule" element={<Schedule />} />
						<Route path="/attendance" element={<Attendance />} />
						<Route path="/grades" element={<Grades />} />
						<Route path="/settings" element={<Settings />} />
						<Route path="/help" element={<Help />} />
						<Route path="/develop" element={<Develop />} />
						<Route path="/teachers" element={<Teachers />} />
						<Route path="/subjects" element={<Subjects />} />
						<Route path="/classes" element={<Classes />} />
						<Route path="/parents" element={<Parents />} />

						<Route path="/lectures/:departmentId" element={<LecturesPage />} />
						<Route path="/courses/:subject" element={<AssessmentPage />} />
						<Route
							path="/department/:departmentId"
							element={<DepartmentPage />}
						/>
					</Route>
				</Routes>
			</div>
			{!isLoginPage && <RightSidebarDesktop />}
		</div>
	);
};

const App = () => (
	<Router>
		<AuthProvider>
			<ClassLogsProvider>
				<AppContent />
			</ClassLogsProvider>
		</AuthProvider>
	</Router>
);

export default App;
