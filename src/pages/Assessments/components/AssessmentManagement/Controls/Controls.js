import React, { useState, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import departmentApi from "../../../../../api/departmentApi";
import PrimaryButton from "../../../../../components/ui/PrimaryButton/PrimaryButton";
import "./Controls.css";

const Controls = ({
	course_id,
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
	const { assignedSubjects } = useAuth();
	const [departmentNames, setDepartmentNames] = useState([]);
	const [loading, setLoading] = useState(false);

	// Find the subject based on the course_id
	const currentSubject = assignedSubjects.find(
		(subject) => subject.subjectId === course_id
	);

	const departmentIds = currentSubject ? currentSubject.departmentId : [];

	useEffect(() => {
		const fetchDepartmentNames = async () => {
			try {
				setLoading(true);

				// Fetch names for all department IDs
				const promises = departmentIds.map((id) =>
					departmentApi.getDepartmentById(id)
				);

				const departments = await Promise.all(promises);
				const names = departments.map((dept) => dept.departmentName);
				setDepartmentNames(names);
			} catch (error) {
				console.error("Error fetching department names:", error);
			} finally {
				setLoading(false);
			}
		};

		if (departmentIds.length > 0) {
			fetchDepartmentNames();
		}
	}, [departmentIds]);

	return (
		<div className="controls-container">
			{loading ? (
				<p>Loading departments...</p>
			) : (
				<select
					value={className}
					onChange={(e) => setClassName(e.target.value)}
				>
					{departmentNames.map((name, index) => (
						<option key={index} value={name}>
							{name}
						</option>
					))}
				</select>
			)}

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
