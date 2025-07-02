"use client";

import "react-native-gesture-handler";
import React, { useState, Component, ReactNode, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View, Text, LogBox } from "react-native";
import * as Notifications from 'expo-notifications';
import { navigationRef } from './src/navigation/NavigationService';

// Ignore specific non-critical warnings
LogBox.ignoreLogs([
  "Unsupported top level event type",
  "react-native-gesture-handler",
  "ViewPropTypes will be removed",
]);

// Import Providers and Navigators
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { AlertProvider } from "./src/context/AlertContext";
import { ThemeProvider } from "./src/context/ThemeContext";
import SplashScreen from "./src/components/SplashScreen";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ========================
// Properly Typed ErrorBoundary
// ========================
type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error
        ? this.state.error.toString()
        : "An unknown error occurred.";

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

// ========================
// Main App Component
// ========================
export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <SafeAreaProvider>
          <ThemeProvider>
            <AuthProvider>
              <AlertProvider>
                {showSplash ? (
                  <SplashScreen onComplete={() => setShowSplash(false)} />
                ) : (
                  <NavigationContainer ref={navigationRef}>
                    <StatusBar style="auto" />
                    <AppNavigator />
                  </NavigationContainer>
                )}
              </AlertProvider>
            </AuthProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

// ========================
// Styles
// ========================
const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#dc3545",
  },
  errorMessage: { fontSize: 16, textAlign: "center", color: "#343a40" },
});
