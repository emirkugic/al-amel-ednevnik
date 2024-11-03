import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentItem.css";

// widget for displaying an assessment item in a list
const AssessmentItem = ({
	name,
	type,
	points,
	gradeLevel,
	createdAt,
	onDelete,
}) => {
	return (
		<div className="assessment-item">
			<div className="assessment-info">
				<p>
					<strong>{name}</strong>
				</p>
				<p>{points} Points</p>
				<p>Created on: {createdAt}</p>
			</div>
			<button className="delete-btn" onClick={onDelete}>
				<FontAwesomeIcon icon={faTrash} className="trash-icon" />
			</button>
		</div>
	);
};

export default AssessmentItem;
