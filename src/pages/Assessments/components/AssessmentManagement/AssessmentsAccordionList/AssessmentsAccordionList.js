import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import "./AssessmentsAccordionList.css";

const AssessmentsAccordionList = ({
	monthsToDisplay,
	groupedAssessments,
	openGradesModal,
	onUpdate,
	onDelete,
}) => {
	const [expandedMonths, setExpandedMonths] = useState(() => {
		const initialState = {};
		monthsToDisplay.forEach((m) => {
			initialState[m] = true;
		});
		return initialState;
	});

	const [editAssessmentId, setEditAssessmentId] = useState(null);
	const [editTitle, setEditTitle] = useState("");
	const [editPoints, setEditPoints] = useState("");

	const toggleMonth = (month) => {
		setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
	};

	const handleEditClick = (assessment, e) => {
		e.stopPropagation();
		setEditAssessmentId(assessment.id);
		setEditTitle(assessment.title);
		setEditPoints(assessment.points);
	};

	const handleCancelEdit = (e) => {
		e.stopPropagation();
		setEditAssessmentId(null);
		setEditTitle("");
		setEditPoints("");
	};

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
										{monthAssessments.map((assessment) => {
											const isEditing = assessment.id === editAssessmentId;

											if (isEditing) {
												return (
													<div
														key={assessment.id}
														className="ram-assessment-item ram-edit-mode"
														onClick={(e) => e.stopPropagation()}
													>
														<input
															type="text"
															value={editTitle}
															onChange={(e) => setEditTitle(e.target.value)}
															className="ram-edit-input"
															placeholder="Title"
														/>
														<input
															type="number"
															value={editPoints}
															onChange={(e) => setEditPoints(e.target.value)}
															className="ram-edit-input"
															placeholder="Points"
														/>
														<button
															className="ram-btn ram-save-btn"
															onClick={(e) => handleSaveEdit(assessment, e)}
														>
															Save
														</button>
														<button
															className="ram-btn ram-cancel-btn"
															onClick={handleCancelEdit}
														>
															Cancel
														</button>
													</div>
												);
											} else {
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
															<FontAwesomeIcon
																icon={faEdit}
																className="ram-action-icon"
																onClick={(e) => handleEditClick(assessment, e)}
															/>
															<FontAwesomeIcon
																icon={faTrash}
																className="ram-action-icon ram-delete-icon"
																onClick={(e) => handleDelete(assessment.id, e)}
															/>
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
