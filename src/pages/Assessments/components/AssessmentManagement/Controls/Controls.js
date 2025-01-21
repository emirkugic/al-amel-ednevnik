import React, { useState, useEffect } from "react";
import useAuth from "../../../../../hooks/useAuth";
import departmentApi from "../../../../../api/departmentApi";
import PrimaryButton from "../../../../../components/ui/PrimaryButton/PrimaryButton";
import "./Controls.css";

const Controls = ({
	course_id,
	grades,
	assessmentTypes,
	title,
	setTitle,
	type,
	setType,
	points,
	setPoints,
	date,
	setDate,
	addAssessmentCallback,

	// Brought in from parent now
	selectedDepartment,
	setSelectedDepartment,
}) => {
	const { user, assignedSubjects } = useAuth();
	const [departmentNames, setDepartmentNames] = useState([]);
	const [loading, setLoading] = useState(false);

	// Find assigned subject by course_id
	const currentSubject = assignedSubjects.find(
		(subject) => subject.subjectId === course_id
	);
	const departmentIds = currentSubject ? currentSubject.departmentId : [];

	// Fetch department names
	useEffect(() => {
		const fetchDepartmentNames = async () => {
			try {
				setLoading(true);
				const promises = departmentIds.map((id) =>
					departmentApi.getDepartmentById(id, user?.token)
				);
				const departments = await Promise.all(promises);
				const names = departments.map((dept) => ({
					id: dept.id,
					name: dept.departmentName,
				}));
				setDepartmentNames(names);

				// If parent's department is empty and we have at least one dept, set it
				if (!selectedDepartment && names.length > 0) {
					setSelectedDepartment(names[0].id);
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
	}, [
		departmentIds,
		course_id,
		user?.token,
		selectedDepartment,
		setSelectedDepartment,
	]);

	// Handle adding new assessment
	const handleAddAssessment = async () => {
		if (
			!selectedDepartment ||
			!course_id ||
			!title ||
			!type ||
			!points ||
			!date
		) {
			alert("Please fill in all fields.");
			return;
		}

		const formattedDate = new Date(date).toISOString();
		const newAssessment = {
			departmentId: selectedDepartment,
			subjectId: course_id,
			teacherId: user.id,
			title,
			type,
			points,
			date: formattedDate,
		};

		try {
			await addAssessmentCallback(newAssessment);
			setTitle("");
			setType("Exam");
			setPoints("");
			setDate(new Date().toISOString().substring(0, 10));
		} catch (err) {
			console.error("Error adding assessment:", err);
		}
	};

	return (
		<div className="controls-container">
			{/* Department Dropdown */}
			{loading ? (
				<p>Loading departments...</p>
			) : (
				<select
					// Use the parent's selectedDepartment
					value={selectedDepartment || ""}
					onChange={(e) => {
						setSelectedDepartment(e.target.value);
					}}
				>
					<option value="" disabled>
						-- Select Department --
					</option>
					{departmentNames.map((dept) => (
						<option key={dept.id} value={dept.id}>
							{dept.name}
						</option>
					))}
				</select>
			)}

			{/* Input Fields */}
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

			{/* Add Assessment Button */}
			<PrimaryButton title="Add Assessment" onClick={handleAddAssessment} />
		</div>
	);
};

export default Controls;
