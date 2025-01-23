import { useState, useEffect } from "react";
import studentApi from "../api/studentApi";

const useStudents = (departmentId, token) => {
	const [students, setStudents] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!departmentId || !token) return;

		const fetchStudentsByDepartment = async () => {
			try {
				setLoading(true);
				const data = await studentApi.getStudentsByDepartment(
					departmentId,
					token
				);
				setStudents(data);
				setError(null);
			} catch (err) {
				setError(err.response?.data?.message || "Failed to fetch students.");
				console.error("Error fetching students:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchStudentsByDepartment();
	}, [departmentId, token]);

	const addStudent = (newStudent) => {
		setStudents((prev) => [...prev, newStudent]);
	};

	const updateStudent = (updatedStudent) => {
		setStudents((prev) =>
			prev.map((student) =>
				student.id === updatedStudent.id ? updatedStudent : student
			)
		);
	};

	const deleteStudent = (id) => {
		setStudents((prev) => prev.filter((student) => student.id !== id));
	};

	return {
		students,
		loading,
		error,
		addStudent,
		updateStudent,
		deleteStudent,
	};
};

export default useStudents;
