import { useState, useEffect } from "react";
import subjectApi from "../api/subjectApi"; // Ensure this points to your subject API file

const useSubjects = (token) => {
	const [subjects, setSubjects] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!token) return;

		const fetchSubjects = async () => {
			try {
				const data = await subjectApi.getAllSubjects(token);
				setSubjects(data);
			} catch (err) {
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchSubjects();
	}, [token]);

	const getSubjectById = async (id) => {
		if (!token) return null;
		try {
			const subject = await subjectApi.getSubjectById(id, token);
			return subject;
		} catch (err) {
			console.error("Error fetching subject by ID:", err);
			return null;
		}
	};

	return { subjects, loading, error, getSubjectById };
};

export default useSubjects;
