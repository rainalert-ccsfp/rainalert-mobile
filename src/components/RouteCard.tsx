"use client"

import { useContext } from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"

type RouteCardProps = {
  route: {
    id: string
    name: string
    distance: string
    duration: string
    floodRisk: "low" | "medium" | "high"
  }
  isSelected: boolean
  onSelect: () => void
}

const RouteCard = ({ route, isSelected, onSelect }: RouteCardProps) => {
  const { theme } = useContext(ThemeContext)

  const getFloodRiskColor = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "#4CAF50" // Green
      case "medium":
        return "#FF9800" // Orange
      case "high":
        return "#F44336" // Red
      default:
        return theme.colors.primary
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? `${theme.colors.primary}20` : theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onSelect}
    >
      <View style={styles.routeInfo}>
        <Text style={[styles.routeName, { color: theme.colors.text }]}>{route.name}</Text>
        <View style={styles.routeDetails}>
          <Text style={[styles.routeDetail, { color: theme.colors.text }]}>
            <Ionicons name="time-outline" size={16} /> {route.duration}
          </Text>
          <Text style={[styles.routeDetail, { color: theme.colors.text }]}>
            <Ionicons name="resize-outline" size={16} /> {route.distance}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.floodRiskIndicator,
          {
            backgroundColor: `${getFloodRiskColor(route.floodRisk)}20`,
          },
        ]}
      >
        <Text
          style={[
            styles.floodRiskText,
            {
              color: getFloodRiskColor(route.floodRisk),
            },
          ]}
        >
          {route.floodRisk.charAt(0).toUpperCase() + route.floodRisk.slice(1)} Flood Risk
        </Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  routeInfo: {
    marginBottom: 8,
  },
  routeName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  routeDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeDetail: {
    marginRight: 16,
    fontSize: 14,
  },
  floodRiskIndicator: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  floodRiskText: {
    fontSize: 12,
    fontWeight: "500",
  },
})

export default RouteCard
