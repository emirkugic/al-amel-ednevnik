import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faGraduationCap,
	faChartLine,
	faCalendarAlt,
	faEnvelope,
	faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import "./StudentCard.css";

const StudentCard = () => {
	return (
		<div className="student-card">
			{/* Profile and Main Details */}
			<div className="student-card-details">
				{/* Profile Image */}
				<div className="profile-image">
					<img
						src={`${process.env.PUBLIC_URL}/alamel_logo.png`}
						alt="Profile"
						className="profile-pic"
					/>
				</div>

				{/* Student Info */}
				<div className="student-info">
					<div className="student-name-container">
						<h3 className="student-name">Allah Dz S</h3>
					</div>
					<p className="student-id">ID: STU001</p>
					<div className="student-meta">
						<p>
							<FontAwesomeIcon icon={faGraduationCap} className="meta-icon" />{" "}
							Class X-A
						</p>
						<p>
							<FontAwesomeIcon icon={faChartLine} className="meta-icon" /> GPA:
							3.8
						</p>
						<p>
							<FontAwesomeIcon icon={faCalendarAlt} className="meta-icon" /> 95%
							Attendance
						</p>
					</div>
				</div>

				{/* Grade Label */}
				<div className="grade-label">
					<span className="grade-badge">10th Grade</span>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="student-card-actions">
				<button className="action-btn email-btn">
					<FontAwesomeIcon icon={faEnvelope} className="button-icon" /> Email
				</button>
				<button className="action-btn grades-btn">
					<FontAwesomeIcon icon={faFileAlt} className="button-icon" /> Grades
				</button>
			</div>
		</div>
	);
};

export default StudentCard;
