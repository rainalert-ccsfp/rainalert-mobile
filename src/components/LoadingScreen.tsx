import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { useContext } from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading...",
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.message, { color: theme.colors.text }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  message: {
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
});

export default LoadingScreen;
