import React, { useState, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import useAssessments from "../../../../../hooks/useAssessments";
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
	addAssessmentCallback, // Callback to refresh assessments list after adding
}) => {
	const { user, assignedSubjects } = useAuth();
	const { addAssessment } = useAssessments(user?.token);
	const [departmentNames, setDepartmentNames] = useState([]);
	const [selectedDepartment, setSelectedDepartment] = useState("");
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
					departmentApi.getDepartmentById(id, user?.token)
				);

				const departments = await Promise.all(promises);
				const names = departments.map((dept) => ({
					id: dept.id,
					name: dept.departmentName,
				}));
				setDepartmentNames(names);

				if (names.length > 0) {
					setSelectedDepartment(names[0].id); // Default to the first department
				}
			} catch (error) {
				console.error("Error fetching department names:", error);
			} finally {
				setLoading(false);
			}
		};

		if (departmentIds.length > 0) {
			fetchDepartmentNames();
		}
	}, [departmentIds, user?.token]);

	const handleAddAssessment = async () => {
		if (
			!selectedDepartment ||
			!course_id ||
			!user?.id ||
			!title ||
			!type ||
			!points ||
			!date
		) {
			alert("Please fill in all the fields.");
			return;
		}

		const isoDate = new Date(date).toISOString();
		const formattedDate = isoDate.slice(0, 19) + "+00:00"; // Format date with timezone offset

		const newAssessment = {
			departmentId: selectedDepartment,
			subjectId: course_id,
			teacherId: user.id,
			title,
			type,
			points,
			date: formattedDate,
		};

		// Log the request body for debugging
		// console.log(
		// 	"Debugging Request Body:",
		// 	JSON.stringify(newAssessment, null, 2)
		// );

		// API call is disabled for debugging
		try {
			await addAssessment(newAssessment, user.token); // Add the assessment using the hook
			alert("Assessment created successfully.");
			if (addAssessmentCallback) {
				addAssessmentCallback(); // Refresh assessments list if needed
			}
			// Clear form fields after success
			setTitle("");
			setType("Exam");
			setPoints("");
			setDate(new Date().toISOString().substring(0, 10));
		} catch (err) {
			console.error("Error adding assessment:", err);
			alert("Failed to create assessment. Please try again.");
		}
	};

	return (
		<div className="controls-container">
			{loading ? (
				<p>Loading departments...</p>
			) : (
				<select
					value={selectedDepartment}
					onChange={(e) => setSelectedDepartment(e.target.value)}
				>
					{departmentNames.map((dept) => (
						<option key={dept.id} value={dept.id}>
							{dept.name}
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

			<PrimaryButton title="Add Assessment" onClick={handleAddAssessment} />
		</div>
	);
};

export default Controls;
