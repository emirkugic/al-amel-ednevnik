import React from "react";
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

import Dashboard from "./components/pages/Dashboard";
import Students from "./components/pages/Students";
import Help from "./components/pages/Help";

import Classes from "./components/pages/Classes";

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
	Assessments,
} from "./pages";

import "./App.css";

const AppContent = () => {
	const location = useLocation();
	const isLoginPage = location.pathname === "/login";

	return (
		<div className="App">
			{!isLoginPage && <Sidebar />}
			<div className={`main-content ${isLoginPage ? "no-margins" : ""}`}>
				<Routes>
					<Route path="/login" element={<LoginPage />} />

					<Route element={<PrivateRoute />}>
						<Route path="/" element={<Dashboard />} />
						<Route path="/students" element={<Students />} />
						<Route path="/help" element={<Help />} />
						<Route path="/subjects" element={<SubjectsPage />} />
						<Route path="/classes" element={<Classes />} />
						<Route path="/parents" element={<ParentsPage />} />
						<Route path="/schedule" element={<SchedulePage />} />
						<Route path="/logs" element={<LogsPage />} />
						<Route path="/teachers" element={<TeachersPage />} />

						<Route path="/lectures/:departmentId" element={<LecturesPage />} />
						<Route path="/courses/:subject" element={<AssessmentPage />} />
						<Route path="/department" element={<DepartmentPage />} />

						<Route path="/assessments" element={<Assessments />} />
					</Route>
				</Routes>
			</div>
			{!isLoginPage && <RightSidebar />}
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
