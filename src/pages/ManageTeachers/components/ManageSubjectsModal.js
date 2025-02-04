import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusCircle, faBook } from "@fortawesome/free-solid-svg-icons";
import "./ManageSubjectsModal.css";

const ManageSubjectsModal = ({
	teacher,
	subjects,
	departments,
	subjectId,
	onSubjectChange,
	departmentSelection,
	onDepartmentCheck,
	onAddSubject,
	onClose,
	onRemoveSubject,
}) => {
	// Helper functions
	const getSubjectName = (subId) => {
		const sub = subjects.find((s) => s.id === subId);
		return sub ? sub.name : subId;
	};

	const getDepartmentNames = (depIds) => {
		const names = depIds.map((id) => {
			const found = departments.find((d) => d.id === id);
			return found ? found.departmentName : id;
		});
		return names.join(", ");
	};

	return (
		<div className="modal-overlay" onClick={onClose}>
			<div
				className="modal-content modal-subject"
				onClick={(e) => e.stopPropagation()}
			>
				<h3>
					Manage Subjects for {teacher.firstName} {teacher.lastName}
				</h3>
				<div className="assigned-subjects-list">
					<h4>Currently Assigned Subjects:</h4>
					{teacher.assignedSubjects && teacher.assignedSubjects.length > 0 ? (
						<ul>
							{teacher.assignedSubjects.map((as) => {
								const subjectName = getSubjectName(as.subjectId);
								const deptNames = getDepartmentNames(as.departmentId);
								return (
									<li
										key={`${as.subjectId}-${as.departmentId.join("-")}`}
										className="assigned-subject-item"
									>
										<FontAwesomeIcon icon={faBook} />{" "}
										<strong>{subjectName}</strong> —{" "}
										<span className="dept-info">{deptNames}</span>
										<button
											className="remove-subject-btn"
											onClick={() => onRemoveSubject(as.subjectId)}
										>
											<FontAwesomeIcon icon={faMinusCircle} />
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<p>No subjects assigned yet.</p>
					)}
				</div>
				<div className="add-subject-form">
					<h4>Add New Subject:</h4>
					<div className="form-group">
						<label>Select Subject</label>
						<select
							value={subjectId}
							onChange={(e) => onSubjectChange(e.target.value)}
						>
							<option value="">-- Select Subject --</option>
							{subjects.map((sub) => (
								<option key={sub.id} value={sub.id}>
									{sub.name}
								</option>
							))}
						</select>
					</div>
					<div className="form-group">
						<label>Departments</label>
						<div className="departments-grid">
							{departments.map((dep) => (
								<label key={dep.id} className="dept-checkbox">
									<input
										type="checkbox"
										value={dep.id}
										checked={departmentSelection.includes(dep.id)}
										onChange={() => onDepartmentCheck(dep.id)}
									/>
									{dep.departmentName}
								</label>
							))}
						</div>
					</div>
					<button className="btn primary-btn" onClick={onAddSubject}>
						Add Subject
					</button>
				</div>
				<div className="modal-actions">
					<button className="btn secondary-btn" onClick={onClose}>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default ManageSubjectsModal;
