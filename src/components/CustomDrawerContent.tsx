"use client"

import { useContext } from "react"
import { View, Text, StyleSheet, Image, ScrollView } from "react-native"
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from "@react-navigation/drawer"
import { Ionicons } from "@expo/vector-icons"
import { AuthContext } from "../context/AuthContext"
import { ThemeContext } from "../context/ThemeContext"

const CustomDrawerContent = (props: any) => {
  const { user, logout } = useContext(AuthContext)
  const { theme } = useContext(ThemeContext)

  const handleLogout = async () => {
    try {
      console.log("Logging out user:", user?.email);
      await logout();
      console.log("Logout completed successfully");
    } catch (error) {
      console.error("Logout error in drawer:", error);
      // Even if there's an error, we should still try to logout
      await logout();
    }
  };

  // Filter out duplicate menu items
  const filteredProps = {
    ...props,
    state: {
      ...props.state,
      routes: props.state.routes.filter((route: any, index: number) => {
        // Keep only the first occurrence of each route name
        return props.state.routes.findIndex((r: any) => r.name === route.name) === index
      }),
    },
  }

  return (
    <DrawerContentScrollView
      {...filteredProps}
      contentContainerStyle={{ flex: 1 }}
      style={{ backgroundColor: theme.colors.primary }}
    >
      <View style={styles.drawerHeader}>
        <View style={[styles.userInfoSection, { backgroundColor: theme.colors.primary }]}>
          <View style={styles.userInfo}>
            <Image source={{ uri: "https://via.placeholder.com/150" }} style={styles.userAvatar} />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.full_name || "User"}</Text>
              <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={[
          styles.drawerContent,
          {
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <DrawerItemList
          {...filteredProps}
          activeTintColor="#fff"
          inactiveTintColor="#E3F2FD"
          activeBackgroundColor="#1976D2"
        />

        <View style={[styles.divider, { backgroundColor: "#64B5F6" }]} />

        <DrawerItem
          label="Logout"
          icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color="#fff" />}
          onPress={handleLogout}
          labelStyle={{ color: "#fff" }}
        />
      </ScrollView>

      <View
        style={[
          styles.bottomSection,
          {
            borderTopColor: "#64B5F6",
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Text style={[styles.versionText, { color: "#fff" }]}>RainAlert v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  )
}

const styles = StyleSheet.create({
  drawerHeader: {
    overflow: "hidden",
  },
  userInfoSection: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
  },
  userDetails: {
    marginLeft: 15,
  },
  userName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  userEmail: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.8,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 10,
  },
  divider: {
    height: 1,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  bottomSection: {
    padding: 16,
    borderTopWidth: 1,
  },
  versionText: {
    fontSize: 12,
    textAlign: "center",
  },
})

export default CustomDrawerContent
