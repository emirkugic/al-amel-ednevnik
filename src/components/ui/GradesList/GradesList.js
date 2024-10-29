import React, { useState } from "react";
import "./GradesList.css";

const GradesList = ({ subjects }) => {
	const [activeIndex, setActiveIndex] = useState(null);

	const toggleAccordion = (index) => {
		setActiveIndex(activeIndex === index ? null : index);
	};

	const groupByMonth = (grades) => {
		const grouped = {};
		grades.forEach(({ date, exam, grade }) => {
			const month = new Date(date).toLocaleString("default", {
				month: "long",
				year: "numeric",
			});
			if (!grouped[month]) grouped[month] = [];
			grouped[month].push({ exam, grade, date });
		});
		return grouped;
	};

	return (
		<div className="grades-list">
			{subjects.map((subject, index) => (
				<div className="grades-item" key={index}>
					<div
						className={`grades-header ${activeIndex === index ? "active" : ""}`}
						onClick={() => toggleAccordion(index)}
					>
						<h3>{subject.subject}</h3>
						<p>{subject.teacher}</p>
					</div>
					<div
						className={`grades-content ${activeIndex === index ? "show" : ""}`}
					>
						{Object.entries(groupByMonth(subject.details)).map(
							([month, grades], idx) => (
								<div key={idx}>
									<div className="month-header">{month}</div>
									<ul className="grades-list">
										{grades.map((gradeDetail, i) => (
											<li className="grade-item" key={i}>
												<span>{gradeDetail.exam}</span>
												<span>{gradeDetail.grade} points</span>
											</li>
										))}
									</ul>
								</div>
							)
						)}
					</div>
				</div>
			))}
		</div>
	);
};

export default GradesList;
