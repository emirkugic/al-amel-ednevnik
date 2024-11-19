// Components/DepartmentsList.js
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./DepartmentsList.css";

const DepartmentsList = ({
	classId,
	departments,
	teachers,
	handleUpdateDepartmentTeacher,
	handleDeleteDepartment,
	handleCreateDepartment,
}) => {
	const [newDepartmentName, setNewDepartmentName] = useState("");
	const [selectedClassTeacher, setSelectedClassTeacher] = useState("");

	const classDepartments = departments.filter(
		(dept) => dept.classId === classId
	);

	const handleAddDepartment = () => {
		if (!newDepartmentName) {
			alert("Department name is required!");
			return;
		}
		handleCreateDepartment(classId, newDepartmentName, selectedClassTeacher);
		setNewDepartmentName("");
		setSelectedClassTeacher("");
	};

	return (
		<div className="class-departments">
			<h5>Departments</h5>
			<ul>
				{classDepartments.map((dept) => (
					<li key={dept.id}>
						{dept.departmentName}{" "}
						{dept.classTeacherId && (
							<span>
								(Teacher:{" "}
								{teachers.find((t) => t.id === dept.classTeacherId)
									?.firstName || "Unknown"}
								)
							</span>
						)}
						<select
							value={dept.classTeacherId || ""}
							onChange={(e) =>
								handleUpdateDepartmentTeacher(dept.id, e.target.value)
							}
						>
							<option value="">No Teacher</option>
							{teachers.map((teacher) => (
								<option key={teacher.id} value={teacher.id}>
									{teacher.firstName} {teacher.lastName}
								</option>
							))}
						</select>
						<button
							className="delete-button"
							onClick={() => handleDeleteDepartment(dept.id)}
						>
							<FontAwesomeIcon icon={faTrash} />
						</button>
					</li>
				))}
			</ul>
			<div className="form-row">
				<input
					type="text"
					placeholder="New Department Name"
					value={newDepartmentName}
					onChange={(e) => setNewDepartmentName(e.target.value)}
				/>
				<select
					value={selectedClassTeacher}
					onChange={(e) => setSelectedClassTeacher(e.target.value)}
				>
					<option value="">No Teacher</option>
					{teachers.map((teacher) => (
						<option key={teacher.id} value={teacher.id}>
							{teacher.firstName} {teacher.lastName}
						</option>
					))}
				</select>
				<button
					className="create-department-button"
					onClick={handleAddDepartment}
				>
					Add Department
				</button>
			</div>
		</div>
	);
};

export default DepartmentsList;
