"use client"

import { useEffect, useRef } from "react"
import { View, StyleSheet, Dimensions, Animated } from "react-native"
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"

const { width, height } = Dimensions.get("window")

type EnhancedWaterAnimationProps = {
  fillPercentage?: number // 0 to 100
  duration?: number
  containerStyle?: any
}

const EnhancedWaterAnimation = ({
  fillPercentage = 100,
  duration = 10000,
  containerStyle,
}: EnhancedWaterAnimationProps) => {
  const { theme } = useContext(ThemeContext)

  // Animation values
  const waterLevel = useRef(new Animated.Value(height)).current
  const wave1Position = useRef(new Animated.Value(0)).current
  const wave2Position = useRef(new Animated.Value(width / 2)).current
  const waterOpacity = useRef(new Animated.Value(0.7)).current

  // Calculate target water level based on fill percentage
  const targetWaterLevel = height - height * (fillPercentage / 100)

  useEffect(() => {
    // Animate water rising
    Animated.timing(waterLevel, {
      toValue: targetWaterLevel,
      duration: duration,
      useNativeDriver: false,
    }).start()

    // Animate wave movement for more realistic effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave1Position, {
          toValue: -width,
          duration: 10000,
          useNativeDriver: false,
        }),
        Animated.timing(wave1Position, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: false,
        }),
      ]),
    ).start()

    Animated.loop(
      Animated.sequence([
        Animated.timing(wave2Position, {
          toValue: 0,
          duration: 12000,
          useNativeDriver: false,
        }),
        Animated.timing(wave2Position, {
          toValue: width,
          duration: 12000,
          useNativeDriver: false,
        }),
      ]),
    ).start()

    // Subtle opacity changes for more realistic water
    Animated.loop(
      Animated.sequence([
        Animated.timing(waterOpacity, {
          toValue: 0.9,
          duration: 3000,
          useNativeDriver: false,
        }),
        Animated.timing(waterOpacity, {
          toValue: 0.7,
          duration: 3000,
          useNativeDriver: false,
        }),
      ]),
    ).start()

    return () => {
      // Clean up animations
      waterLevel.stopAnimation()
      wave1Position.stopAnimation()
      wave2Position.stopAnimation()
      waterOpacity.stopAnimation()
    }
  }, [fillPercentage, duration])

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.waterContainer,
          {
            transform: [{ translateY: waterLevel }],
            opacity: waterOpacity,
          },
        ]}
      >
        {/* Main water body - dark blue transparent */}
        <View style={[styles.water, { backgroundColor: "rgba(13, 71, 161, 0.6)" }]}>
          {/* Wave 1 */}
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ translateX: wave1Position }],
                top: -20,
              },
            ]}
          >
            <View style={[styles.waveShape, { backgroundColor: "rgba(25, 118, 210, 0.7)" }]} />
          </Animated.View>

          {/* Wave 2 */}
          <Animated.View
            style={[
              styles.wave,
              {
                transform: [{ translateX: wave2Position }],
                top: -35,
              },
            ]}
          >
            <View style={[styles.waveShape, { backgroundColor: "rgba(25, 118, 210, 0.5)" }]} />
          </Animated.View>

          {/* Bubbles effect */}
          <View style={styles.bubblesContainer}>
            {Array.from({ length: 10 }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.bubble,
                  {
                    left: Math.random() * width,
                    bottom: Math.random() * 100,
                    width: 4 + Math.random() * 8,
                    height: 4 + Math.random() * 8,
                    opacity: 0.2 + Math.random() * 0.3,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </Animated.View>

      {/* Dark overlay for better text visibility */}
      <View style={styles.darkOverlay} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  waterContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 2, // Extra height to ensure full coverage
  },
  water: {
    flex: 1,
    position: "relative",
  },
  wave: {
    position: "absolute",
    width: width * 2,
    height: 40,
    left: -width / 2,
  },
  waveShape: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  bubblesContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  bubble: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 50,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)", // Dark overlay for better text visibility
  },
})

export default EnhancedWaterAnimation
