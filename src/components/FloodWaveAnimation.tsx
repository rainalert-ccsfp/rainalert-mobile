"use client"

import { useEffect } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
} from "react-native-reanimated"
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"

const { width, height } = Dimensions.get("window")

type FloodWaveAnimationProps = {
  intensity?: "light" | "moderate" | "heavy"
  duration?: number
  containerStyle?: any
}

const FloodWaveAnimation = ({ intensity = "moderate", duration = 3000, containerStyle }: FloodWaveAnimationProps) => {
  const { theme } = useContext(ThemeContext)

  const wavePosition = useSharedValue(-width)
  const waveHeight = useSharedValue(100)
  const waveOpacity = useSharedValue(0.8)

  // Determine wave height based on intensity
  const getWaveHeight = () => {
    switch (intensity) {
      case "light":
        return 100
      case "moderate":
        return 150
      case "heavy":
        return 200
      default:
        return 150
    }
  }

  useEffect(() => {
    // Set wave height based on intensity
    waveHeight.value = getWaveHeight()

    // Animate wave moving across the screen
    wavePosition.value = withRepeat(
      withSequence(
        withTiming(-width, { duration: 0 }),
        withTiming(width, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }),
      ),
      -1, // Infinite repeat
      false,
    )

    // Animate opacity for a more realistic effect
    waveOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(0.6, { duration: duration / 2 }),
        withTiming(0.8, { duration: duration / 2 }),
      ),
      -1, // Infinite repeat
      false,
    )

    return () => {
      cancelAnimation(wavePosition)
      cancelAnimation(waveHeight)
      cancelAnimation(waveOpacity)
    }
  }, [intensity, duration])

  const waveStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: wavePosition.value }],
      height: waveHeight.value,
      opacity: waveOpacity.value,
    }
  })

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.wave, { backgroundColor: theme.colors.waterDark }, waveStyle]} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  wave: {
    position: "absolute",
    bottom: 0,
    width: width * 2,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
  },
})

export default FloodWaveAnimation
