// Components/ClassesList.js
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChevronDown,
	faChevronUp,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import DepartmentsList from "./DepartmentsList";
import "./ClassesList.css";

const ClassesList = ({
	classes,
	departments,
	teachers,
	expandedClass,
	toggleClassExpansion,
	handleDeleteClass,
	handleUpdateDepartmentTeacher,
	handleDeleteDepartment,
	handleCreateDepartment,
}) => {
	return (
		<div className="class-list">
			{classes.map((cls) => (
				<div key={cls.id} className="class-card">
					<div
						className="class-card-header"
						onClick={() => toggleClassExpansion(cls.id)}
					>
						<h4>
							Grade: {cls.gradeLevel} ({cls.subjects.length} Subjects)
						</h4>
						<FontAwesomeIcon
							icon={expandedClass === cls.id ? faChevronUp : faChevronDown}
							className="expand-icon"
						/>
					</div>
					{expandedClass === cls.id && (
						<DepartmentsList
							classId={cls.id}
							departments={departments}
							teachers={teachers}
							handleUpdateDepartmentTeacher={handleUpdateDepartmentTeacher}
							handleDeleteDepartment={handleDeleteDepartment}
							handleCreateDepartment={handleCreateDepartment}
						/>
					)}
					<button
						className="delete-class-button"
						onClick={() => handleDeleteClass(cls.id)}
					>
						<FontAwesomeIcon icon={faTrash} /> Delete Class
					</button>
				</div>
			))}
		</div>
	);
};

export default ClassesList;
