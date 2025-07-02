"use client"

import { createContext, useState, useEffect, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useColorScheme, Appearance } from "react-native"

// Define the theme colors
const theme = {
  colors: {
    primary: "#2196F3", // Bright blue
    secondary: "#42A5F5", // Medium blue
    accent: "#1976D2", // Medium-dark blue
    background: "#E3F2FD", // Very light blue
    card: "#BBDEFB", // Light blue
    text: "#0D47A1", // Dark blue
    border: "#90CAF9", // Light blue
    notification: "#FF4757",
    // Alert levels
    caution: "#FFEB3B", // Yellow
    moderate: "#FF9800", // Orange
    severe: "#F44336", // Red
    // Water effects
    water: "rgba(33, 150, 243, 0.2)", // Blue with transparency
    waterDark: "rgba(25, 118, 210, 0.3)", // Medium blue with transparency
    buttonText: "#FFFFFF", // Added for button text
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
}

export type ThemeType = "white" | "blue" | "lightBlue"

type ThemeContextType = {
  theme: typeof theme
  themeType: ThemeType
  setThemeType: (themeType: ThemeType) => void
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: theme,
  themeType: "blue",
  setThemeType: () => {},
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>("blue")

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = (await AsyncStorage.getItem("theme")) as ThemeType | null
        if (storedTheme) {
          setThemeType(storedTheme)
        }
      } catch (error) {
        console.log("Error loading theme:", error)
      }
    }

    loadTheme()
  }, [])

  useEffect(() => {
    const saveTheme = async (theme: ThemeType) => {
      try {
        await AsyncStorage.setItem("theme", theme)
      } catch (error) {
        console.log("Error saving theme:", error)
      }
    }

    saveTheme(themeType)
  }, [themeType])

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeType,
        setThemeType,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
