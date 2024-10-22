import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import ClassLogForm from "./components/ClassLogForm/ClassLogForm";
import "./App.css";
import LoginForm from "./components/LoginForm/LoginForm";
import StudentCardList from "./components/StudentCardList/StudentCardList";
import GradesModal from "./components/GradesModal/GradesModal";

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

	const [isModalOpen, setModalOpen] = useState(true); // Modal is open by default for demo
	const student = {
		name: "Emma Thompson",
		id: "STU001",
		imageUrl: `${process.env.PUBLIC_URL}/alamel_logo.png`,
	};

	return (
		<div className="App">
			<Sidebar />
			{/* <ClassLogForm /> */}
			{/* <LoginForm /> */}
			{/* <StudentCardList /> */}
			<button onClick={() => setModalOpen(true)}>View Grades</button>

			{/* Modal */}
			<GradesModal
				student={student}
				isOpen={isModalOpen}
				onClose={() => setModalOpen(false)}
			/>
		</div>
	);
};

export default App;
