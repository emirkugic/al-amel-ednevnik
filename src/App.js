import React, { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import StudentCardList from "./components/StudentCardList/StudentCardList";
import GradesModal from "./components/GradesModal/GradesModal";
import "./App.css";

const App = () => {
	const [isModalOpen, setModalOpen] = useState(false);
	const [selectedStudent, setSelectedStudent] = useState(null);

	const handleShowGrades = (student) => {
		setSelectedStudent(student);
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setSelectedStudent(null);
	};

	return (
		<div className="App">
			<Sidebar />

			<StudentCardList onShowGrades={handleShowGrades} />

			{selectedStudent && (
				<GradesModal
					student={selectedStudent}
					isOpen={isModalOpen}
					onClose={handleCloseModal}
				/>
			)}
		</div>
	);
};

export default App;
