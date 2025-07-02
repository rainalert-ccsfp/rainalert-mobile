"use client";

import { useContext } from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";

import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

import DashboardScreen from "../screens/DashboardScreen";
import MapScreen from "../screens/MapScreen";
import TrackEmergencyScreen from "../screens/TrackEmergencyScreen";
import ReportFloodScreen from "../screens/ReportFloodScreen";
import HistoricalDataScreen from "../screens/HistoricalDataScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HelpScreen from "../screens/HelpScreen";
import CustomDrawerContent from "../components/CustomDrawerContent";
import LoadingScreen from "../components/LoadingScreen";

import ProfileInformationScreen from "../screens/ProfileInformationScreen";
import TermsOfServiceScreen from "../screens/TermsOfServiceScreen";
import PrivacyPolicyScreen from "../screens/PrivacyPolicyScreen";
import NotificationDetailsScreen from "../screens/NotificationDetailsScreen";

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const MainDrawer = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: "#fff",
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#E3F2FD",
        drawerStyle: {
          width: Dimensions.get("window").width * 0.75,
          backgroundColor: theme.colors.primary,
        },
        swipeEnabled: false, // Disable swipe gesture to avoid gesture handler issues
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="water" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Map"
        component={MapScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="map" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Track Emergency Vehicles"
        component={TrackEmergencyScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="car" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Report Flood"
        component={ReportFloodScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="warning" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Historical Data"
        component={HistoricalDataScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="time" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Help"
        component={HelpScreen}
        options={{
          drawerIcon: ({ color }) => (
            <Ionicons name="help-circle-outline" size={22} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthStack} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainDrawer} />
          <Stack.Screen
            name="ProfileInformation"
            component={ProfileInformationScreen}
          />
          <Stack.Screen
            name="TermsOfService"
            component={TermsOfServiceScreen}
          />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen
            name="NotificationDetails"
            component={NotificationDetailsScreen}
            options={{ headerShown: true, title: "Notification Details" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
