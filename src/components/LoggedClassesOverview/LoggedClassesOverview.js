import React, { useState, useEffect, useContext } from "react";
import "./LoggedClassesOverview.css";
import ClassLogFormModal from "../ClassLogFormModal/ClassLogFormModal";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import useAuth from "../../hooks/useAuth";
import { ClassLogsContext } from "../../contexts/ClassLogsContext";
import classLogApi from "../../api/classLogApi";
import Controls from "./Controls";
import DataTable from "./DataTable";
import Pagination from "./Pagination";

const LoggedClassesOverview = ({ departmentId }) => {
	const { user } = useAuth();
	const { classLogs, loading, error, setClassLogs } =
		useContext(ClassLogsContext);
	const [searchQuery, setSearchQuery] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [sortOrder, setSortOrder] = useState("desc");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedSubject, setSelectedSubject] = useState("");
	const [subjects, setSubjects] = useState([]);
	const logsPerPage = 10;

	useEffect(() => {
		const fetchSubjects = async () => {
			if (!user?.id || !user?.token) return;

			try {
				const teacherData = await teacherApi.getTeacherById(
					user.id,
					user.token
				);

				const filteredSubjects = teacherData.assignedSubjects
					.filter((subject) => subject.departmentId.includes(departmentId))
					.map((subject) => subject.subjectId);

				const subjectPromises = filteredSubjects.map((id) =>
					subjectApi.getSubjectById(id, user.token)
				);

				const resolvedSubjects = await Promise.all(subjectPromises);

				const subjectsList = resolvedSubjects.map((subject) => ({
					id: subject.id,
					name: subject.name,
				}));

				setSubjects(subjectsList);

				// Automatically select the first subject
				if (subjectsList.length > 0) {
					setSelectedSubject(subjectsList[0].id);
				}
			} catch (error) {
				console.error("Error fetching subjects:", error);
			}
		};

		fetchSubjects();
	}, [user, departmentId]);

	const departmentLogs = classLogs.find(
		(log) => log.departmentId === departmentId
	);

	const filteredLogs =
		departmentLogs?.subjects
			.filter((subject) => subject.subjectId === selectedSubject)
			.flatMap((subject) =>
				subject.classLogs.map((log) => ({
					...log,
					subject: subject.subjectName,
					sequence: log.sequence || 1,
				}))
			)
			.filter((log) => {
				const matchesSearch =
					log.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
					log.lectureTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
					log.absentStudents.some((student) =>
						student.name.toLowerCase().includes(searchQuery.toLowerCase())
					);
				return matchesSearch;
			}) || [];

	const sortedLogs = filteredLogs.sort((a, b) => {
		const dateA = new Date(a.classDate);
		const dateB = new Date(b.classDate);
		return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
	});

	const indexOfLastLog = currentPage * logsPerPage;
	const indexOfFirstLog = indexOfLastLog - logsPerPage;
	const currentLogs = sortedLogs.slice(indexOfFirstLog, indexOfLastLog);
	const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

	const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);
	const toggleSortOrder = () =>
		setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
	const closeModal = () => setIsModalOpen(false);

	const handleLogClass = () => {
		if (!selectedSubject) {
			alert("No subject selected. Cannot open modal.");
			return;
		}
		setIsModalOpen(true);
	};

	const handleDeleteLog = async (logId) => {
		if (!window.confirm("Are you sure you want to delete this log?")) return;

		try {
			await classLogApi.deleteClassLog(logId, user.token);
			setClassLogs((prevLogs) =>
				prevLogs.map((log) =>
					log.departmentId === departmentId
						? {
								...log,
								subjects: log.subjects.map((subject) =>
									subject.subjectId === selectedSubject
										? {
												...subject,
												classLogs: subject.classLogs.filter(
													(classLog) => classLog.classLogId !== logId
												),
										  }
										: subject
								),
						  }
						: log
				)
			);
		} catch (error) {
			console.error("Error deleting class log:", error);
			alert("Failed to delete class log. Please try again.");
		}
	};

	const selectedSubjectName = subjects.find(
		(subject) => subject.id === selectedSubject
	)?.name;

	return (
		<div className="logged-classes-overview">
			<h2>Class Logs for {selectedSubjectName || "Loading..."}</h2>
			<p>Track and manage your class sessions</p>
			{loading && <p>Loading class logs...</p>}
			{error && <p>Error: {error}</p>}
			{!loading && !error && (
				<>
					<Controls
						subjects={subjects}
						selectedSubject={selectedSubject}
						setSelectedSubject={setSelectedSubject}
						searchQuery={searchQuery}
						setSearchQuery={setSearchQuery}
						sortOrder={sortOrder}
						toggleSortOrder={toggleSortOrder}
						handleLogClass={handleLogClass}
					/>

					<DataTable
						currentLogs={currentLogs}
						handleDeleteLog={handleDeleteLog}
					/>

					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						handlePageChange={handlePageChange}
						indexOfFirstLog={indexOfFirstLog}
						indexOfLastLog={indexOfLastLog}
						filteredLogsLength={filteredLogs.length}
					/>

					{isModalOpen && (
						<ClassLogFormModal
							onClose={closeModal}
							departmentId={departmentId}
							subjectId={selectedSubject}
						/>
					)}
				</>
			)}
		</div>
	);
};

export default LoggedClassesOverview;
