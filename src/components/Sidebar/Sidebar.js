import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
	faBars,
	faTimes,
	faChartLine,
	faSignOutAlt,
	faHouse,
	faPeopleGroup,
	faBookOpen,
	faCalendarAlt,
	faBook,
	faChalkboardTeacher,
	faCog,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SidebarButton from "../ui/SidebarButton/SidebarButton";
import useAuth from "../../hooks/useAuth";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import departmentApi from "../../api/departmentApi";
import { useLanguage } from "../../contexts/LanguageContext";
import "./Sidebar.css";
import { useClassTeacher } from "../../hooks";

const DesktopSidebar = () => {
	const location = useLocation();
	const { user, logout } = useAuth();
	const { t, language } = useLanguage();
	const [activeItem, setActiveItem] = useState("");
	const [myCourses, setMyCourses] = useState([]);
	const [myDepartments, setMyDepartments] = useState([]);
	const [loadingCourses, setLoadingCourses] = useState(true);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
	useEffect(() => {
		const handleResize = () => setIsMobile(window.innerWidth <= 768);
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Get the class teacher department id (if applicable)
	const classTeacherDeptId = useClassTeacher();

	// Helper function to get the formatted grade number based on language
	const getFormattedGradeNumber = (num) => {
		const gradeNumberMap = {
			1: "first",
			2: "second",
			3: "third",
			4: "fourth",
			5: "fifth",
			6: "sixth",
			7: "seventh",
			8: "eighth",
			9: "ninth",
			10: "tenth",
			11: "eleventh",
			12: "twelfth",
		};

		// If it's a digit, format it
		if (/^\d+$/.test(num)) {
			const key = gradeNumberMap[num] || "first";
			return t(`sidebar.formatGrade.${key}`);
		}

		// If it's not a simple digit, return as is
		return num;
	};

	// Format the grade title according to the language
	const formatGradeTitle = (deptName) => {
		// Check if the department name is just a number (like "1", "2", "3")
		if (/^\d+$/.test(deptName)) {
			// Plain number - apply ordinal formatting
			if (language === "ar") {
				// Arabic format: "الصف الأول"
				return `${getFormattedGradeNumber(deptName)} ${t("sidebar.grade")}`;
			} else if (language === "bs") {
				// Bosnian format: "1. razred"
				return `${getFormattedGradeNumber(deptName)} ${t("sidebar.grade")}`;
			} else {
				// English format: "1st grade"
				return `${getFormattedGradeNumber(deptName)} ${t("sidebar.grade")}`;
			}
		}
		// Check if it's a number followed by letters (like "1A", "2B")
		else if (/^(\d+)([A-Za-z].*)$/.test(deptName)) {
			const match = deptName.match(/^(\d+)([A-Za-z].*)$/);
			const [_, gradeNum, suffix] = match;

			if (language === "ar") {
				// Arabic format
				return `${suffix} ${getFormattedGradeNumber(gradeNum)} ${t(
					"sidebar.grade"
				)}`;
			} else if (language === "bs") {
				// Bosnian format
				return `${getFormattedGradeNumber(gradeNum)}${suffix} ${t(
					"sidebar.grade"
				)}`;
			} else {
				// English format
				return `${getFormattedGradeNumber(gradeNum)}${suffix} ${t(
					"sidebar.grade"
				)}`;
			}
		}
		// Any other format, just add the word for grade
		else {
			return `${deptName} ${t("sidebar.grade")}`;
		}
	};

	useEffect(() => {
		const fetchMyCourses = async () => {
			if (!user?.id || !user?.token) return;

			try {
				setLoadingCourses(true);
				const teacherData = await teacherApi.getTeacherById(
					user.id,
					user.token
				);

				const subjectPromises = teacherData.assignedSubjects.map((subject) =>
					subjectApi.getSubjectById(subject.subjectId, user.token)
				);

				const resolvedSubjects = await Promise.all(subjectPromises);
				const courseList = resolvedSubjects.map((subject) => ({
					title: subject.name,
					path: `/courses/${subject.id}`,
				}));
				setMyCourses(courseList);

				const uniqueDepartmentIds = [
					...new Set(
						teacherData.assignedSubjects.flatMap(
							(subject) => subject.departmentId
						)
					),
				];

				const departmentPromises = uniqueDepartmentIds.map((id) =>
					departmentApi.getDepartmentById(id, user.token)
				);

				const resolvedDepartments = await Promise.all(departmentPromises);
				const departmentList = resolvedDepartments.map((dept) => ({
					// Format the department name with proper grade ordinals
					title: formatGradeTitle(dept.departmentName),
					path: `/lectures/${dept.id}`,
				}));

				setMyDepartments(departmentList);
			} catch (error) {
				console.error("Error fetching teacher's data:", error);
			} finally {
				setLoadingCourses(false);
			}
		};

		if (user) {
			fetchMyCourses();
		}
	}, [user, t, language]); // Add language dependency to refresh when language changes

	// Build menu items conditionally
	const menuItems = useMemo(() => {
		const items = [];
		// Only include the Dashboard button if we're in mobile view.
		// Use translation for mobile view
		if (isMobile) {
			items.push({
				title: t("sidebar.dashboard"), // Translate Dashboard in mobile menu
				icon: faHouse,
				route: "/",
			});
		}
		// Common items
		items.push(
			{
				title: t("sidebar.grades"),
				icon: faBook,
				route: myCourses,
			},
			{
				title: t("sidebar.lectures"),
				icon: faBookOpen,
				route: myDepartments,
			},
			{
				title: t("sidebar.weeklyReport"),
				icon: faChartLine,
				route: "/logs",
			},
			{
				title: "Att",
				icon: faCalendarAlt,
				route: "/attendance",
			}
		);

		if (user?.role === "Admin" || classTeacherDeptId) {
			items.push({
				title: t("sidebar.myDepartment"),
				icon: faChalkboardTeacher,
				route: "/department",
			});
		}

		// Additional admin-only items
		if (user?.role === "Admin") {
			items.push(
				// {
				// 	title: t("sidebar.schedule"),
				// 	icon: faCalendarAlt,
				// 	route: "/schedule",
				// },
				{
					title: t("sidebar.teachers"),
					icon: faChalkboardTeacher,
					route: "/teachers",
				},
				{
					title: t("sidebar.subjects"),
					icon: faBook,
					route: "/subjects",
				},
				{
					title: t("sidebar.classes"),
					icon: faPeopleGroup,
					route: "/classes",
				},
				{
					title: t("sidebar.parents"),
					icon: faPeopleGroup,
					route: "/parents",
				}
			);
		}

		return items;
	}, [user, myCourses, myDepartments, classTeacherDeptId, isMobile, t]);

	useEffect(() => {
		const activeMenuItem = menuItems.find((item) =>
			Array.isArray(item.route)
				? item.route.some((sub) => sub.path === location.pathname)
				: item.route === location.pathname
		);

		if (activeMenuItem) {
			setActiveItem(activeMenuItem.title);
		}
	}, [location.pathname, menuItems]);

	const handleButtonClick = (title, route) => {
		setActiveItem(title);
		if (window.innerWidth <= 768) {
			setIsSidebarOpen(false);
		}
	};

	const handleLogout = () => {
		logout();
		if (window.innerWidth <= 768) {
			setIsSidebarOpen(false);
		}
	};

	const toggleSidebar = () => {
		setIsSidebarOpen((prev) => !prev);
	};

	return (
		<>
			<div className="topbar">
				<FontAwesomeIcon
					icon={isSidebarOpen ? faTimes : faBars}
					className="hamburger-icon"
					onClick={toggleSidebar}
				/>
				{/* Conditionally translate the topbar title based on viewport */}
				<span className="topbar-title">
					{isMobile ? t("sidebar.dashboard") : "Dashboard"}
				</span>
			</div>
			<div className={`desktop-sidebar ${isSidebarOpen ? "open" : ""}`}>
				<div className="sidebar-menu">
					{menuItems.map((item) => (
						<SidebarButton
							key={item.title}
							title={item.title}
							icon={item.icon}
							route={item.route}
							isActive={activeItem === item.title}
							onClick={() => handleButtonClick(item.title, item.route)}
						/>
					))}
				</div>
				<div className="logout-container">
					<SidebarButton
						title={t("sidebar.settings")}
						icon={faCog}
						route="/settings"
						isActive={activeItem === t("sidebar.settings")}
						onClick={() =>
							handleButtonClick(t("sidebar.settings"), "/settings")
						}
					/>
					<SidebarButton
						title={t("sidebar.logout")}
						icon={faSignOutAlt}
						route="/login"
						isActive={false}
						onClick={handleLogout}
					/>
				</div>
			</div>
		</>
	);
};

export default DesktopSidebar;
