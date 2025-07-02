"use client"

import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated"
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"

const { width, height } = Dimensions.get("window")

type RainDropProps = {
  delay: number
  duration: number
  startX: number
  size: number
  opacity: number
  angle: number
}

const RainDrop = ({ delay, duration, startX, size, opacity, angle }: RainDropProps) => {
  const { theme } = useContext(ThemeContext)

  const translateY = useSharedValue(-size)
  const translateX = useSharedValue(startX)
  const alpha = useSharedValue(opacity)

  useEffect(() => {
    // Calculate end position based on angle
    const endX = startX + Math.tan(angle) * height

    // Animate the raindrop falling
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-size, { duration: 0 }),
        withTiming(height + size, {
          duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ),
    )

    // Add angled movement to simulate wind
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(startX, { duration: 0 }),
        withTiming(endX, {
          duration,
          easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        }),
      ),
    )

    // Fade out as the drop falls
    alpha.value = withDelay(delay + duration * 0.7, withTiming(0, { duration: duration * 0.3 }))

    return () => {
      cancelAnimation(translateY)
      cancelAnimation(translateX)
      cancelAnimation(alpha)
    }
  }, [delay, duration, startX, size, angle])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { translateX: translateX.value }, { rotate: `${angle}rad` }],
      opacity: alpha.value,
    }
  })

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size * 5,
          backgroundColor: theme.colors.primary,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  )
}

type LightningFlashProps = {
  minDelay: number
  maxDelay: number
}

const LightningFlash = ({ minDelay, maxDelay }: LightningFlashProps) => {
  const opacity = useSharedValue(0)
  const [nextFlash, setNextFlash] = useState(minDelay + Math.random() * (maxDelay - minDelay))

  useEffect(() => {
    const flashInterval = setInterval(() => {
      // Create lightning flash effect
      opacity.value = withSequence(
        withTiming(0.8, { duration: 50 }),
        withTiming(0, { duration: 50 }),
        withDelay(50, withTiming(0.6, { duration: 50 })),
        withTiming(0, { duration: 150 }),
      )

      // Set random time for next flash
      setNextFlash(minDelay + Math.random() * (maxDelay - minDelay))
    }, nextFlash)

    return () => clearInterval(flashInterval)
  }, [nextFlash])

  const flashStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    }
  })

  return <Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: "white" }, flashStyle]} />
}

type EnhancedRainAnimationProps = {
  intensity?: "light" | "moderate" | "heavy"
  withLightning?: boolean
  windAngle?: number // in radians, 0 is straight down, positive is right, negative is left
  containerStyle?: any
}

const EnhancedRainAnimation = ({
  intensity = "moderate",
  withLightning = false,
  windAngle = 0.1, // slight angle by default
  containerStyle,
}: EnhancedRainAnimationProps) => {
  const { theme } = useContext(ThemeContext)
  const [raindrops, setRaindrops] = useState<RainDropProps[]>([])

  // Determine number of raindrops based on intensity
  const getDropCount = () => {
    switch (intensity) {
      case "light":
        return 30
      case "moderate":
        return 60
      case "heavy":
        return 100
      default:
        return 60
    }
  }

  // Create raindrops with random properties
  useEffect(() => {
    const dropCount = getDropCount()
    const drops = []

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        delay: Math.random() * 1000,
        duration: 1000 + Math.random() * 1000,
        startX: Math.random() * width,
        size: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
        angle: windAngle + (Math.random() * 0.1 - 0.05), // Add slight variation to wind angle
      })
    }

    setRaindrops(drops)
  }, [intensity, windAngle])

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }, containerStyle]}>
      {withLightning && intensity !== "light" && (
        <LightningFlash
          minDelay={intensity === "heavy" ? 3000 : 6000}
          maxDelay={intensity === "heavy" ? 8000 : 15000}
        />
      )}

      {raindrops.map((drop, index) => (
        <RainDrop
          key={index}
          delay={drop.delay}
          duration={drop.duration}
          startX={drop.startX}
          size={drop.size}
          opacity={drop.opacity}
          angle={drop.angle}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
})

export default EnhancedRainAnimation
