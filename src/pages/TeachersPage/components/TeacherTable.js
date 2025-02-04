import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrash, faBook } from "@fortawesome/free-solid-svg-icons";
import "./TeacherTable.css";

const TeacherTable = ({
	teachers,
	searchTerm,
	onEditTeacher,
	onDeleteTeacher,
	onManageSubjects,
	getSubjectName,
	getDepartmentNames,
}) => {
	const filteredTeachers = teachers.filter((t) => {
		const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
		return fullName.includes(searchTerm.toLowerCase());
	});

	return (
		<table className="teacher-table">
			<thead>
				<tr>
					<th>Name</th>
					<th>Email</th>
					<th>Subjects Assigned</th>
					<th>Actions</th>
				</tr>
			</thead>
			<tbody>
				{filteredTeachers.map((teacher) => (
					<tr key={teacher.id}>
						<td>
							{teacher.firstName} {teacher.lastName}{" "}
							{teacher.isAdmin && <span className="admin-badge">Admin</span>}
						</td>
						<td>{teacher.email}</td>
						<td style={{ width: "35%" }}>
							{teacher.assignedSubjects &&
							teacher.assignedSubjects.length > 0 ? (
								<ul className="assigned-subjects-list-compact">
									{teacher.assignedSubjects.map((as) => {
										const subjectName = getSubjectName(as.subjectId);
										const deptNames = getDepartmentNames(as.departmentId);
										return (
											<li key={`${as.subjectId}-${as.departmentId.join("-")}`}>
												<FontAwesomeIcon icon={faBook} className="icon-small" />
												<strong>{subjectName}</strong> —{" "}
												<span className="dept-info">{deptNames}</span>
											</li>
										);
									})}
								</ul>
							) : (
								<span style={{ color: "#999" }}>No subjects</span>
							)}
						</td>
						<td>
							<button
								className="btn small-btn info-btn"
								onClick={() => onManageSubjects(teacher)}
							>
								Manage Subjects
							</button>
							<button
								className="btn small-btn edit-btn"
								onClick={() => onEditTeacher(teacher)}
							>
								<FontAwesomeIcon icon={faPen} />
							</button>
							<button
								className="btn small-btn delete-btn"
								onClick={() => onDeleteTeacher(teacher.id)}
							>
								<FontAwesomeIcon icon={faTrash} />
							</button>
						</td>
					</tr>
				))}
				{filteredTeachers.length === 0 && (
					<tr>
						<td colSpan="4" style={{ textAlign: "center", color: "#999" }}>
							No teachers found.
						</td>
					</tr>
				)}
			</tbody>
		</table>
	);
};

export default TeacherTable;
