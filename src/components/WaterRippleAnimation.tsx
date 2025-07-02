"use client"

import { useEffect, useState } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
  Easing,
  cancelAnimation,
} from "react-native-reanimated"
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"

const { width } = Dimensions.get("window")

type RippleProps = {
  delay: number
  duration: number
  size: number
  x: number
  y: number
}

const Ripple = ({ delay, duration, size, x, y }: RippleProps) => {
  const { theme } = useContext(ThemeContext)

  const scale = useSharedValue(0)
  const opacity = useSharedValue(0.8)

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration, easing: Easing.out(Easing.ease) }),
        -1, // Infinite repeat
        false,
      ),
    )

    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration, easing: Easing.out(Easing.ease) }),
        -1, // Infinite repeat
        false,
      ),
    )

    return () => {
      cancelAnimation(scale)
      cancelAnimation(opacity)
    }
  }, [delay, duration])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  })

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "transparent",
          borderWidth: 2,
          borderColor: theme.colors.primary,
          left: x - size / 2,
          top: y - size / 2,
        },
        animatedStyle,
      ]}
    />
  )
}

type WaterRippleAnimationProps = {
  count?: number
  containerStyle?: any
}

const WaterRippleAnimation = ({ count = 5, containerStyle }: WaterRippleAnimationProps) => {
  const [ripples, setRipples] = useState<RippleProps[]>([])

  useEffect(() => {
    // Create ripples with random properties
    const newRipples = []
    for (let i = 0; i < count; i++) {
      newRipples.push({
        delay: Math.random() * 2000,
        duration: 2000 + Math.random() * 2000,
        size: 50 + Math.random() * 100,
        x: Math.random() * width,
        y: Math.random() * 200 + 50,
      })
    }
    setRipples(newRipples)
  }, [count])

  return (
    <View style={[styles.container, containerStyle]}>
      {ripples.map((ripple, index) => (
        <Ripple
          key={index}
          delay={ripple.delay}
          duration={ripple.duration}
          size={ripple.size}
          x={ripple.x}
          y={ripple.y}
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

export default WaterRippleAnimation
