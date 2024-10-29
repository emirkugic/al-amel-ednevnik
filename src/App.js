import React from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";

import Dashboard from "../src/components/pages/Dashboard";
import Students from "../src/components/pages/Students";
import Courses from "../src/components/pages/Courses";
import Schedule from "../src/components/pages/Schedule";
import Attendance from "../src/components/pages/Attendance";
import Grades from "../src/components/pages/Grades";
import Settings from "../src/components/pages/Settings";
import Help from "../src/components/pages/Help";
import Login from "./components/pages/Login";

import "./App.css";

const App = () => {
	const location = useLocation();

	return (
		<div className="App">
			{location.pathname !== "/login" && <Sidebar />}

			<div className="main-content">
				<Routes>
					<Route path="/" element={<Dashboard />} />
					<Route path="/students" element={<Students />} />
					<Route path="/courses" element={<Courses />} />
					<Route path="/schedule" element={<Schedule />} />
					<Route path="/attendance" element={<Attendance />} />
					<Route path="/grades" element={<Grades />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/help" element={<Help />} />
					<Route path="/login" element={<Login />} />
				</Routes>
			</div>
		</div>
	);
};

const WrappedApp = () => {
	return (
		<Router>
			<App />
		</Router>
	);
};

export default WrappedApp;
