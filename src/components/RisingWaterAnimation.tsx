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

type RisingWaterAnimationProps = {
  intensity?: "light" | "moderate" | "heavy"
  duration?: number
  containerStyle?: any
}

const RisingWaterAnimation = ({
  intensity = "moderate",
  duration = 5000,
  containerStyle,
}: RisingWaterAnimationProps) => {
  const { theme } = useContext(ThemeContext)

  const waterLevel = useSharedValue(height)
  const waveOffset1 = useSharedValue(0)
  const waveOffset2 = useSharedValue(width / 2)

  // Determine max water level based on intensity
  const getMaxWaterLevel = () => {
    switch (intensity) {
      case "light":
        return height * 0.7
      case "moderate":
        return height * 0.5
      case "heavy":
        return height * 0.3
      default:
        return height * 0.5
    }
  }

  useEffect(() => {
    // Animate water rising
    waterLevel.value = withTiming(getMaxWaterLevel(), {
      duration,
      easing: Easing.out(Easing.ease),
    })

    // Animate wave movement
    waveOffset1.value = withRepeat(
      withSequence(
        withTiming(width, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // Infinite repeat
      true, // Reverse
    )

    waveOffset2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(width / 2, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // Infinite repeat
      true, // Reverse
    )

    return () => {
      cancelAnimation(waterLevel)
      cancelAnimation(waveOffset1)
      cancelAnimation(waveOffset2)
    }
  }, [intensity, duration])

  const waterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: waterLevel.value }],
    }
  })

  const wave1Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: waveOffset1.value }],
    }
  })

  const wave2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: waveOffset2.value }],
    }
  })

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <View style={[styles.water, { backgroundColor: theme.colors.water }]}>
          <Animated.View style={[styles.wave, wave1Style]}>
            <View style={[styles.waveShape, { backgroundColor: theme.colors.waterDark }]} />
          </Animated.View>
          <Animated.View style={[styles.wave, wave2Style]}>
            <View style={[styles.waveShape, { backgroundColor: theme.colors.waterDark, opacity: 0.7 }]} />
          </Animated.View>
        </View>
      </Animated.View>
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
    height: height,
  },
  water: {
    flex: 1,
    position: "relative",
  },
  wave: {
    position: "absolute",
    top: -20,
    left: -width,
    width: width * 2,
    height: 40,
  },
  waveShape: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
})

export default RisingWaterAnimation
