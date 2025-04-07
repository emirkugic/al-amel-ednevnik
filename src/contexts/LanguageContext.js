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

	// Set language attribute but DON'T change document direction for Arabic
	useEffect(() => {
		// Only set the language attribute, don't change the direction
		document.documentElement.lang = language;

		// Remove any RTL settings that might have been applied
		document.documentElement.dir = "ltr";
		document.body.classList.remove("rtl");
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
		return key;
	};

	return (
		<LanguageContext.Provider value={{ language, changeLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => useContext(LanguageContext);
