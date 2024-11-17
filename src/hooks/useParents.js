import { useState, useEffect } from "react";
import parentApi from "../api/parentApi"; 

const useParents = (token) => {
	const [parents, setParents] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!token) return;

		const fetchParents = async () => {
			try {
				setLoading(true);
				const data = await parentApi.getAllParents(token);
				setParents(data);
				setError(null);
			} catch (err) {
				console.error("Error fetching parents:", err);
				setError(err);
			} finally {
				setLoading(false);
			}
		};

		fetchParents();
	}, [token]);

	const addParent = (newParent) => {
		setParents((prev) => [...prev, newParent]);
	};

	const updateParent = (updatedParent) => {
		setParents((prev) =>
			prev.map((parent) =>
				parent.id === updatedParent.id ? updatedParent : parent
			)
		);
	};

	const deleteParent = (id) => {
		setParents((prev) => prev.filter((parent) => parent.id !== id));
	};

	return { parents, loading, error, addParent, updateParent, deleteParent };
};

export default useParents;
