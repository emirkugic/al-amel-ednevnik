// utils/classLogUtils.js
import classLogApi from "./../api/classLogApi";

/**
 * Validate data before creating a class log.
 * @returns {string|null} - Returns an error message or null if valid.
 */
export function validateClassLog({
	lectureTitle,
	date,
	period,
	subjectId,
	absentStudents,
}) {
	if (!lectureTitle) {
		return "Please fill in the lecture title.";
	}
	if (!date || !period || !subjectId) {
		return "Please select date, period, and subject.";
	}
	// Add more checks if needed
	return null;
}

/**
 * Creates a new class log via the classLogApi, merges it into the existing context data.
 * Returns the newly created class log on success.
 */
export async function createNewClassLog({
	classLogData,
	userToken,
	setClassLogs,
	departmentId,
	subjectId,
	absentStudents,
}) {
	try {
		// Call API to create
		const newClassLog = await classLogApi.createClassLogWithAbsences(
			classLogData,
			userToken
		);

		// Merge into ClassLogs context
		setClassLogs((prevLogs) =>
			prevLogs.map((log) =>
				log.departmentId === departmentId
					? {
							...log,
							subjects: log.subjects.map((subj) =>
								subj.subjectId === subjectId
									? {
											...subj,
											classLogs: [
												...subj.classLogs,
												{
													...newClassLog,
													classLogId: newClassLog.id,
													subjectName: subj.name,
													absentStudents: absentStudents.map((s) => ({
														studentId: s.value,
														name: s.label,
													})),
												},
											],
									  }
									: subj
							),
					  }
					: log
			)
		);

		return newClassLog;
	} catch (error) {
		throw error;
	}
}
