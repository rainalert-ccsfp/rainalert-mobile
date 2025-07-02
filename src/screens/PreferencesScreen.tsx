"use client"

import React from "react"
import { useContext } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { ThemeContext } from "../context/ThemeContext"

const PreferencesScreen = () => {
  const { theme } = useContext(ThemeContext)

  // Mock preferences state
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true)
  const [locationEnabled, setLocationEnabled] = React.useState(true)
  const [dataUsage, setDataUsage] = React.useState("Medium")

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Preferences description */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.card }]}> 
          <Text style={[styles.infoTitle, { color: theme.colors.text }]}>Preferences</Text>
          <Text style={[styles.infoDescription, { color: theme.colors.text }]}> 
            Customize your RainAlert experience with these preferences. Control notifications, location services, data usage, and more to optimize the app for your needs.
          </Text>
        </View>

        {/* Notification Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Notifications</Text>
          <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}> 
            <View style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Enable Notifications</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}> 
                  Receive alerts about flooding in your area
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: "#D9D9D9", true: `${theme.colors.primary}80` }}
                thumbColor={notificationsEnabled ? theme.colors.primary : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Location Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Location</Text>
          <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}> 
            <View style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Location Services</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}> 
                  Allow app to access your location
                </Text>
              </View>
              <Switch
                value={locationEnabled}
                onValueChange={setLocationEnabled}
                trackColor={{ false: "#D9D9D9", true: `${theme.colors.primary}80` }}
                thumbColor={locationEnabled ? theme.colors.primary : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* Account Preferences */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Account</Text>
          <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}> 
            <TouchableOpacity style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Profile Information</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}> 
                  Update your personal details
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Change Password</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}> 
                  Update your account password
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>About</Text>
          <View style={[styles.settingCard, { backgroundColor: theme.colors.card }]}> 
            <TouchableOpacity style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Version</Text>
                <Text style={[styles.settingDescription, { color: theme.colors.text }]}>1.0.0</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Terms of Service</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}> 
              <View style={styles.settingInfo}> 
                <Text style={[styles.settingTitle, { color: theme.colors.text }]}>Privacy Policy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  settingCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: "#888",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 16,
  },
})

export default PreferencesScreen 