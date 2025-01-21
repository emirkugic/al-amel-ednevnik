import React, { useState } from "react";
import "./AssessmentsAccordionList.css";

const AssessmentsAccordionList = ({
	monthsToDisplay,
	groupedAssessments,
	openGradesModal,
	onUpdate, // new
	onDelete, // new
}) => {
	const [expandedMonths, setExpandedMonths] = useState(() => {
		const initialState = {};
		monthsToDisplay.forEach((m) => {
			initialState[m] = true; // all open by default
		});
		return initialState;
	});

	// Track which assessment is in "edit mode"
	const [editAssessmentId, setEditAssessmentId] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [editPoints, setEditPoints] = useState("");

	const toggleMonth = (month) => {
		setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
	};

	// Start editing a specific assessment
	const handleEditClick = (assessment, e) => {
		// Prevent opening the grades modal
		e.stopPropagation();
		setEditAssessmentId(assessment.id);
		setEditTitle(assessment.title);
		setEditPoints(assessment.points);
	};

	// Cancel editing
	const handleCancelEdit = (e) => {
		e.stopPropagation();
		setEditAssessmentId(null);
		setEditTitle("");
		setEditPoints("");
	};

	// Save the edited changes
	const handleSaveEdit = (originalAssessment, e) => {
		e.stopPropagation();

		const updated = {
			...originalAssessment,
			title: editTitle,
			points: editPoints,
		};

		onUpdate(originalAssessment.id, updated);
		setEditAssessmentId(null);
		setEditTitle("");
		setEditPoints("");
	};

	// Delete the assessment
	const handleDelete = (id, e) => {
		e.stopPropagation();
		onDelete(id);
	};

	return (
		<div className="ram-content">
			{monthsToDisplay.map((month) => {
				const monthAssessments = groupedAssessments[month] || [];
				const totalMonthPoints = monthAssessments.reduce(
					(sum, a) => sum + parseInt(a.points, 10),
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
							style={{ maxHeight: isExpanded ? "600px" : "0" }}
						>
							<div className="ram-accordion-content">
								{monthAssessments.length === 0 ? (
									<div className="ram-empty-month">
										No assessments this month
									</div>
								) : (
									<div className="ram-assessment-list">
										{monthAssessments.map((assessment, idx) => {
											// If this item is in edit mode:
											const isEditing = assessment.id === editAssessmentId;

											if (isEditing) {
												return (
													<div
														key={assessment.id}
														className="ram-assessment-item"
														style={{ backgroundColor: "#f8f8f8" }}
														onClick={(e) => e.stopPropagation()} // disable the modal open
													>
														<div className="ram-edit-fields">
															<input
																type="text"
																value={editTitle}
																onChange={(e) => setEditTitle(e.target.value)}
																style={{ marginRight: "10px" }}
															/>
															<input
																type="number"
																value={editPoints}
																onChange={(e) => setEditPoints(e.target.value)}
																style={{ width: "60px" }}
															/>

															<button
																style={{ marginLeft: "10px" }}
																onClick={(e) => handleSaveEdit(assessment, e)}
															>
																Save
															</button>
															<button
																onClick={handleCancelEdit}
																style={{ marginLeft: "5px" }}
															>
																Cancel
															</button>
														</div>
													</div>
												);
											} else {
												// Normal (non-edit) display
												return (
													<div
														key={assessment.id}
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

														<div className="ram-assessment-actions">
															<button
																onClick={(e) => handleEditClick(assessment, e)}
																style={{ marginRight: "6px" }}
															>
																Edit
															</button>
															<button
																onClick={(e) => handleDelete(assessment.id, e)}
																style={{ color: "red" }}
															>
																Delete
															</button>
														</div>
													</div>
												);
											}
										})}
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
