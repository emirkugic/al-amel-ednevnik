import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
	faChartLine,
	faCog,
	faQuestionCircle,
	faSignOutAlt,
	faHouse,
	faPeopleGroup,
	faClock,
	faBookOpen,
	faBook,
	faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import DesktopSidebarButton from "../ui/DesktopSidebarButton/DesktopSidebarButton";
import useAuth from "../../hooks/useAuth";
import teacherApi from "../../api/teacherApi";
import departmentApi from "../../api/departmentApi";
import "./DesktopSidebar.css";

const DesktopSidebar = () => {
	const location = useLocation();
	const { user, logout } = useAuth();
	const [activeItem, setActiveItem] = useState("");
	const [myCourses, setMyCourses] = useState([]);
	const [myDepartments, setMyDepartments] = useState([]);
	const [loadingDepartments, setLoadingDepartments] = useState(true);

	// Fetch teacher's assigned subjects and departments
	useEffect(() => {
		const fetchMyCoursesAndDepartments = async () => {
			try {
				if (!user?.id || !user?.token) {
					console.log("User ID or token is missing:", user);
					return;
				}

				console.log(
					"Fetching courses and departments for teacher ID:",
					user.id
				);

				// Fetch teacher data
				const teacherData = await teacherApi.getTeacherById(
					user.id,
					user.token
				);
				console.log("Fetched teacher data:", teacherData);

				// Fetch departments for assigned subjects
				const departmentPromises = teacherData.assignedSubjects.flatMap(
					(subject) =>
						subject.departmentId.map((deptId) =>
							departmentApi.getDepartmentById(deptId, user.token)
						)
				);

				const resolvedDepartments = await Promise.all(departmentPromises);
				console.log("Fetched departments for teacher:", resolvedDepartments);

				// Map departments to the sidebar route format
				const departmentList = resolvedDepartments.map((department) => ({
					title: department.departmentName,
					path: `/lectures/${department.id}`,
				}));

				setMyDepartments(departmentList);
			} catch (error) {
				console.error(
					"Error fetching teacher's courses or departments:",
					error
				);
			} finally {
				setLoadingDepartments(false);
			}
		};

		fetchMyCoursesAndDepartments();
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
			{ title: "Attendance", icon: faClock, route: "/attendance" },
			{ title: "Grades", icon: faChartLine, route: "/grades" },
			{
				title: "Lectures",
				icon: faBookOpen,
				route: myDepartments,
			},
			{ title: "Settings", icon: faCog, route: "/settings" },
			{ title: "Help", icon: faQuestionCircle, route: "/help" },
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

	const handleButtonClick = (title) => {
		setActiveItem(title);
	};

	const handleLogout = () => {
		logout();
	};

	return (
		<div className="desktop-sidebar">
			<div className="sidebar-menu">
				{menuItems.map((item) => (
					<DesktopSidebarButton
						key={item.title}
						title={item.title}
						icon={item.icon}
						route={item.route}
						isActive={activeItem === item.title}
						onClick={() => handleButtonClick(item.title)}
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
	);
};

export default DesktopSidebar;
