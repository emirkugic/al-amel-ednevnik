import React, { useState } from "react";
import "./SubjectManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBook,
	faPen,
	faTrash,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import AddEditSubjectModal from "../AddEditSubjectModal/AddEditSubjectModal";

const SubjectManagement = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState(null);

	const subjects = [
		{
			id: 1,
			name: "Mathematics",
			description:
				"Core mathematics curriculum including algebra, geometry, and calculus",
			grades: "All grades",
			gradeLevels: [],
		},
		{
			id: 2,
			name: "Chemistry",
			description:
				"General chemistry studies covering atomic structure, chemical reactions, and lab work",
			grades: "Grades 8 - 12",
			gradeLevels: ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
		},
		{
			id: 3,
			name: "Biology",
			description: "Study of living organisms, ecosystems, and human anatomy",
			grades: "Grades 9 - 12",
			gradeLevels: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"],
		},
	];

	const openAddModal = () => {
		setModalData(null); // Clear data for add mode
		setIsModalOpen(true);
	};

	const openEditModal = (subject) => {
		setModalData(subject); // Set data for edit mode
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalData(null);
	};

	const handleSave = (subjectData) => {
		if (modalData) {
			// Edit logic (e.g., update the subject)
			console.log("Updating subject:", subjectData);
		} else {
			// Add logic (e.g., add a new subject)
			console.log("Adding new subject:", subjectData);
		}
	};

	return (
		<div className="subject-management">
			<div className="header">
				<h2>Subject Management</h2>
				<p>
					Manage your school's academic subjects and their grade assignments
				</p>
				<button className="add-subject" onClick={openAddModal}>
					<FontAwesomeIcon icon={faPlus} /> Add Subject
				</button>
			</div>
			<div className="subject-list">
				{subjects.map((subject) => (
					<div key={subject.id} className="subject-card">
						<div className="subject-header">
							<FontAwesomeIcon icon={faBook} className="subject-icon" />
							<h3>{subject.name}</h3>
						</div>
						<p className="description">{subject.description}</p>
						<p className="grades">
							<FontAwesomeIcon icon={faBook} /> {subject.grades}
						</p>
						<div className="grade-levels">
							{subject.gradeLevels.map((grade, index) => (
								<span key={index} className="grade-pill">
									{grade}
								</span>
							))}
						</div>
						<div className="actions">
							<button className="edit" onClick={() => openEditModal(subject)}>
								<FontAwesomeIcon icon={faPen} />
							</button>
							<button className="delete">
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</div>
					</div>
				))}
			</div>

			{isModalOpen && (
				<AddEditSubjectModal
					isOpen={isModalOpen}
					onClose={closeModal}
					onSave={handleSave}
					initialData={modalData}
				/>
			)}
		</div>
	);
};

export default SubjectManagement;
