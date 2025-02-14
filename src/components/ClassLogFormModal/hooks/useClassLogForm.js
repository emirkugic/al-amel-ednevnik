import { useState, useEffect, useContext } from "react";
import { ClassLogsContext } from "../../../contexts";
import { useAuth } from "../../../hooks";
import { studentApi } from "../../../api";
import { useNotification } from "../../../contexts/";

import {
	getWorkWeekDates,
	toMidnightUTC,
	validateClassLog,
	createNewClassLog,
} from "../../../utils";

export function useClassLogForm({
	departmentId,
	subjectId,
	disableDayAndPeriodSelection,
	externalDate,
	externalPeriod,
	subjects,
	onSuccess,
	onClose,
}) {
	const { user, assignedSubjects } = useAuth();
	const { setClassLogs } = useContext(ClassLogsContext);

	const { showNotification } = useNotification();

	const weekDays = getWorkWeekDates();
	const [selectedDay, setSelectedDay] = useState(
		weekDays.find((day) => day.value === new Date().toISOString().split("T")[0])
			?.value || ""
	);
	const [classHour, setClassHour] = useState("");

	const [lectureTitle, setLectureTitle] = useState("");
	const [classSequence, setClassSequence] = useState("");
	const [absentStudents, setAbsentStudents] = useState([]);
	const [studentOptions, setStudentOptions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const [teacherSubjects, setTeacherSubjects] = useState([]);
	const [selectedSubject, setSelectedSubject] = useState(subjectId || "");
	const isNewUiMode = disableDayAndPeriodSelection;

	const [notifications, setNotifications] = useState([]);

	const addNotification = (type, description) => {
		const existingNotification = notifications.find(
			(n) => n.type === type && n.description === description
		);

		if (existingNotification) {
			setNotifications((prev) =>
				prev.filter((n) => n.id !== existingNotification.id)
			);

			setTimeout(() => {
				const id = Date.now();
				setNotifications((prev) => [...prev, { id, type, description }]);
				showNotification(description, type);
			}, 100);
		} else {
			const id = Date.now();
			setNotifications((prev) => [...prev, { id, type, description }]);
			showNotification(description, type);
		}
	};

	useEffect(() => {
		if (!departmentId || !user?.token) {
			// addNotification("error", "Error: Missing department ID or user token.");
			return;
		}

		const fetchStudents = async () => {
			try {
				const students = await studentApi.getStudentsByDepartment(
					departmentId,
					user.token
				);
				setStudentOptions(
					students.map((s) => ({
						value: s.id,
						label: `${s.firstName} ${s.lastName}`,
					}))
				);
			} catch (error) {
				// addNotification("error", "Error fetching students. Please try again.");
			}
		};

		fetchStudents();
	}, [departmentId, user]);

	useEffect(() => {
		if (!isNewUiMode || !assignedSubjects || assignedSubjects.length === 0) {
			return;
		}

		const subsInDept = assignedSubjects.filter((as) =>
			as.departmentId.includes(departmentId)
		);

		const teacherSubs = subsInDept.map((as) => {
			const foundSub = subjects.find((s) => s.id === as.subjectId);
			return {
				value: as.subjectId,
				label: foundSub ? foundSub.name : as.subjectId,
			};
		});
		setTeacherSubjects(teacherSubs);

		if (!selectedSubject && teacherSubs.length > 0) {
			setSelectedSubject(teacherSubs[0].value);
		}
	}, [isNewUiMode, assignedSubjects, departmentId, subjects, selectedSubject]);

	const handleSubmit = async () => {
		let finalDate = selectedDay;
		let finalPeriod = classHour;
		let finalSubjectId = subjectId;

		if (isNewUiMode) {
			if (!externalDate || !externalPeriod) {
				// addNotification(
				// 	"error",
				// 	"Error: 'disableDayAndPeriodSelection' is active, but external date/period not provided."
				// );
				return;
			}
			finalDate = externalDate;
			finalPeriod = externalPeriod;
			if (teacherSubjects.length > 0) {
				finalSubjectId = selectedSubject;
			}
		}

		const error = validateClassLog({
			lectureTitle,
			date: finalDate,
			period: finalPeriod,
			subjectId: finalSubjectId,
			absentStudents,
		});
		if (error) {
			addNotification("error", error);
			return;
		}

		const utcDate = toMidnightUTC(finalDate);
		const classLogData = {
			departmentId,
			subjectId: finalSubjectId,
			teacherId: user?.id,
			lectureTitle,
			lectureType: "Lecture",
			classDate: utcDate,
			period: finalPeriod,
			absentStudentIds: absentStudents.map((s) => s.value),
			...(classSequence && { sequence: parseInt(classSequence, 10) }),
		};

		setIsLoading(true);
		try {
			const newClassLog = await createNewClassLog({
				classLogData,
				userToken: user.token,
				setClassLogs,
				departmentId,
				subjectId: finalSubjectId,
				absentStudents,
			});

			if (onSuccess) {
				onSuccess({
					id: newClassLog.id,
					teacherId: newClassLog.teacherId,
					departmentId: departmentId,
					subjectId: newClassLog.subjectId,
					lectureTitle: newClassLog.lectureTitle,
					classDate: newClassLog.classDate,
					period: newClassLog.period,
					sequence: newClassLog.sequence,
				});
			}
			addNotification("success", "Class log created successfully!");
			onClose();
		} catch (err) {
			console.error("Error creating class log:", err);
			if (err.response && err.response.status === 409) {
				addNotification(
					"error",
					`
  لقد تم تسجيل هذا اليوم وهذه الساعة. لا يمكن أن يكون هناك تكرار.
  Ovaj dan i čas su već zabilježeni. Ne može biti duplikata.`
				);
			} else {
				addNotification("error", "Error creating class log. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isNewUiMode,
		weekDays,
		selectedDay,
		setSelectedDay,
		classHour,
		setClassHour,
		lectureTitle,
		setLectureTitle,
		classSequence,
		setClassSequence,
		absentStudents,
		setAbsentStudents,
		studentOptions,
		isLoading,
		teacherSubjects,
		selectedSubject,
		setSelectedSubject,
		notifications,
		handleSubmit,
	};
}
