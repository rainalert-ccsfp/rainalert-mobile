import type React from "react"
import { TextInput as RNTextInput, StyleSheet, type TextInputProps } from "react-native"

interface CustomTextInputProps extends TextInputProps {
  style?: any
}

const TextInput: React.FC<CustomTextInputProps> = ({ style, ...props }) => {
  return <RNTextInput style={[styles.input, style]} {...props} />
}

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
  },
})

export default TextInput
