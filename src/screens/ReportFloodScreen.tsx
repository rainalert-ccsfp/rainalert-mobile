"use client"

import { useContext, useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import * as Location from "expo-location"
import { ThemeContext } from "../context/ThemeContext"
import { AlertContext, type AlertLevel } from "../context/AlertContext"
import Input from "../components/Input"
import Button from "../components/Button"
import FloodMap from "../components/FloodMap"
import type { Region } from "react-native-maps"

const ReportFloodScreen = () => {
  const { theme } = useContext(ThemeContext)
  const { reportFlood } = useContext(AlertContext)

  const [description, setDescription] = useState("")
  const [floodLevel, setFloodLevel] = useState<AlertLevel>("moderate")
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 15.090024,
    longitude: 120.662842,
  })
  const [loading, setLoading] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [currentUserLocation, setCurrentUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationAddress, setLocationAddress] = useState("Select location")
  const [selectedAddress, setSelectedAddress] = useState<string | undefined>(undefined)

  // Get user's current location when component mounts
  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({})
        const { latitude, longitude } = location.coords
        setCurrentUserLocation({ latitude, longitude })
      }
    })()
  }, [])

  const handleRegionChange = (region: Region) => {
    setLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    })
  }

  const getAddressFromCoords = async (latitude: number, longitude: number) => {
    try {
      const results = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (results && results.length > 0) {
        const { street, name, city, region, postalCode, country } = results[0];
        // Compose a readable address
        return [street || name, city, region, postalCode, country].filter(Boolean).join(", ");
      }
    } catch (e) {
      // Ignore errors, fallback to coordinates
    }
    return `(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
  };

  const handleUseCurrentLocation = async () => {
    if (currentUserLocation) {
      setLocation(currentUserLocation)
      setShowLocationModal(false)
      const address = await getAddressFromCoords(currentUserLocation.latitude, currentUserLocation.longitude);
      setLocationAddress(address ? address : "Current Location")
      setSelectedAddress(address)
    } else {
      Alert.alert("Error", "Unable to get your current location. Please enable location services.")
    }
  }

  const handleSelectLocation = () => {
    setShowLocationModal(true)
  }

  const handleConfirmLocation = async () => {
    const address = await getAddressFromCoords(location.latitude, location.longitude);
    setLocationAddress(address ? address : `Selected Location (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`)
    setSelectedAddress(address)
    setShowLocationModal(false)
  }

  const handleSubmit = () => {
    if (!selectedAddress) {
      Alert.alert("Error", "Please select a location on the map.")
      return;
    }
    if (!description) {
      Alert.alert("Error", "Please provide a description of the flooding.")
      return;
    }

    setLoading(true)

    setTimeout(() => {
      reportFlood({ ...location, address: selectedAddress }, floodLevel, description)

      Alert.alert("Report Submitted", "Thank you for your report. It will help others stay safe.", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setDescription("")
            setFloodLevel("moderate")
            setLocation({ latitude: 15.090024, longitude: 120.662842 })
            setLocationAddress("Select location")
            setSelectedAddress(undefined)
            setLoading(false)
          },
        },
      ])
    }, 1500)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Report Flood Conditions</Text>

          <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>
            Your reports help others stay safe during flooding events
          </Text>

          <View style={styles.mapSection}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Select Location</Text>
            <TouchableOpacity
              style={[
                styles.locationSelector,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
              onPress={handleSelectLocation}
            >
              <Ionicons name="location" size={24} color={theme.colors.primary} />
              <Text style={[styles.locationText, { color: theme.colors.text }]}>{locationAddress}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Show the selected address as plain text */}
          {selectedAddress && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '500' }}>Location: {selectedAddress}</Text>
            </View>
          )}

          <View style={styles.formSection}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Flood Level</Text>
            <View style={styles.floodLevelContainer}>
              {[
                { value: "caution", label: "Caution", color: theme.colors.caution },
                { value: "moderate", label: "Moderate", color: theme.colors.moderate },
                { value: "severe", label: "Severe", color: theme.colors.severe },
              ].map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.floodLevelButton,
                    {
                      backgroundColor: floodLevel === level.value ? level.color : "transparent",
                      borderColor: level.color,
                    },
                  ]}
                  onPress={() => setFloodLevel(level.value as AlertLevel)}
                >
                  <Text
                    style={{
                      color: floodLevel === level.value ? "#fff" : level.color,
                      fontWeight: "500",
                    }}
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="Description"
              placeholder="Describe the flooding conditions..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ height: 100 }}
            />
          </View>

          <Button title="Submit Report" onPress={handleSubmit} loading={loading} style={styles.submitButton} />
        </ScrollView>

        <Modal animationType="slide" transparent={true} visible={showLocationModal}>
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Select Flood Location</Text>
              <View style={styles.mapContainer}>
                <FloodMap 
                  onRegionChange={handleRegionChange}
                  onMapPress={async ({ latitude, longitude }) => {
                    setLocation({ latitude, longitude });
                    const address = await getAddressFromCoords(latitude, longitude);
                    setLocationAddress(address ? address : `Selected Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
                    setSelectedAddress(address);
                  }}
                  selectedPin={location}
                  showPin
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "transparent", borderColor: theme.colors.primary }]}
                  onPress={handleUseCurrentLocation}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.primary }]}>Use Current</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
                  onPress={handleConfirmLocation}
                >
                  <Text style={[styles.modalButtonText, { color: theme.colors.buttonText }]}>Confirm Pin</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.closeModalButton} onPress={() => setShowLocationModal(false)}>
                <Ionicons name="close-circle" size={30} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  mapSection: {
    marginBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  locationSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  locationText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
  floodLevelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  floodLevelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  closeModalButton: {
    position: "absolute",
    top: 8,
    right: 8,
  },
})

export default ReportFloodScreen
