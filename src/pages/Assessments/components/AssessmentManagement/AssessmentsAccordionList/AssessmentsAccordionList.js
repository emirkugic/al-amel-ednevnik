import React, { useState } from "react";
import "./AssessmentsAccordionList.css";

const AssessmentsAccordionList = ({
	monthsToDisplay,
	groupedAssessments,
	openGradesModal,
}) => {
	const [expandedMonths, setExpandedMonths] = useState(() => {
		const initialState = {};
		monthsToDisplay.forEach((m) => {
			initialState[m] = true; // all open by default
		});
		return initialState;
	});

	const toggleMonth = (month) => {
		setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
	};

	return (
		<div className="ram-content">
			{monthsToDisplay.map((month) => {
				const monthAssessments = groupedAssessments[month] || [];
				const totalMonthPoints = monthAssessments.reduce(
					(sum, a) => sum + a.points,
					0
				);
				const isExpanded = expandedMonths[month];

				return (
					<div key={month} className="ram-accordion-block">
						<div
							className="ram-accordion-header"
							onClick={() => toggleMonth(month)}
						>
							<h3 className="ram-accordion-title">{month}</h3>
							<div className="ram-accordion-right">
								<span className="ram-accordion-points">
									{totalMonthPoints} pts
								</span>
								<div
									className={`ram-accordion-icon ${
										isExpanded ? "expanded" : ""
									}`}
								>
									▼
								</div>
							</div>
						</div>
						<div
							className="ram-accordion-content-wrapper"
							style={{ maxHeight: isExpanded ? "500px" : "0" }}
						>
							<div className="ram-accordion-content">
								{monthAssessments.length === 0 ? (
									<div className="ram-empty-month">
										No assessments this month
									</div>
								) : (
									<div className="ram-assessment-list">
										{monthAssessments.map((assessment, idx) => (
											<div
												key={idx}
												className="ram-assessment-item"
												onClick={() => openGradesModal(assessment)}
											>
												<div className="ram-assessment-info">
													<h4 className="ram-assessment-title">
														{assessment.title}
													</h4>
													<span className="ram-assessment-type">
														{assessment.type}
													</span>
												</div>
												<div className="ram-assessment-points">
													{assessment.points} pts
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default AssessmentsAccordionList;
