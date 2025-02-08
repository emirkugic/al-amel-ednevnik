import React, { useState, useEffect } from "react";
import useAllClassLogs from "../hooks/useAllClassLogs";
import useDepartments from "../../../hooks/useDepartments";
import useTeachers from "../../../hooks/useTeachers";
import useSubjects from "../../../hooks/useSubjects";
import useAuth from "../../../hooks/useAuth";
import WeeklyLogsControls from "./WeeklyLogsControls";
import ClassLogFormModal from "../../../components/ClassLogFormModal/ClassLogFormModal";
import "./WeeklyLogs.css";

const WeeklyLogs = () => {
	const { user } = useAuth();
	const token = user?.token;

	// 1) Fetch from your hooks
	const {
		classLogs,
		loading: logsLoading,
		error: logsError,
	} = useAllClassLogs(token);
	const {
		departments,
		loading: depsLoading,
		error: depsError,
	} = useDepartments(token);
	const {
		teachers,
		loading: teachersLoading,
		error: teachersError,
	} = useTeachers(token);
	const {
		subjects,
		loading: subjectsLoading,
		error: subjectsError,
	} = useSubjects(token);

	// 2) Local state to store logs we actually display
	const [allLogs, setAllLogs] = useState([]);

	// 3) Fill local logs once they’re loaded
	useEffect(() => {
		if (!logsLoading && classLogs) {
			setAllLogs(classLogs);
		}
	}, [classLogs, logsLoading]);

	// Department & week states
	const [selectedDepartment, setSelectedDepartment] = useState("");
	const [weekOffset, setWeekOffset] = useState(0);

	// For opening/closing the modal when user clicks "Missing"
	const [showModal, setShowModal] = useState(false);

	// Store which date/period was clicked
	const [missingDate, setMissingDate] = useState("");
	const [missingPeriod, setMissingPeriod] = useState("");

	// Detect mobile
	const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth < 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// ----- Build the Monday-based week -----
	const getMonday = (d) => {
		const date = new Date(d);
		const day = date.getDay() || 7;
		if (day !== 1) {
			date.setDate(date.getDate() - day + 1);
		}
		return date;
	};

	const today = new Date();
	const currentMonday = getMonday(today);
	const mondayOffset = new Date(currentMonday);
	mondayOffset.setDate(currentMonday.getDate() + weekOffset * 7);

	// Create an array for Mon–Fri
	const weekdays = [];
	const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	for (let i = 0; i < 5; i++) {
		const dayDate = new Date(mondayOffset);
		dayDate.setDate(mondayOffset.getDate() + i);
		weekdays.push({
			name: dayNames[i],
			date: dayDate,
			dateFormatted: dayDate.toISOString().split("T")[0],
			periodCount: i === 4 ? 5 : 7,
		});
	}

	// Mobile: track selectedDayIndex (0..4)
	const [selectedDayIndex, setSelectedDayIndex] = useState(0);
	const [isFirstLoad, setIsFirstLoad] = useState(true);

	// Default day = "today" if in range
	useEffect(() => {
		if (isFirstLoad && weekdays.length > 0) {
			const todayStr = today.toISOString().split("T")[0];
			const foundIndex = weekdays.findIndex(
				(wd) => wd.dateFormatted === todayStr
			);
			if (foundIndex !== -1) {
				setSelectedDayIndex(foundIndex);
			} else {
				setSelectedDayIndex(0);
			}
			setIsFirstLoad(false);
		}
	}, [weekdays, isFirstLoad, today]);

	useEffect(() => {
		if (selectedDayIndex < 0 || selectedDayIndex > 4) {
			setSelectedDayIndex(0);
		}
	}, [selectedDayIndex]);

	// Filter logs from local state (allLogs) for a given date & period
	const getLogsFor = (dateFormatted, period) => {
		return allLogs.filter((log) => {
			const logDate = new Date(log.classDate).toISOString().split("T")[0];
			return (
				logDate === dateFormatted &&
				Number(log.period) === period &&
				log.departmentId === selectedDepartment
			);
		});
	};

	// Teacher name helper
	const getTeacherName = (teacherId) => {
		const teacher = teachers.find((t) => t.id === teacherId);
		return teacher ? teacher.firstName.split(" ")[0] : teacherId;
	};

	// Controls
	const handleDepartmentChange = (deptId) => setSelectedDepartment(deptId);
	const handlePrevWeek = () => setWeekOffset((prev) => prev - 1);
	const handleNextWeek = () => setWeekOffset((prev) => prev + 1);
	const disableNext = weekOffset >= 0;

	// Initialize department if needed
	useEffect(() => {
		if (!selectedDepartment && departments && departments.length > 0) {
			setSelectedDepartment(departments[0].id);
		}
	}, [departments, selectedDepartment]);

	// Loading & error states
	if (logsLoading || depsLoading || teachersLoading || subjectsLoading) {
		return <div className="loading">Loading weekly logs...</div>;
	}
	if (logsError) {
		return <div className="error">Error (logs): {logsError.message}</div>;
	}
	if (depsError) {
		return (
			<div className="error">Error (departments): {depsError.message}</div>
		);
	}
	if (teachersError) {
		return (
			<div className="error">Error (teachers): {teachersError.message}</div>
		);
	}
	if (subjectsError) {
		return (
			<div className="error">Error (subjects): {subjectsError.message}</div>
		);
	}

	// Decide which days to render (mobile => single day, desktop => all)
	const daysToRender = isMobile ? [weekdays[selectedDayIndex]] : weekdays;

	// Callback for when the new log is successfully created
	const handleNewLogCreated = (newLog) => {
		// Insert the newly created log into local 'allLogs' state
		setAllLogs((prev) => [...prev, newLog]);
	};

	return (
		<div className="weekly-logs">
			<WeeklyLogsControls
				departments={departments}
				selectedDepartment={selectedDepartment}
				onDepartmentChange={handleDepartmentChange}
				isMobile={isMobile}
				weekdays={weekdays}
				selectedDayIndex={selectedDayIndex}
				setSelectedDayIndex={setSelectedDayIndex}
				handlePrevWeek={handlePrevWeek}
				handleNextWeek={handleNextWeek}
				disableNext={disableNext}
				mondayOffset={mondayOffset}
			/>

			<div className="timetable">
				{daysToRender.map((day, idx) => (
					<div className="timetable-row" key={day.dateFormatted || idx}>
						<div className="day-label">
							<div className="day-name">{day.name}</div>
							<div className="date">{day.dateFormatted}</div>
						</div>
						<div className="periods">
							{Array.from({ length: day.periodCount }, (_, periodIndex) => {
								const period = periodIndex + 1;
								const logsForCell = getLogsFor(day.dateFormatted, period);

								return (
									<div
										key={period}
										className={`timetable-cell ${
											logsForCell.length === 0 ? "missing" : ""
										}`}
									>
										<div className="cell-header">
											<span className="period-number">P{period}</span>
											{logsForCell.length > 1 && (
												<span
													className="duplicate-label"
													title={logsForCell
														.map(
															(log) =>
																`Title: ${log.lectureTitle}, Seq: ${
																	log.sequence
																}, Teacher: ${getTeacherName(log.teacherId)}`
														)
														.join("\n")}
												>
													{" - DUPLICATE"}
												</span>
											)}
										</div>

										{logsForCell.length === 0 ? (
											<div
												className="cell-content no-log"
												style={{ cursor: "pointer" }}
												onClick={() => {
													// 1) Store day/period for new UI
													setMissingDate(day.dateFormatted);
													setMissingPeriod(period.toString());
													// 2) Show modal
													setShowModal(true);
												}}
											>
												Missing
											</div>
										) : logsForCell.length === 1 ? (
											<div
												className="cell-content log-entry"
												title={`Seq: ${
													logsForCell[0].sequence
												} | ${getTeacherName(logsForCell[0].teacherId)}`}
											>
												<div className="lecture-title">
													{logsForCell[0].lectureTitle}
												</div>
												<div className="log-details">
													Seq: {logsForCell[0].sequence} |{" "}
													{getTeacherName(logsForCell[0].teacherId)}
												</div>
											</div>
										) : (
											<div
												className="cell-content log-duplicate"
												title={logsForCell
													.map(
														(log) =>
															`Title: ${log.lectureTitle}, Seq: ${
																log.sequence
															}, Teacher: ${getTeacherName(log.teacherId)}`
													)
													.join("\n")}
											>
												<div className="lecture-title">
													{logsForCell[0].lectureTitle}
												</div>
												<div className="log-details">
													Seq: {logsForCell[0].sequence} |{" "}
													{getTeacherName(logsForCell[0].teacherId)}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				))}
			</div>

			{showModal && (
				<ClassLogFormModal
					onClose={() => setShowModal(false)}
					departmentId={selectedDepartment}
					disableDayAndPeriodSelection={true}
					externalDate={missingDate}
					externalPeriod={missingPeriod}
					onSuccess={(newlyCreatedLog) => handleNewLogCreated(newlyCreatedLog)}
				/>
			)}
		</div>
	);
};

export default WeeklyLogs;
