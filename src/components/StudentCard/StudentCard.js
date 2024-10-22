import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChartLine,
	faCalendarAlt,
	faEnvelope,
	faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./StudentCard.css";

const StudentCard = ({
	name,
	id,
	className,
	gpa,
	attendance,
	grade,
	imageUrl,
	onShowGrades,
}) => {
	return (
		<div className="student-card">
			<div className="student-card-details">
				<div className="profile-image">
					<img src={imageUrl} alt="Profile" className="profile-pic" />
				</div>

				<div className="student-info">
					<div className="student-name-container">
						<h3 className="student-name">{name}</h3>
					</div>
					<p className="student-id">ID: {id}</p>
					<div className="student-meta">
						<p>
							<FontAwesomeIcon icon={faChartLine} className="meta-icon" /> GPA:{" "}
							{gpa}
						</p>
						<p>
							<FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" />{" "}
							{attendance} Attendance
						</p>
					</div>
				</div>

				<div className="grade-label">
					<span className="grade-badge">{grade}</span>
				</div>
			</div>

			<div className="student-card-actions">
				<button className="action-btn email-btn">
					<FontAwesomeIcon icon={faEnvelope} className="button-icon" /> Email
				</button>
				<button
					className="action-btn grades-btn"
					onClick={() => onShowGrades({ name, id, imageUrl })}
				>
					<FontAwesomeIcon icon={faFileAlt} className="button-icon" /> Grades
				</button>
			</div>
		</div>
	);
};

export default StudentCard;
