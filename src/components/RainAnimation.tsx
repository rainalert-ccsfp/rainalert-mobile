"use client"

import { useEffect } from "react"
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
}

const RainDrop = ({ delay, duration, startX, size, opacity }: RainDropProps) => {
  const { theme } = useContext(ThemeContext)

  const translateY = useSharedValue(-size)
  const translateX = useSharedValue(startX)
  const scale = useSharedValue(1)
  const alpha = useSharedValue(opacity)

  useEffect(() => {
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

    // Add a slight horizontal movement to simulate wind
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(startX, { duration: 0 }),
        withTiming(startX + (Math.random() * 30 - 15), {
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
  }, [delay, duration, startX, size])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }, { translateX: translateX.value }, { scale: scale.value }],
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

type RainAnimationProps = {
  intensity?: "light" | "moderate" | "heavy"
  duration?: number
  onAnimationComplete?: () => void
}

const RainAnimation = ({ intensity = "moderate", duration = 3000, onAnimationComplete }: RainAnimationProps) => {
  const { theme } = useContext(ThemeContext)

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
  const createRaindrops = () => {
    const dropCount = getDropCount()
    const drops = []

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        id: i,
        delay: Math.random() * 1000,
        duration: 1000 + Math.random() * 1000,
        startX: Math.random() * width,
        size: 1 + Math.random() * 3,
        opacity: 0.3 + Math.random() * 0.7,
      })
    }

    return drops
  }

  useEffect(() => {
    if (onAnimationComplete) {
      const timer = setTimeout(() => {
        onAnimationComplete()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [duration, onAnimationComplete])

  const raindrops = createRaindrops()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {raindrops.map((drop) => (
        <RainDrop
          key={drop.id}
          delay={drop.delay}
          duration={drop.duration}
          startX={drop.startX}
          size={drop.size}
          opacity={drop.opacity}
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

export default RainAnimation
