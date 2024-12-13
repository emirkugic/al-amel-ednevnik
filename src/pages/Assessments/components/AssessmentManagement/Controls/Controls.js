import React from "react";
import PrimaryButton from "../../../../../components/ui/PrimaryButton/PrimaryButton";
import "./Controls.css";

const Controls = ({
	grades,
	assessmentTypes,
	className,
	setClassName,
	title,
	setTitle,
	type,
	setType,
	points,
	setPoints,
	date,
	setDate,
	totalPoints,
	addAssessment,
}) => {
	return (
		<div className="controls-container">
			<select value={className} onChange={(e) => setClassName(e.target.value)}>
				{grades.map((grade) => (
					<option key={grade} value={grade}>
						{grade}
					</option>
				))}
			</select>

			<input
				type="text"
				placeholder="Title"
				value={title}
				onChange={(e) => setTitle(e.target.value)}
			/>

			<select value={type} onChange={(e) => setType(e.target.value)}>
				{assessmentTypes.map((t) => (
					<option key={t} value={t}>
						{t}
					</option>
				))}
			</select>

			<input
				type="number"
				placeholder="Points"
				value={points}
				onChange={(e) => setPoints(e.target.value)}
				max="100"
			/>

			<input
				type="date"
				value={date}
				onChange={(e) => setDate(e.target.value)}
			/>

			<span className="controls-total-points">
				Used: <strong>{totalPoints} / 100</strong>
			</span>

			<PrimaryButton title="Add Assessment" onClick={addAssessment} />
		</div>
	);
};

export default Controls;
