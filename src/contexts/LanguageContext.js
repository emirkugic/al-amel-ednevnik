import React, { createContext, useState, useEffect, useContext } from "react";
import useAuth from "../hooks/useAuth";
import translations from "../translations";

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
	const { user } = useAuth();
	const [language, setLanguage] = useState("en");

	// Load language preference from localStorage on component mount
	useEffect(() => {
		if (user) {
			// Try to get user-specific language preference
			const savedLanguage = localStorage.getItem(`language_${user.id}`);
			if (savedLanguage) {
				setLanguage(savedLanguage);
			}
		}
	}, [user]);

	// Save language preference to localStorage when it changes
	useEffect(() => {
		if (user) {
			localStorage.setItem(`language_${user.id}`, language);
		}
	}, [language, user]);

	// Add RTL support for Arabic
	useEffect(() => {
		document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
		document.documentElement.lang = language;

		// Apply special CSS class to body for RTL styling
		if (language === "ar") {
			document.body.classList.add("rtl");
		} else {
			document.body.classList.remove("rtl");
		}
	}, [language]);

	// Function to change language
	const changeLanguage = (lang) => {
		if (translations[lang]) {
			setLanguage(lang);
		}
	};

	// Get text in current language
	const t = (key) => {
		if (translations[language] && translations[language][key]) {
			return translations[language][key];
		}
		// Fallback to English
		if (translations.en[key]) {
			return translations.en[key];
		}
		// If key doesn't exist, return the key itself
		return key;
	};

	return (
		<LanguageContext.Provider value={{ language, changeLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => useContext(LanguageContext);
