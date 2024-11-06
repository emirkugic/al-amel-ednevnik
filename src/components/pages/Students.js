import React, { useState } from "react";
import StudentCardList from "../StudentCardList/StudentCardList";
import GradesModal from "../GradesModal/GradesModal";

const Students = () => {
	const [selectedStudent, setSelectedStudent] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	const handleShowGrades = (student) => {
		setSelectedStudent(student);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedStudent(null);
	};

	return (
		<div>
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

export default Students;