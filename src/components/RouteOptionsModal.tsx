"use client"

import { useContext } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"
import RouteCard from "./RouteCard"

type RouteOptionsModalProps = {
  visible: boolean
  routes: {
    id: string
    name: string
    distance: string
    duration: string
    floodRisk: "low" | "medium" | "high"
  }[]
  selectedRouteId: string | null
  onSelectRoute: (routeId: string) => void
  onClose: () => void
}

const RouteOptionsModal = ({ visible, routes, selectedRouteId, onSelectRoute, onClose }: RouteOptionsModalProps) => {
  const { theme } = useContext(ThemeContext)

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Available Routes</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.routesList}>
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                isSelected={selectedRouteId === route.id}
                onSelect={() => onSelectRoute(route.id)}
              />
            ))}
          </ScrollView>

          <TouchableOpacity
            style={[styles.showSelectedRouteButton, { backgroundColor: theme.colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.showSelectedRouteButtonText}>Show Selected Route</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  routesList: {
    marginBottom: 16,
  },
  showSelectedRouteButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  showSelectedRouteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})

export default RouteOptionsModal
