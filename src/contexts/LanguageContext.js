import React, { createContext, useState, useEffect, useContext } from "react";
import useAuth from "../hooks/useAuth";
import translations from "../translations";

export const LanguageContext = createContext();

const getTranslation = (translations, key, language) => {
	// Default to English if the language doesn't exist
	const langTranslations = translations[language] || translations.en;

	if (!key) return "";

	// Split the key by dots to navigate the nested structure
	const parts = key.split(".");
	let value = langTranslations;

	// Navigate through the nested structure
	for (const part of parts) {
		if (!value || typeof value !== "object") {
			// Fallback to English if the key path doesn't exist in the current language
			value = translations.en;
			for (const p of parts) {
				if (!value || typeof value !== "object" || !(p in value)) {
					return key; // Key not found, return the key itself
				}
				value = value[p];
			}
			return value;
		}

		if (!(part in value)) {
			return key; // Key not found, return the key itself
		}

		value = value[part];
	}

	return value;
};

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

	// Get text in current language with support for nested keys
	const t = (key) => {
		return getTranslation(translations, key, language);
	};

	return (
		<LanguageContext.Provider value={{ language, changeLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
};

export const useLanguage = () => useContext(LanguageContext);
