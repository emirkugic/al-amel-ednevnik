import React, { useEffect, useState } from "react";
import "./DepartmentPage.css";
import useAuth from "../../hooks/useAuth";
import useClassLogsByDepartment from "../../hooks/useClassLogsByDepartment"; // New hook

const DepartmentPage = () => {
	const { user } = useAuth();
	const departmentId = "673b98de6d216a12b56d0c2b";

	// Using the new hook
	const {
		classLogs,
		loading: classLogsLoading,
		error: classLogsError,
	} = useClassLogsByDepartment(user, departmentId);

	const [students, setStudents] = useState([]);

	useEffect(() => {
		const fetchStudents = async () => {
			try {
				const response = await fetch(
					`http://localhost:5155/api/Student/department/${departmentId}`,
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${user?.token}`,
							Accept: "*/*",
						},
					}
				);
				if (response.ok) {
					const data = await response.json();
					setStudents(data);
				} else {
					console.error("Failed to fetch students:", response.statusText);
				}
			} catch (error) {
				console.error("Error fetching students:", error);
			}
		};

		if (user?.token) {
			fetchStudents();
		}
	}, [user?.token, departmentId]);

	if (!user?.token) {
		return <p>Please log in or wait while we load your data...</p>;
	}

	return (
		<div className="department-page">
			<h1>Department Overview</h1>

			{/* Class Logs Section */}
			<section className="class-logs-section">
				<h2>Class Logs</h2>

				{classLogsLoading && <p>Loading class logs...</p>}
				{classLogsError && <p>Error: {classLogsError}</p>}

				{!classLogsLoading && !classLogsError && (
					<>
						{Object.keys(classLogs).length > 0 ? (
							Object.entries(classLogs).map(([subject, logs]) => (
								<div key={subject} className="subject-block">
									<h3>{subject}</h3>
									<table>
										<thead>
											<tr>
												<th>Date</th>
												<th>Period</th>
												<th>Lecture Title</th>
												<th>Ordinal Number</th>
												<th>Absent Students</th>
											</tr>
										</thead>
										<tbody>
											{logs.map((log) => (
												<tr key={log.classLog.id}>
													<td>
														{new Date(
															log.classLog.classDate
														).toLocaleDateString()}
													</td>
													<td>{log.classLog.period}</td>
													<td>{log.classLog.lectureTitle}</td>
													<td>{log.classLog.sequence}</td>
													<td>
														{log.absentStudents.length > 0
															? log.absentStudents.join(", ")
															: "None"}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							))
						) : (
							<p>No class logs available.</p>
						)}
					</>
				)}
			</section>

			{/* Students Section */}
			<section className="students-section">
				<h2>Students</h2>
				{students.length > 0 ? (
					<table>
						<thead>
							<tr>
								<th>Name</th>
								<th>Date of Birth</th>
								<th>Country</th>
								<th>Citizenship</th>
								<th>Place of Birth</th>
							</tr>
						</thead>
						<tbody>
							{students.map((student) => (
								<tr key={student.id}>
									<td>{`${student.firstName} ${student.lastName}`}</td>
									<td>{new Date(student.dateOfBirth).toLocaleDateString()}</td>
									<td>{student.country}</td>
									<td>{student.citizenship}</td>
									<td>{student.placeOfBirth}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<p>No students available.</p>
				)}
			</section>
		</div>
	);
};

export default DepartmentPage;
