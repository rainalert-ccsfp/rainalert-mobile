"use client"

import { useState, useEffect, useRef } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"
import RisingWaterAnimation from "./RisingWaterAnimation"

const { width } = Dimensions.get("window")

// Mock CCTV locations
const CCTV_LOCATIONS = [
  { id: "cctv1", name: "Downtown Bridge", severity: "moderate", animationType: "rising" },
  { id: "cctv2", name: "River Park", severity: "severe", animationType: "rising" },
  { id: "cctv3", name: "Main Street", severity: "caution", animationType: "rising" },
  { id: "cctv4", name: "Highway Underpass", severity: "severe", animationType: "rising" },
]

type LiveFloodFeedProps = {
  initialLocation?: string
}

const LiveFloodFeed = ({ initialLocation = "cctv1" }: LiveFloodFeedProps) => {
  const { theme } = useContext(ThemeContext)
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showControls, setShowControls] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const selectedCCTV = CCTV_LOCATIONS.find((loc) => loc.id === selectedLocation) || CCTV_LOCATIONS[0]

  // Update the current time every second
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying])

  // Auto-hide controls after 5 seconds
  useEffect(() => {
    if (showControls) {
      const timer = setTimeout(() => {
        setShowControls(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [showControls])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getFloodSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getFloodIntensity = (severity: string): "light" | "moderate" | "heavy" => {
    switch (severity) {
      case "caution":
        return "light"
      case "moderate":
        return "moderate"
      case "severe":
        return "heavy"
      default:
        return "moderate"
    }
  }

  const renderFloodAnimation = () => {
    const intensity = getFloodIntensity(selectedCCTV.severity)
    return <RisingWaterAnimation intensity={intensity} />
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={1} style={styles.feedContainer} onPress={() => setShowControls(!showControls)}>
        {/* Mock CCTV feed - in a real app, this would be a video component */}
        <Image
          source={{ uri: "https://via.placeholder.com/400x300/0D47A1/FFFFFF?text=CCTV+Feed" }}
          style={styles.feedImage}
          defaultSource={{ uri: "https://via.placeholder.com/400x300/0D47A1/FFFFFF?text=Loading..." }}
        />


        {/* CCTV info overlay */}
        <View style={styles.infoOverlay}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationName}>{selectedCCTV.name}</Text>
            <View style={[styles.severityIndicator, { backgroundColor: getFloodSeverityColor(selectedCCTV.severity) }]}>
              <Text style={styles.severityText}>
                {selectedCCTV.severity.charAt(0).toUpperCase() + selectedCCTV.severity.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.timestamp}>LIVE • {formatTime(currentTime)}</Text>
        </View>

        {/* Controls overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={[styles.controlButton, { backgroundColor: theme.colors.card }]}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Ionicons name={isPlaying ? "pause" : "play"} size={20} color={theme.colors.text} />
              </TouchableOpacity>

              <View style={styles.locationSelector}>
                {CCTV_LOCATIONS.map((location) => (
                  <TouchableOpacity
                    key={location.id}
                    style={[
                      styles.locationButton,
                      {
                        backgroundColor: selectedLocation === location.id ? theme.colors.primary : theme.colors.card,
                      },
                    ]}
                    onPress={() => setSelectedLocation(location.id)}
                  >
                    <Text
                      style={[
                        styles.locationButtonText,
                        {
                          color: selectedLocation === location.id ? "#fff" : theme.colors.text,
                        },
                      ]}
                    >
                      {location.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  feedContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    backgroundColor: "#000",
  },
  feedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  animationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  infoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    marginRight: 8,
  },
  severityIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  severityText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "bold",
  },
  timestamp: {
    color: "#fff",
    fontSize: 12,
  },
  controlsOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationSelector: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  locationButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  locationButtonText: {
    fontSize: 12,
  },
})

export default LiveFloodFeed
