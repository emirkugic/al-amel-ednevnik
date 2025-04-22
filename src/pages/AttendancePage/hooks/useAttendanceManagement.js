// src/hooks/useAttendanceManagement.js
import { useState, useEffect } from "react";

const useAttendanceManagement = (
	absences,
	students,
	departments,
	subjects,
	updateAbsence,
	departmentId,
	loading,
	studentsLoading,
	error
) => {
	// State management
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedFilter, setSelectedFilter] = useState("all");
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [selectedDate, setSelectedDate] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAbsence, setSelectedAbsence] = useState(null);
	const [isSelectMode, setIsSelectMode] = useState(false);
	const [selectedStudents, setSelectedStudents] = useState({});

	// Processed data
	const [absencesByDate, setAbsencesByDate] = useState({});
	const [attendanceData, setAttendanceData] = useState({});
	const [absenceCounts, setAbsenceCounts] = useState({
		total: 0,
		unhandled: 0,
		excused: 0,
		unexcused: 0,
	});

	// Process and organize absences data
	useEffect(() => {
		if (!absences || !students) return;

		// Organize absences by date and count by status
		const byDate = {};
		let totalCount = 0;
		let unhandledCount = 0;
		let excusedCount = 0;
		let unexcusedCount = 0;

		// Process each absence and organize by date
		absences.forEach((absence) => {
			// Convert the date to avoid timezone issues
			const dateObj = new Date(absence.classLog.classDate);
			const date = dateObj.toISOString().split("T")[0];

			// Filter by status if needed
			if (selectedFilter !== "all") {
				if (
					selectedFilter === "unhandled" &&
					absence.absence.isExcused !== null
				)
					return;
				if (selectedFilter === "excused" && absence.absence.isExcused !== true)
					return;
				if (
					selectedFilter === "unexcused" &&
					absence.absence.isExcused !== false
				)
					return;
			}

			// Filter by search term if needed
			if (searchTerm) {
				const term = searchTerm.toLowerCase();
				const studentName = absence.student
					? `${absence.student.firstName} ${absence.student.lastName}`.toLowerCase()
					: "";
				const subjectName = absence.classLog.subjectName
					? absence.classLog.subjectName.toLowerCase()
					: "";
				const reason = absence.absence.reason
					? absence.absence.reason.toLowerCase()
					: "";

				if (
					!studentName.includes(term) &&
					!subjectName.includes(term) &&
					!reason.includes(term)
				) {
					return;
				}
			}

			// Add to date collections
			if (!byDate[date]) {
				byDate[date] = [];
			}
			byDate[date].push(absence);

			// Update counts
			totalCount++;
			if (absence.absence.isExcused === null) {
				unhandledCount++;
			} else if (absence.absence.isExcused) {
				excusedCount++;
			} else {
				unexcusedCount++;
			}
		});

		setAbsencesByDate(byDate);
		setAbsenceCounts({
			total: totalCount,
			unhandled: unhandledCount,
			excused: excusedCount,
			unexcused: unexcusedCount,
		});

		// Set default selected date if not already set
		if (!selectedDate && Object.keys(byDate).length > 0) {
			const today = new Date().toISOString().split("T")[0];

			if (byDate[today]) {
				setSelectedDate(today);
			} else {
				// Find the most recent date with absences
				const dates = Object.keys(byDate).sort();
				const mostRecent = dates[dates.length - 1];
				setSelectedDate(mostRecent);
			}
		}
	}, [absences, selectedFilter, searchTerm, students, selectedDate]);

	// Generate attendance data for selected date
	useEffect(() => {
		if (!selectedDate || !students || studentsLoading) return;

		const data = {};

		// Define periods based on day of week (Mon-Thu: 7 periods, Fri: 5 periods)
		const date = new Date(selectedDate);
		const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
		const isFriday = dayOfWeek === 5;
		const periodsCount = isFriday ? 5 : 7;

		// Initialize data structure for all periods
		for (let period = 1; period <= periodsCount; period++) {
			data[period] = {
				logs: [],
				students: {},
				hasClass: false,
				stats: {
					present: 0,
					absent: 0,
				},
			};
		}

		// Process absences for this date
		if (absencesByDate[selectedDate]) {
			// Group absences by period and class log
			absencesByDate[selectedDate].forEach((absence) => {
				const period = parseInt(absence.classLog.period);
				if (!period || period > periodsCount) return;

				// Add class log if not already added
				const logExists = data[period].logs.some(
					(log) => log.id === absence.classLog.id
				);

				if (!logExists) {
					data[period].logs.push({
						id: absence.classLog.id,
						subjectId: absence.classLog.subjectId,
						subjectName: absence.classLog.subjectName || "Unknown Subject",
						lectureTitle: absence.classLog.lectureTitle,
						teacherId: absence.classLog.teacherId,
						teacherName: absence.classLog.teacherName || "Unknown Teacher",
					});
					data[period].hasClass = true;
				}

				// Add student absence
				if (absence.student) {
					data[period].students[absence.student.id] = {
						id: absence.student.id,
						firstName: absence.student.firstName,
						lastName: absence.student.lastName,
						absenceId: absence.absence.id,
						isExcused: absence.absence.isExcused,
						reason: absence.absence.reason || "",
						isPresent: false,
					};

					// Update stats
					data[period].stats.absent++;
				}
			});
		}

		// Add all students to periods with classes
		for (let period = 1; period <= periodsCount; period++) {
			// Skip periods with no class logged
			if (!data[period].hasClass) continue;

			students.forEach((student) => {
				// If student is not already marked absent, mark as present
				if (!data[period].students[student.id]) {
					data[period].students[student.id] = {
						id: student.id,
						firstName: student.firstName,
						lastName: student.lastName,
						isPresent: true,
					};

					// Update present count
					data[period].stats.present++;
				}
			});
		}

		setAttendanceData(data);
	}, [selectedDate, students, studentsLoading, absencesByDate]);

	// Get department name
	const getDepartmentName = () => {
		if (!departmentId || !departments || !departments.length) return "";
		const department = departments.find((d) => d.id === departmentId);
		return department ? department.departmentName : "";
	};

	// Calendar generation
	const getDaysInMonth = (year, month) => {
		return new Date(year, month + 1, 0).getDate();
	};

	const generateCalendarDays = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = getDaysInMonth(year, month);

		// Get the correct first day of month (adjusting for week starting Monday)
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

		const days = [];

		// Add empty cells for days before the 1st of month
		for (let i = 0; i < offset; i++) {
			days.push({ day: null, date: null });
		}

		// Add days of the month
		for (let day = 1; day <= daysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateString = date.toISOString().split("T")[0];

			// Check if date has absences
			const hasAbsences =
				absencesByDate[dateString] && absencesByDate[dateString].length > 0;

			// Check for unhandled absences
			const hasUnhandled =
				hasAbsences &&
				absencesByDate[dateString].some(
					(absence) => absence.absence.isExcused === null
				);

			const isSelected = dateString === selectedDate;
			const isToday = new Date().toISOString().split("T")[0] === dateString;

			days.push({
				day,
				date: dateString,
				hasAbsences,
				hasUnhandled,
				isSelected,
				isToday,
			});
		}

		return days;
	};

	// Month navigation
	const goToPreviousMonth = () => {
		setCurrentMonth(
			new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
		);
	};

	const goToNextMonth = () => {
		// Don't allow navigating past the current month
		const nextMonth = new Date(
			currentMonth.getFullYear(),
			currentMonth.getMonth() + 1,
			1
		);
		if (nextMonth <= new Date()) {
			setCurrentMonth(nextMonth);
		}
	};

	// Format functions
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	};

	const formatMonthYear = () => {
		return currentMonth.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric",
		});
	};

	// Handle opening excuse modal
	const handleExcuseAbsence = (absence) => {
		setSelectedAbsence(absence);
		setIsModalOpen(true);
	};

	// Handle saving excuse
	const handleSaveExcuse = async (isExcused, reason) => {
		if (!selectedAbsence) return;

		try {
			await updateAbsence(selectedAbsence.absence.id, isExcused, reason);
			setIsModalOpen(false);
		} catch (err) {
			console.error("Error updating absence:", err);
		}
	};

	// Toggle selection mode
	const toggleSelectMode = () => {
		setIsSelectMode(!isSelectMode);
		setSelectedStudents({});
	};

	// Handle student selection
	const handleStudentSelect = (studentId, periodId) => {
		const key = `${studentId}-${periodId}`;
		setSelectedStudents((prev) => ({
			...prev,
			[key]: !prev[key],
		}));
	};

	// Handle filter selection
	const handleFilterSelect = (filter) => {
		setSelectedFilter(filter);
	};

	// Handle batch excuse operations
	const handleBatchExcuse = async (isExcused) => {
		const selectedKeys = Object.keys(selectedStudents).filter(
			(key) => selectedStudents[key]
		);

		if (selectedKeys.length === 0) {
			alert("Please select at least one absence to update.");
			return;
		}

		const reason = isExcused
			? prompt("Enter reason for excusing these absences:")
			: "";

		if (isExcused && !reason) {
			alert("A reason is required for excused absences.");
			return;
		}

		// Process each selected absence
		for (const key of selectedKeys) {
			const [studentId, periodId] = key.split("-");
			const student = attendanceData[periodId].students[studentId];

			if (student && student.absenceId) {
				try {
					await updateAbsence(student.absenceId, isExcused, reason);
				} catch (err) {
					console.error(
						`Error updating absence for ${student.firstName} ${student.lastName}:`,
						err
					);
				}
			}
		}

		// Exit select mode after batch operation
		setIsSelectMode(false);
		setSelectedStudents({});
	};

	// Handle excuse all unhandled absences
	const handleExcuseAllUnhandled = async (isExcused) => {
		// Count unhandled absences for the selected date
		let unhandledCount = 0;
		Object.values(attendanceData).forEach((periodData) => {
			Object.values(periodData.students).forEach((student) => {
				if (!student.isPresent && student.isExcused === null) {
					unhandledCount++;
				}
			});
		});

		if (unhandledCount === 0) {
			alert("There are no unhandled absences to update.");
			return;
		}

		const reason = isExcused
			? prompt(`Enter reason for excusing ${unhandledCount} absences:`)
			: "";

		if (isExcused && !reason) {
			alert("A reason is required for excused absences.");
			return;
		}

		// Process all unhandled absences for this date
		for (const periodId in attendanceData) {
			const periodData = attendanceData[periodId];
			for (const studentId in periodData.students) {
				const student = periodData.students[studentId];
				if (
					!student.isPresent &&
					student.isExcused === null &&
					student.absenceId
				) {
					try {
						await updateAbsence(student.absenceId, isExcused, reason);
					} catch (err) {
						console.error(
							`Error updating absence for ${student.firstName} ${student.lastName}:`,
							err
						);
					}
				}
			}
		}
	};

	// Sort students alphabetically by last name
	const sortStudents = (students) => {
		return Object.values(students).sort((a, b) => {
			if (a.lastName === b.lastName) {
				return a.firstName.localeCompare(b.firstName);
			}
			return a.lastName.localeCompare(b.lastName);
		});
	};

	// Count selected students
	const countSelectedStudents = () => {
		return Object.values(selectedStudents).filter((selected) => selected)
			.length;
	};

	return {
		// State
		searchTerm,
		selectedFilter,
		currentMonth,
		selectedDate,
		isModalOpen,
		selectedAbsence,
		isSelectMode,
		selectedStudents,
		absencesByDate,
		attendanceData,
		absenceCounts,
		loading,
		error,

		// Methods
		setSearchTerm,
		setSelectedDate,
		getDepartmentName,
		generateCalendarDays,
		goToPreviousMonth,
		goToNextMonth,
		formatDate,
		formatMonthYear,
		handleExcuseAbsence,
		handleSaveExcuse,
		toggleSelectMode,
		handleStudentSelect,
		handleFilterSelect,
		handleBatchExcuse,
		handleExcuseAllUnhandled,
		sortStudents,
		countSelectedStudents,
		setIsModalOpen,
	};
};

export default useAttendanceManagement;
