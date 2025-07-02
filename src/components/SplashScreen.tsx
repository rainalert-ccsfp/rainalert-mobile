"use client"

import { useEffect, useState, useRef } from "react"
import { View, Text, StyleSheet, Image, Animated } from "react-native"
import { useContext } from "react"
import { ThemeContext } from "../context/ThemeContext"

type SplashScreenProps = {
  onComplete: () => void
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const { theme } = useContext(ThemeContext)
  const [animationComplete, setAnimationComplete] = useState(false)
  const [raindrops, setRaindrops] = useState<
    Array<{
      id: number
      left: number
      top: number
      height: number
      animValue: Animated.Value
    }>
  >([])

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.8)).current

  useEffect(() => {
    // Create raindrops with random properties
    const drops = []
    for (let i = 0; i < 30; i++) {
      drops.push({
        id: i,
        left: Math.random() * 100,
        top: -20 - Math.random() * 20,
        height: 15 + Math.random() * 15,
        animValue: new Animated.Value(-20),
      })
    }
    setRaindrops(drops)

    // Animate raindrops falling
    drops.forEach((drop) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(drop.animValue, {
            toValue: 100,
            duration: 1500 + Math.random() * 2000,
            useNativeDriver: true,
            delay: Math.random() * 2000,
          }),
          Animated.timing(drop.animValue, {
            toValue: -20,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    })

    // Start fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start()

    // Complete splash screen after animation
    const timer = setTimeout(() => {
      setAnimationComplete(true)

      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        onComplete()
      })
    }, 3000)

    return () => clearTimeout(timer)
  }, [onComplete, fadeAnim, scaleAnim])

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.rainContainer}>
        {raindrops.map((drop) => (
          <Animated.View
            key={drop.id}
            style={[
              styles.raindrop,
              {
                left: `${drop.left}%`,
                height: drop.height,
                transform: [{ translateY: drop.animValue }],
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
        ))}
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../../assets/icon.png")}
          style={styles.logo}
          defaultSource={require("../../assets/icon.png")}
        />
        <Text style={[styles.appName, { color: theme.colors.primary }]}>RainAlert</Text>
        <Text style={[styles.tagline, { color: theme.colors.text }]}>Stay safe during floods</Text>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
  },
  tagline: {
    fontSize: 18,
    marginTop: 10,
    opacity: 0.7,
  },
  rainContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  raindrop: {
    position: "absolute",
    width: 2,
    borderRadius: 10,
  },
})

export default SplashScreen
