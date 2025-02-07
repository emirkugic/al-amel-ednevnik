import React, { useState, useEffect } from "react";
import "./SubjectManagement.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBook,
	faPen,
	faTrash,
	faPlus,
} from "@fortawesome/free-solid-svg-icons";
import AddEditSubjectModal from "../AddEditSubjectModal/AddEditSubjectModal";
import subjectApi from "../../../../api/subjectApi";
import useAuth from "../../../../hooks/useAuth";

const SubjectManagement = () => {
	const { user } = useAuth(); // Access token from context
	const [subjects, setSubjects] = useState([]);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalData, setModalData] = useState(null);

	useEffect(() => {
		if (!user || !user.token) return;

		const fetchSubjects = async () => {
			try {
				const data = await subjectApi.getAllSubjects(user.token);
				setSubjects(data);
			} catch (error) {
				console.error("Error fetching subjects:", error);
			}
		};
		fetchSubjects();
	}, [user]);

	const openAddModal = () => {
		setModalData(null);
		setIsModalOpen(true);
	};

	const openEditModal = (subject) => {
		setModalData(subject);
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
		setModalData(null);
	};

	const handleSave = async (subjectData) => {
		try {
			if (modalData) {
				// Update subject
				await subjectApi.updateSubject(modalData.id, subjectData, user.token);
				setSubjects((prev) =>
					prev.map((sub) =>
						sub.id === modalData.id ? { ...sub, ...subjectData } : sub
					)
				);
			} else {
				// Create subject
				const newSubject = await subjectApi.createSubject(
					subjectData,
					user.token
				);
				setSubjects((prev) => [...prev, newSubject]);
			}
		} catch (error) {
			console.error("Error saving subject:", error);
		} finally {
			closeModal();
		}
	};

	const handleDelete = async (id) => {
		try {
			await subjectApi.deleteSubject(id, user.token);
			setSubjects((prev) => prev.filter((subject) => subject.id !== id));
		} catch (error) {
			console.error("Error deleting subject:", error);
		}
	};

	if (!user || !user.token) {
		return <div>Loading...</div>; // Show a loading state while waiting for the user
	}

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
							<FontAwesomeIcon icon={faBook} /> {subject.gradeLevels.join(", ")}
						</p>
						<div className="actions">
							<button className="edit" onClick={() => openEditModal(subject)}>
								<FontAwesomeIcon icon={faPen} />
							</button>
							<button
								className="delete"
								onClick={() => handleDelete(subject.id)}
							>
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
