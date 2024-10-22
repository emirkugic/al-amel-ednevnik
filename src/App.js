import React, { useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import ClassLogForm from "./components/ClassLogForm/ClassLogForm";
import "./App.css";
import LoginForm from "./components/LoginForm/LoginForm";
import StudentCard from "./components/StudentCard/StudentCard";

const App = () => {
	// disable right click
	// useEffect(() => {
	// 	const handleRightClick = (event) => {
	// 		event.preventDefault();
	// 	};

	// 	document.addEventListener("contextmenu", handleRightClick);

	// 	return () => {
	// 		document.removeEventListener("contextmenu", handleRightClick);
	// 	};
	// }, []);

	return (
		<div className="App">
			<Sidebar />
			{/* <ClassLogForm /> */}
			{/* <LoginForm /> */}
			<StudentCard />
		</div>
	);
};

export default App;
