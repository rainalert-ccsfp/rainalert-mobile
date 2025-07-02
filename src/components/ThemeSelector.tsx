"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useContext } from "react"
import { ThemeContext, type ThemeType } from "../context/ThemeContext"

const ThemeSelector = () => {
  const { theme, themeType, setThemeType } = useContext(ThemeContext)

  const themes: { value: ThemeType; label: string; icon: string; color: string }[] = [
    { value: "white", label: "White", icon: "sunny-outline", color: "#FFFFFF" },
    { value: "blue", label: "Blue", icon: "water-outline", color: "#1565C0" },
    { value: "lightBlue", label: "Light Blue", icon: "water", color: "#E3F2FD" },
  ]

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Choose Theme</Text>

      <View style={styles.themesContainer}>
        {themes.map((item) => (
          <TouchableOpacity
            key={item.value}
            style={[
              styles.themeOption,
              {
                backgroundColor: item.color,
                borderColor: themeType === item.value ? theme.colors.primary : "transparent",
              },
            ]}
            onPress={() => setThemeType(item.value)}
          >
            <View style={styles.themeContent}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.value === "white" || item.value === "lightBlue" ? "#1565C0" : "#fff"}
              />
              <Text
                style={[
                  styles.themeLabel,
                  { color: item.value === "white" || item.value === "lightBlue" ? "#1565C0" : "#fff" },
                ]}
              >
                {item.label}
              </Text>
            </View>
            {themeType === item.value && (
              <View style={styles.selectedIndicator}>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={item.value === "white" || item.value === "lightBlue" ? "#1565C0" : "#fff"}
                />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  themesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  themeOption: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    borderWidth: 2,
    position: "relative",
  },
  themeContent: {
    alignItems: "center",
  },
  themeLabel: {
    marginTop: 8,
    fontWeight: "500",
  },
  selectedIndicator: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: 10,
  },
})

export default ThemeSelector
