import { useMemo } from "react";
import { useAuth } from "../hooks";

const useClassTeacher = () => {
	const { assignedSubjects } = useAuth();
	const classTeacherSubjectId = "6738f38cfc4963c76fefc3f2";

	const departmentId = useMemo(() => {
		if (!assignedSubjects || !assignedSubjects.length) return null;

		const classSubject = assignedSubjects.find(
			(subject) => subject.subjectId === classTeacherSubjectId
		);
		if (!classSubject) return null;

		return Array.isArray(classSubject.departmentId)
			? classSubject.departmentId[0] || null
			: classSubject.departmentId;
	}, [assignedSubjects]);

	return departmentId;
};

export default useClassTeacher;
