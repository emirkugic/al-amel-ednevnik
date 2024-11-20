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

	// Fetch teacher's assigned subjects
	useEffect(() => {
		const fetchMyCourses = async () => {
			try {
				if (!user?.id || !user?.token) {
					// console.log("User ID or token is missing:", user);
					return;
				}

				// console.log("Fetching courses for teacher ID:", user.id);
				setLoadingCourses(true);

				// Fetch teacher data
				const teacherData = await teacherApi.getTeacherById(
					user.id,
					user.token
				);
				// console.log("Fetched teacher data:", teacherData);

				// Fetch subject details for assigned subjects
				const subjectPromises = teacherData.assignedSubjects.map((subject) =>
					subjectApi.getSubjectById(subject.subjectId, user.token)
				);

				const resolvedSubjects = await Promise.all(subjectPromises);
				// console.log("Fetched subjects for teacher:", resolvedSubjects);

				// Map subjects to the sidebar route format
				const courseList = resolvedSubjects.map((subject) => ({
					title: subject.name,
					path: `/courses/${subject.id}`,
				}));

				// console.log("Formatted course list:", courseList);
				setMyCourses(courseList);

				// Fetch departments for Lectures
				const departmentIds = teacherData.assignedSubjects
					.flatMap((subject) => subject.departmentId)
					.filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

				const departmentPromises = departmentIds.map((id) =>
					departmentApi.getAllDepartments(user.token)
				);

				const resolvedDepartments = await Promise.all(departmentPromises);
				const uniqueDepartments = resolvedDepartments
					.flat()
					.filter(
						(dept, index, self) =>
							index === self.findIndex((d) => d.id === dept.id)
					);

				// console.log("Fetched departments for teacher:", uniqueDepartments);

				const departmentList = uniqueDepartments.map((dept) => ({
					title: dept.departmentName,
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
			// { title: "Attendance", icon: faClock, route: "/attendance" },
			{ title: "Grades", icon: faChartLine, route: "/grades" },
			{
				title: "Lectures",
				icon: faBookOpen,
				route: myDepartments,
			},
			// { title: "Settings", icon: faCog, route: "/settings" },
			// { title: "Help", icon: faQuestionCircle, route: "/help" },
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
