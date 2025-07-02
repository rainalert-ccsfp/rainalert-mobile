"use client"

import { useContext, useState, useRef, useEffect } from "react"
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native"
import MapView, { Marker, Circle, PROVIDER_GOOGLE, type MapViewProps, type Region } from "react-native-maps"
import { ThemeContext } from "../context/ThemeContext"
import { AlertContext, type AlertLevel } from "../context/AlertContext"
import { Ionicons } from "@expo/vector-icons"

type FloodMapProps = {
  showEmergencyVehicles?: boolean
  initialRegion?: Region
  onRegionChange?: (region: Region) => void
  trackedVehicleId?: string | null
  onMapPress?: (coords: { latitude: number; longitude: number }) => void
  selectedPin?: { latitude: number; longitude: number }
  showPin?: boolean
}

const sanFernandoPampangaRegion = {
  latitude: 15.090024,
  longitude: 120.662842,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
}

const FloodMap = ({
  showEmergencyVehicles = false,
  initialRegion,
  onRegionChange,
  trackedVehicleId,
  onMapPress,
  selectedPin,
  showPin,
}: FloodMapProps) => {
  const { theme } = useContext(ThemeContext)
  const { floodedAreas, emergencyVehicles } = useContext(AlertContext)
  const mapRef = useRef<MapView>(null)
  const [isMapReady, setMapReady] = useState(false)
  const [mapType, setMapType] = useState<MapViewProps["mapType"]>("standard")
  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(
    initialRegion || sanFernandoPampangaRegion
  )

  useEffect(() => {
    if (trackedVehicleId && isMapReady) {
      const vehicle = emergencyVehicles.find((v) => v.id === trackedVehicleId)
      if (vehicle && mapRef.current) {
        const region = {
          latitude: vehicle.location.latitude,
          longitude: vehicle.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }
        mapRef.current.animateToRegion(region, 1000) // Animate over 1 second
      }
    }
  }, [trackedVehicleId, emergencyVehicles, isMapReady])

  const toggleMapType = () => {
    setMapType((prev) => (prev === "standard" ? "satellite" : "standard"))
  }

  const getFloodColor = (level: AlertLevel) => {
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

  const getFloodRadius = (level: AlertLevel) => {
    switch (level) {
      case "caution":
        return 300
      case "moderate":
        return 500
      case "severe":
        return 800
      default:
        return 300
    }
  }

  const handleRegionChange = (region: Region) => {
    setCurrentRegion(region)
    if (onRegionChange) {
      onRegionChange(region)
    }
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={currentRegion}
        onRegionChangeComplete={handleRegionChange}
        onMapReady={() => setMapReady(true)}
        showsUserLocation
        showsMyLocationButton
        mapType={mapType}
        onPress={e => {
          if (onMapPress) {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            onMapPress({ latitude, longitude });
          }
        }}
      >
        {/* Render flooded areas */}
        {floodedAreas.map((area, index) => (
          <Circle
            key={`flood-${index}`}
            center={{
              latitude: area.location.latitude,
              longitude: area.location.longitude,
            }}
            radius={getFloodRadius(area.level)}
            fillColor={`${getFloodColor(area.level)}80`} // 50% opacity
            strokeColor={getFloodColor(area.level)}
            strokeWidth={1}
          />
        ))}

        {/* Render emergency vehicles if enabled */}
        {showEmergencyVehicles &&
          emergencyVehicles.map((vehicle) => {
            const isTracked = vehicle.id === trackedVehicleId
            return (
              <Marker
                key={vehicle.id}
                coordinate={{
                  latitude: vehicle.location.latitude,
                  longitude: vehicle.location.longitude,
                }}
                title={vehicle.type}
                description="Emergency Response Vehicle"
                pinColor={isTracked ? "green" : "blue"}
                zIndex={isTracked ? 1 : 0}
              />
            )
          })}

        {/* Render pin marker if selecting location */}
        {showPin && selectedPin && (
          <Marker coordinate={selectedPin}>
            <Ionicons name="location-sharp" size={36} color={theme.colors.primary} />
          </Marker>
        )}
      </MapView>
      <TouchableOpacity
        style={[styles.mapTypeToggle, { backgroundColor: theme.colors.card }]}
        onPress={toggleMapType}
      >
        <Ionicons name={mapType === "standard" ? "globe" : "map"} size={22} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  map: {
    width: Dimensions.get("window").width,
    height: "100%",
  },
  mapTypeToggle: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
})

export default FloodMap
