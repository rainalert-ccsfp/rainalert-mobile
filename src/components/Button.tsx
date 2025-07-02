"use client"

import type React from "react"
import { useContext } from "react"
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
  type TouchableOpacityProps,
} from "react-native"
import { ThemeContext } from "../context/ThemeContext"

type ButtonProps = TouchableOpacityProps & {
  title: string
  variant?: "primary" | "secondary" | "outline" | "danger"
  size?: "small" | "medium" | "large"
  loading?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
  textStyle?: TextStyle
}

const Button = ({
  title,
  variant = "primary",
  size = "medium",
  loading = false,
  icon,
  style,
  textStyle,
  ...props
}: ButtonProps) => {
  const { theme } = useContext(ThemeContext)

  const getBackgroundColor = () => {
    switch (variant) {
      case "primary":
        return theme.colors.primary
      case "secondary":
        return theme.colors.secondary
      case "outline":
        return "transparent"
      case "danger":
        return theme.colors.notification
      default:
        return theme.colors.primary
    }
  }

  const getTextColor = () => {
    switch (variant) {
      case "outline":
        return theme.colors.primary
      case "primary":
      case "secondary":
      case "danger":
        return "#FFFFFF"
      default:
        return "#FFFFFF"
    }
  }

  const getBorderColor = () => {
    switch (variant) {
      case "outline":
        return theme.colors.primary
      default:
        return "transparent"
    }
  }

  const getPadding = () => {
    switch (size) {
      case "small":
        return { paddingVertical: 6, paddingHorizontal: 12 }
      case "medium":
        return { paddingVertical: 10, paddingHorizontal: 16 }
      case "large":
        return { paddingVertical: 14, paddingHorizontal: 20 }
      default:
        return { paddingVertical: 10, paddingHorizontal: 16 }
    }
  }

  const getFontSize = () => {
    switch (size) {
      case "small":
        return theme.fontSizes.sm
      case "medium":
        return theme.fontSizes.md
      case "large":
        return theme.fontSizes.lg
      default:
        return theme.fontSizes.md
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === "outline" ? 1 : 0,
          borderRadius: theme.borderRadius.md,
          ...getPadding(),
        },
        style,
      ]}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <>
          {icon && <Text style={styles.iconContainer}>{icon}</Text>}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  text: {
    fontWeight: "600",
    textAlign: "center",
  },
  iconContainer: {
    marginRight: 8,
  },
})

export default Button
