import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { useClassTeacher } from "../../hooks";
import departmentApi from "../../api/departmentApi";
import { useLanguage } from "../../contexts/LanguageContext";
// import Grades from "./DepartmentPage/ClassGradesPage/Grades";
// import Absences from "../DepartmentPage/ClassGradesPage/Absences";
import Absences from "./components/Absences";
import Grades from "./Grades/Grades";
import "./DepartmentPage.css";

const DepartmentPage = () => {
	const { departmentId } = useParams(); // Get the department ID from URL params
	const { user } = useAuth();
	const { t } = useLanguage();
	const [department, setDepartment] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("grades"); // Default to grades tab

	// Get the class teacher's department ID (if applicable)
	const classTeacherDeptId = useClassTeacher();

	useEffect(() => {
		const fetchDepartmentData = async () => {
			setLoading(true);
			try {
				// If departmentId is provided in URL, use it
				// Otherwise, for admin with no specific ID, show a department selection page
				// For class teachers, use their assigned department
				const idToFetch =
					departmentId || (user?.role !== "Admin" ? classTeacherDeptId : null);

				if (!idToFetch) {
					setLoading(false);
					return;
				}

				const data = await departmentApi.getDepartmentById(
					idToFetch,
					user.token
				);
				setDepartment(data);
			} catch (err) {
				console.error("Error fetching department:", err);
				setError(err.message || "Failed to load department data");
			} finally {
				setLoading(false);
			}
		};

		if (user?.token) {
			fetchDepartmentData();
		}
	}, [departmentId, user, classTeacherDeptId]);

	if (loading) {
		return (
			<div className="loading-container">
				<p>Loading...</p>
			</div>
		);
	}

	if (error) {
		return <div className="error-message">{error}</div>;
	}

	// For admin with no specific department selected and no departmentId in URL
	if (!department && user?.role === "Admin" && !departmentId) {
		return (
			<div className="department-page">
				<h1>{t("department.allDepartments")}</h1>
				<p>{t("department.selectDepartment")}</p>
			</div>
		);
	}

	// If department is null but we have departmentId, render components anyway
	// This allows components to fetch their own data using the departmentId
	const deptId = departmentId || classTeacherDeptId;

	return (
		<div className="department-page">
			{department ? (
				<h1>
					{department.departmentName} {t("department.details")}
				</h1>
			) : (
				<h1>{t("department.details")}</h1>
			)}

			{/* Tab navigation */}
			<div className="department-tabs">
				<button
					className={`tab-button ${activeTab === "grades" ? "active" : ""}`}
					onClick={() => setActiveTab("grades")}
				>
					{t("department.grades")}
				</button>
				<button
					className={`tab-button ${activeTab === "attendance" ? "active" : ""}`}
					onClick={() => setActiveTab("attendance")}
				>
					{t("department.attendance")}
				</button>
			</div>

			{/* Tab content */}
			<div className="tab-content">
				{activeTab === "grades" && (
					<div className="grades-container">
						{/* Pass the department ID directly to Grades component */}
						<Grades departmentId={deptId} />
					</div>
				)}

				{activeTab === "attendance" && (
					<div className="attendance-container">
						{/* Pass the department ID directly to Absences component */}
						<Absences departmentId={deptId} />
					</div>
				)}
			</div>
		</div>
	);
};

export default DepartmentPage;
