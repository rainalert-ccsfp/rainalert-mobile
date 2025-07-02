"use client"

import { useContext, useState } from "react"
import { View, StyleSheet, Text, TouchableOpacity, FlatList } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"
import { AlertContext } from "../context/AlertContext"
import FloodMap from "../components/FloodMap"

const TrackEmergencyScreen = () => {
  const { theme } = useContext(ThemeContext)
  const { emergencyVehicles } = useContext(AlertContext)
  const [showList, setShowList] = useState(true)
  const [trackedVehicleId, setTrackedVehicleId] = useState<string | null>(null)

  const handleTrackVehicle = (vehicleId: string) => {
    setTrackedVehicleId(vehicleId)
    setShowList(false)
  }

  const toggleView = () => {
    setShowList((prev) => !prev)
    if (!showList) {
      // When switching from map to list, untrack the vehicle
      setTrackedVehicleId(null)
    }
  }

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "rescue 1":
        return "boat"
      case "rescue 2":
        return "car"
      case "rescue 3":
        return "medkit"
      default:
        return "car"
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Emergency Vehicles</Text>
        <TouchableOpacity
          style={[
            styles.viewToggle,
            {
              backgroundColor: theme.colors.primary + "20",
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={toggleView}
        >
          <Ionicons name={showList ? "map" : "list"} size={18} color={theme.colors.primary} />
          <Text style={[styles.viewToggleText, { color: theme.colors.primary }]}>
            {showList ? "View Map" : "View List"}
          </Text>
        </TouchableOpacity>
      </View>

      {showList ? (
        <FlatList
          data={emergencyVehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[styles.vehicleCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            >
              <View style={[styles.vehicleIconContainer, { backgroundColor: theme.colors.primary + "20" }]}>
                <Ionicons name={getVehicleIcon(item.type)} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={[styles.vehicleType, { color: theme.colors.text }]}>{item.type}</Text>
                <Text style={[styles.vehicleId, { color: theme.colors.text + "80" }]}>ID: {item.id}</Text>
              </View>
              <TouchableOpacity
                style={[styles.trackButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleTrackVehicle(item.id)}
              >
                <Text style={styles.trackButtonText}>Track</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car" size={60} color={theme.colors.primary} />
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>No emergency vehicles available</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.mapContainer}>
          <FloodMap showEmergencyVehicles={true} trackedVehicleId={trackedVehicleId} />
          <View style={styles.mapOverlay}>
            <Text style={[styles.vehicleCount, { backgroundColor: theme.colors.card }]}>
              {emergencyVehicles.length} Vehicles Active
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  viewToggleText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
  },
  vehicleCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  vehicleIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 16,
  },
  vehicleType: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  vehicleId: {
    fontSize: 14,
  },
  trackButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  trackButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  mapOverlay: {
    position: "absolute",
    top: 16,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  vehicleCount: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    fontWeight: "500",
  },
})

export default TrackEmergencyScreen
