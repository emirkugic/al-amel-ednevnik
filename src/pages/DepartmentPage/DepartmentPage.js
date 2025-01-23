import React, { useEffect, useState } from "react";
import "./DepartmentPage.css";
import useAuth from "../../hooks/useAuth"; // Assuming useAuth provides the user and token

const DepartmentPage = () => {
	const { user } = useAuth(); // Retrieve the logged-in user's token
	const [classLogs, setClassLogs] = useState({});
	const [students, setStudents] = useState([]);

	// Fetch class logs
	useEffect(() => {
		const fetchClassLogs = async () => {
			try {
				const response = await fetch(
					"http://localhost:5155/api/ClassLog/by-department-grouped-by-subject?departmentId=673b98de6d216a12b56d0c2b",
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${user.token}`, // Include JWT token
							Accept: "*/*",
						},
					}
				);
				if (response.ok) {
					const data = await response.json();
					setClassLogs(data);
				} else {
					console.error("Failed to fetch class logs:", response.statusText);
				}
			} catch (error) {
				console.error("Error fetching class logs:", error);
			}
		};

		fetchClassLogs();
	}, [user.token]);

	// Fetch students
	useEffect(() => {
		const fetchStudents = async () => {
			try {
				const response = await fetch(
					"http://localhost:5155/api/Student/department/673b98de6d216a12b56d0c2b",
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${user.token}`, // Include JWT token
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

		fetchStudents();
	}, [user.token]);

	return (
		<div className="department-page">
			<h1>Department Overview</h1>

			{/* Class Logs Section */}
			<section className="class-logs-section">
				<h2>Class Logs</h2>
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
												{new Date(log.classLog.classDate).toLocaleDateString()}
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
