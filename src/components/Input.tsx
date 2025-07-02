"use client"

import { useContext } from "react"
import { View, TextInput, Text, StyleSheet, type TextInputProps, type ViewStyle, type TextStyle } from "react-native"
import { ThemeContext } from "../context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"

type InputProps = TextInputProps & {
  label?: string
  error?: string
  leftIcon?: string
  rightIcon?: string
  onRightIconPress?: () => void
  containerStyle?: ViewStyle
  labelStyle?: TextStyle
  inputStyle?: TextStyle
}

const Input = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  labelStyle,
  inputStyle,
  ...props
}: InputProps) => {
  const { theme } = useContext(ThemeContext)

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, { color: theme.colors.text }, labelStyle]}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor: error ? theme.colors.notification : theme.colors.border,
            borderRadius: theme.borderRadius.md,
          },
        ]}
      >
        {leftIcon && <Ionicons name={leftIcon as any} size={20} color={theme.colors.text} style={styles.leftIcon} />}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              paddingLeft: leftIcon ? 0 : 12,
              paddingRight: rightIcon ? 40 : 12,
            },
            inputStyle,
          ]}
          placeholderTextColor="#999"
          {...props}
        />

        {rightIcon && (
          <Ionicons
            name={rightIcon as any}
            size={20}
            color={theme.colors.text}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </View>

      {error && <Text style={[styles.error, { color: theme.colors.notification }]}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  leftIcon: {
    paddingHorizontal: 12,
  },
  rightIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
})

export default Input
