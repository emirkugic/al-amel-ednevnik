import React from "react";
import "./Dashboard.css";

const Dashboard = () => {
	const classes = [
		{ name: "Math - Grade 9", students: 30, assessments: 5 },
		{ name: "Science - Grade 10", students: 28, assessments: 3 },
		{ name: "History - Grade 11", students: 25, assessments: 4 },
	];

	const events = [
		{ title: "Math Exam", date: "2024-11-15", time: "10:00 AM" },
		{ title: "Parent-Teacher Meeting", date: "2024-11-18", time: "4:00 PM" },
	];

	const notifications = [
		{ type: "Alert", message: "Grade 9 Math exam grading due tomorrow!" },
		{ type: "Info", message: "New assessment resources available in library." },
	];

	const recentActivities = [
		{
			teacher: "Mr. Smith",
			action: "added a new assessment for Grade 9 Math",
			time: "2 hours ago",
		},
		{
			teacher: "Ms. Johnson",
			action: "graded 20 assignments for Grade 10 Science",
			time: "5 hours ago",
		},
	];

	return (
		// <div className="dashboard">
		// 	<h2 className="dashboard-title">Teacher Dashboard</h2>
		// 	<div className="dashboard-container">
		// 		{/* Quick Stats Section */}
		// 		<section className="dashboard-section stats">
		// 			<h3>Quick Stats</h3>
		// 			<div className="stats-grid">
		// 				<div className="stat-item">
		// 					<h4>Classes</h4>
		// 					<p>{classes.length}</p>
		// 				</div>
		// 				<div className="stat-item">
		// 					<h4>Students</h4>
		// 					<p>{classes.reduce((total, cls) => total + cls.students, 0)}</p>
		// 				</div>
		// 				<div className="stat-item">
		// 					<h4>Assessments</h4>
		// 					<p>
		// 						{classes.reduce((total, cls) => total + cls.assessments, 0)}
		// 					</p>
		// 				</div>
		// 			</div>
		// 		</section>

		// 		{/* Upcoming Events Section */}
		// 		<section className="dashboard-section events">
		// 			<h3>Upcoming Events</h3>
		// 			<ul className="event-list">
		// 				{events.map((event, index) => (
		// 					<li key={index} className="event-item">
		// 						<p className="event-title">{event.title}</p>
		// 						<p>
		// 							{event.date} at {event.time}
		// 						</p>
		// 					</li>
		// 				))}
		// 			</ul>
		// 		</section>

		// 		{/* Notifications Section */}
		// 		<section className="dashboard-section notifications">
		// 			<h3>Notifications</h3>
		// 			<ul className="notification-list">
		// 				{notifications.map((note, index) => (
		// 					<li
		// 						key={index}
		// 						className={`notification-item ${note.type.toLowerCase()}`}
		// 					>
		// 						<p>{note.message}</p>
		// 					</li>
		// 				))}
		// 			</ul>
		// 		</section>

		// 		{/* Recent Activity Section */}
		// 		<section className="dashboard-section recent-activity">
		// 			<h3>Recent Activity</h3>
		// 			<ul className="activity-list">
		// 				{recentActivities.map((activity, index) => (
		// 					<li key={index} className="activity-item">
		// 						<p>
		// 							<strong>{activity.teacher}</strong> {activity.action}
		// 						</p>
		// 						<p className="activity-time">{activity.time}</p>
		// 					</li>
		// 				))}
		// 			</ul>
		// 		</section>

		// 		{/* Class Overview Section */}
		// 		<section className="dashboard-section class-overview">
		// 			<h3>Class Overview</h3>
		// 			<div className="class-list">
		// 				{classes.map((cls, index) => (
		// 					<div key={index} className="class-item">
		// 						<h4>{cls.name}</h4>
		// 						<p>Students: {cls.students}</p>
		// 						<p>Assessments: {cls.assessments}</p>
		// 						<button className="view-class-button">View Class</button>
		// 					</div>
		// 				))}
		// 			</div>
		// 		</section>

		// 		{/* Resources Section */}
		// 		<section className="dashboard-section resources">
		// 			<h3>Resources</h3>
		// 			<button className="resource-button">Access Library</button>
		// 			<button className="resource-button">Upload Document</button>
		// 		</section>
		// 	</div>
		// </div>
		<h1>Coming soon</h1>
	);
};

export default Dashboard;
