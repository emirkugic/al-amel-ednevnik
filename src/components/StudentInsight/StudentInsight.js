import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUserPlus,
	faFileExport,
	faEllipsisV,
} from "@fortawesome/free-solid-svg-icons";
import CreateStudentModal from "../CreateStudentModal/CreateStudentModal"; // Import the modal component
import "./StudentInsight.css";

const StudentInsight = ({ token, departments, handleCreateStudent }) => {
	const students = [
		{
			id: 1,
			name: "Alice Johnson",
			email: "alice.j@school.edu",
			phone: "123-456-7890",
			attendance: "95%",
			grade: "8.5/10",
		},
		// Other student data...
	];

	const [openMenuId, setOpenMenuId] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal

	const toggleMenu = (id) => {
		setOpenMenuId((prevId) => (prevId === id ? null : id));
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
	};

	return (
		<div className="student-insight">
			<h2>Class 12 Overview</h2>
			<p className="academic-year">Academic Year 2024-2025</p>

			<div className="overview-cards">
				<div className="card">
					<span>Total Students</span>
					<h3>{students.length}</h3>
				</div>
				<div className="card">
					<span>Average Grade</span>
					<h3>8.2</h3>
				</div>
				<div className="card">
					<span>Average Attendance</span>
					<h3>91.7%</h3>
				</div>
				<div className="card">
					<span>Active Students</span>
					<h3>{students.length}</h3>
				</div>
			</div>

			<div className="search-controls">
				<input type="text" placeholder="Search students..." />
				<div className="buttons">
					<button className="manage-grades">Manage Grades</button>
					<button
						className="add-student"
						onClick={() => setIsModalOpen(true)} // Open modal on click
					>
						<FontAwesomeIcon icon={faUserPlus} /> Add Student
					</button>
					<button className="export">
						<FontAwesomeIcon icon={faFileExport} /> Export
					</button>
				</div>
			</div>

			<div className="student-list-container">
				<table className="student-table">
					<thead>
						<tr>
							<th>Student</th>
							<th>Contact</th>
							<th>Attendance</th>
							<th>Grade</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{students.map((student) => (
							<tr key={student.id}>
								<td>
									<div className="student-info">
										<div className="student-avatar">
											<span>{student.name[0]}</span>
										</div>
										<div>
											<div>{student.name}</div>
											<div className="student-id">ID: {student.id}</div>
										</div>
									</div>
								</td>
								<td>
									<div>{student.email}</div>
									<div>{student.phone}</div>
								</td>
								<td className="attendance">{student.attendance}</td>
								<td className="grade">{student.grade}</td>
								<td>
									<div className="action-menu">
										<button
											className="menu-button"
											onClick={() => toggleMenu(student.id)}
										>
											<FontAwesomeIcon icon={faEllipsisV} />
										</button>
										{openMenuId === student.id && (
											<div className="dropdown-menu">
												<button
													onClick={() =>
														alert(`Viewing details for ${student.name}`)
													}
												>
													View Details
												</button>
												<button
													onClick={() => alert(`Contacting ${student.name}`)}
												>
													Contact
												</button>
												<button
													onClick={() => alert(`Editing ${student.name}`)}
												>
													Edit
												</button>
												<button
													onClick={() => alert(`Deleting ${student.name}`)}
												>
													Delete
												</button>
											</div>
										)}
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Render the CreateStudentModal */}
			<CreateStudentModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				token={token}
				departments={departments}
				handleCreateStudent={handleCreateStudent}
			/>
		</div>
	);
};

export default StudentInsight;
