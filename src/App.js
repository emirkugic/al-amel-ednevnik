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

// temp
import ClassGradesPage from "./pages/DepartmentPage/ClassGradesPage/ClassGradesPage"; // ovo onaj v3 stranica za ocjene, nemoj brisati

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
	Assessments, // WIP v2 stranica za upisivanje ocjena, nemoj brisati
	ClassManagement,
	Dashboard,
	NotFoundPage,
} from "./pages";

import "./App.css";

const AppContent = () => {
	const location = useLocation();

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
			"/assessments",
		].includes(location.pathname) &&
		!location.pathname.startsWith("/lectures/") &&
		!location.pathname.startsWith("/courses/");

	const hideSidebars = isLoginPage || is404Page;

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
						<Route path="/teachers" element={<TeachersPage />} />{" "}
						<Route path="/classes" element={<ClassManagement />} />
						{/* this is the original page for grades */}
						<Route path="/courses/:subject" element={<AssessmentPage />} />
						{/* this is the WIP */}
						<Route path="/assessments" element={<Assessments />} />
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
