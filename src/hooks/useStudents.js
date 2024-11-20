import { useState, useEffect } from "react";
import studentApi from "../api/studentApi";

const useStudents = (token) => {
	const [students, setStudents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!token) return;

		const fetchStudents = async () => {
			try {
				setLoading(true);
				const data = await studentApi.getAllStudents(token);
				setStudents(data);
				setError(null);
			} catch (err) {
				console.error("Error fetching students:", err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchStudents();
	}, [token]);

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

	return { students, loading, error, addStudent, updateStudent, deleteStudent };
};

export default useStudents;
