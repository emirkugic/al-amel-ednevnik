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
	faBook,
	faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import DesktopSidebarButton from "../ui/DesktopSidebarButton/DesktopSidebarButton";
import useAuth from "../../hooks/useAuth";
import teacherApi from "../../api/teacherApi";
import subjectApi from "../../api/subjectApi";
import departmentApi from "../../api/departmentApi";
import "./DesktopSidebar.css";

const DesktopSidebar = () => {
	const location = useLocation();
	const { user, logout } = useAuth();
	const [activeItem, setActiveItem] = useState("");
	const [myCourses, setMyCourses] = useState([]);
	const [myDepartments, setMyDepartments] = useState([]);
	const [loadingCourses, setLoadingCourses] = useState(true);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		const fetchMyCourses = async () => {
			try {
				if (!user?.id || !user?.token) {
					return;
				}

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
					title: dept.departmentName + " razred",
					path: `/lectures/${dept.id}`,
				}));

				setMyDepartments(departmentList);
			} catch (error) {
				console.error("Error fetching teacher's data:", error);
			} finally {
				setLoadingCourses(false);
			}
		};

		fetchMyCourses();
	}, [user]);

	const menuItems = useMemo(() => {
		const items = [
			{ title: "Dashboard", icon: faHouse, route: "/" },
			{ title: "Students", icon: faPeopleGroup, route: "/students" },
			{
				title: "My Courses",
				icon: faBook,
				route: myCourses,
			},
			{ title: "Grades", icon: faChartLine, route: "/grades" },
			{
				title: "Lectures",
				icon: faBookOpen,
				route: myDepartments,
			},
			{
				title: "My Department",
				icon: faChalkboardTeacher,
				route: "/department/testID",
			},
		];

		if (user?.role === "Admin") {
			items.push(
				{
					title: "Teachers",
					icon: faChalkboardTeacher,
					route: "/teachers",
				},
				{
					title: "Subjects",
					icon: faBook,
					route: "/subjects",
				},
				{
					title: "Classes",
					icon: faPeopleGroup,
					route: "/classes",
				},
				{
					title: "Parents",
					icon: faPeopleGroup,
					route: "/parents",
				}
			);
		}

		return items;
	}, [user, myCourses, myDepartments]);

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
				<span className="topbar-title">Dashboard</span>
			</div>
			<div className={`desktop-sidebar ${isSidebarOpen ? "open" : ""}`}>
				<div className="sidebar-menu">
					{menuItems.map((item) => (
						<DesktopSidebarButton
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
					<DesktopSidebarButton
						title="Logout"
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
