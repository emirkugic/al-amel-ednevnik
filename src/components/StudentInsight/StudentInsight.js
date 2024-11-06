import React from "react";
import "./StudentInsight.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faFileExport } from "@fortawesome/free-solid-svg-icons";

const StudentInsight = () => {
	const students = [
		{
			id: 1,
			name: "Alice Johnson",
			email: "alice.j@school.edu",
			phone: "123-456-7890",
			attendance: "95%",
			grade: "8.5/10",
		},
		{
			id: 2,
			name: "Bob Smith",
			email: "bob.s@school.edu",
			phone: "123-456-7891",
			attendance: "88%",
			grade: "7.0/10",
		},
		{
			id: 3,
			name: "Carol Williams",
			email: "carol.w@school.edu",
			phone: "123-456-7892",
			attendance: "92%",
			grade: "9.0/10",
		},
		{
			id: 4,
			name: "David Brown",
			email: "david.b@school.edu",
			phone: "123-456-7893",
			attendance: "84%",
			grade: "6.5/10",
		},
		{
			id: 5,
			name: "Emma Davis",
			email: "emma.d@school.edu",
			phone: "123-456-7894",
			attendance: "91%",
			grade: "9.5/10",
		},
		{
			id: 6,
			name: "Franklin Harris",
			email: "frank.h@school.edu",
			phone: "123-456-7895",
			attendance: "89%",
			grade: "7.8/10",
		},
		{
			id: 7,
			name: "Grace Lee",
			email: "grace.l@school.edu",
			phone: "123-456-7896",
			attendance: "94%",
			grade: "8.9/10",
		},
		{
			id: 8,
			name: "Henry Thompson",
			email: "henry.t@school.edu",
			phone: "123-456-7897",
			attendance: "87%",
			grade: "7.4/10",
		},
		{
			id: 9,
			name: "Irene Wilson",
			email: "irene.w@school.edu",
			phone: "123-456-7898",
			attendance: "90%",
			grade: "8.1/10",
		},
		{
			id: 10,
			name: "Jackie Taylor",
			email: "jackie.t@school.edu",
			phone: "123-456-7899",
			attendance: "93%",
			grade: "9.0/10",
		},
	];

	return (
		<div className="student-insight">
			<h2>Class 12 Overview</h2>
			<p className="academic-year">Academic Year 2024-2025</p>

			<div className="overview-cards">
				<div className="card">
					<span>Total Students</span>
					<h3>{students.length}</h3>
				</div>
				<div className="card">
					<span>Average Grade</span>
					<h3>8.2</h3>
				</div>
				<div className="card">
					<span>Average Attendance</span>
					<h3>91.7%</h3>
				</div>
				<div className="card">
					<span>Active Students</span>
					<h3>{students.length}</h3>
				</div>
			</div>

			<div className="search-controls">
				<input type="text" placeholder="Search students..." />
				<div className="buttons">
					<button className="manage-grades">Manage Grades</button>
					<button className="add-student">
						<FontAwesomeIcon icon={faUserPlus} /> Add Student
					</button>
					<button className="export">
						<FontAwesomeIcon icon={faFileExport} /> Export
					</button>
				</div>
			</div>

			<table className="student-table">
				<thead>
					<tr>
						<th>Student</th>
						<th>Contact</th>
						<th>Attendance</th>
						<th>Grade</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{students.map((student) => (
						<tr key={student.id}>
							<td>
								<div className="student-info">
									<div className="student-avatar">
										{/* Placeholder avatar */}
										<span>{student.name[0]}</span>
									</div>
									<div>
										<div>{student.name}</div>
										<div className="student-id">ID: {student.id}</div>
									</div>
								</div>
							</td>
							<td>
								<div>{student.email}</div>
								<div>{student.phone}</div>
							</td>
							<td className="attendance">{student.attendance}</td>
							<td className="grade">{student.grade}</td>
							<td>
								<button className="view-details">View Details</button>
								<button className="contact">Contact</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default StudentInsight;
