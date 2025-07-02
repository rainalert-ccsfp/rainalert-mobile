"use client"

import { useContext } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"
import type { FloodAlert, AlertLevel } from "../context/AlertContext"

type AlertCardProps = {
  alert: FloodAlert
  onPress?: () => void
}

const AlertCard = ({ alert, onPress }: AlertCardProps) => {
  const { theme } = useContext(ThemeContext)

  const getAlertColor = (level: AlertLevel) => {
    switch (level) {
      case "caution":
        return theme.colors.caution
      case "moderate":
        return theme.colors.moderate
      case "severe":
        return theme.colors.severe
      default:
        return theme.colors.primary
    }
  }

  const getAlertIcon = (level: AlertLevel) => {
    switch (level) {
      case "caution":
        return "alert-circle-outline"
      case "moderate":
        return "warning-outline"
      case "severe":
        return "warning"
      default:
        return "information-circle-outline"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Map string levels to color-coded shadows
  const getShadowColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "danger":
        return "#FFCDD2"; // light red
      case "warning":
        return "#FFF9C4"; // yellow
      case "critical":
        return "#B71C1C"; // dark red
      default:
        return theme.colors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderLeftColor: getAlertColor(alert.level as AlertLevel),
          borderRadius: theme.borderRadius.md,
          shadowColor: getShadowColor(alert.level), // color-coded shadow
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={getAlertIcon(alert.level)} size={24} color={getAlertColor(alert.level)} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{alert.title}</Text>
        <Text style={[styles.description, { color: theme.colors.text }]} numberOfLines={2}>
          {alert.description}
        </Text>
        <Text style={[styles.time, { color: theme.colors.text }]}>{formatTime(alert.timestamp)}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: "center",
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  time: {
    fontSize: 12,
    opacity: 0.7,
    alignSelf: "flex-end",
  },
})

export default AlertCard
