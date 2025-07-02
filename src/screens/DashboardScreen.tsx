"use client";

import { useContext, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { AlertContext } from "../context/AlertContext";
import WaterRippleAnimation from "../components/WaterRippleAnimation";
import { StackNavigationProp } from "@react-navigation/stack";

type RootStackParamList = {
  NotificationDetails: { notification: any }; 
};

type NavigationProps = StackNavigationProp<RootStackParamList, 'NotificationDetails'>;

const getNotificationStyle = (notification: { read: boolean, level: string }, theme: any) => {
  if (notification.read) {
    return {
      backgroundColor: theme.colors.card,
      borderColor: theme.colors.border,
    };
  }

  const level = (notification.level || '').toLowerCase();
  if (level.includes('critical')) {
    return {
      backgroundColor: '#C62828', // Dark Red
      borderColor: '#B71C1C',     // Dark Red border
    };
  } else if (level.includes('danger')) {
    return {
      backgroundColor: '#E53935', // Light Red
      borderColor: '#FFCDD2',     // Light Red border
    };
  } else if (level.includes('warning') || level.includes('caution')) {
    return {
      backgroundColor: '#FFB300', // Yellow
      borderColor: '#FFF176',     // Yellow border
    };
  } else {
    return {
      backgroundColor: theme.colors.primary,
      borderColor: '#82E0AA',
    };
  }
};

const DashboardScreen = () => {
  const { theme } = useContext(ThemeContext);
  const { userReports, notifications, onRefresh: onAlertsRefresh, refreshNotifications, clearNotifications, markNotificationAsRead } = useContext(AlertContext);
  const [refreshing, setRefreshing] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const navigation = useNavigation<NavigationProps>();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (showMap) {
      await onAlertsRefresh();
    } else {
      await refreshNotifications();
    }
    setRefreshing(false);
  }, [showMap, onAlertsRefresh, refreshNotifications]);

  useFocusEffect(
    useCallback(() => {
      // The listener in context will handle updates automatically.
      // We can use this to refresh other data if needed when the screen comes into focus.
      if (showMap) {
        onAlertsRefresh();
      }
      refreshNotifications();
    }, [showMap, onAlertsRefresh, refreshNotifications])
  );

  const handleNotificationPress = (notification: any) => {
    markNotificationAsRead(notification.id);
    navigation.navigate('NotificationDetails', { notification });
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.mapToggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: !showMap ? theme.colors.primary : "transparent",
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => setShowMap(false)}
        >
          <Text
            style={{
              color: !showMap ? "#fff" : theme.colors.primary,
              fontWeight: "500",
            }}
          >
            Notifications
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: showMap ? theme.colors.primary : "transparent",
              borderColor: theme.colors.primary,
            },
          ]}
          onPress={() => setShowMap(true)}
        >
          <Text
            style={{
              color: showMap ? "#fff" : theme.colors.primary,
              fontWeight: "500",
            }}
          >
            Community Reports
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.alertSummary}>
        <Text style={[styles.alertSummaryText, { color: theme.colors.text }]}>
          {!showMap
            ? `${notifications.length} new notifications`
            : `${userReports.length} community reports in your area`}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle={
          theme.colors.background === "#1E90FF"
            ? "light-content"
            : "dark-content"
        }
      />
      <WaterRippleAnimation count={5} />
      {renderHeader()}
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {showMap ? (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Community Reports
            </Text>
            {userReports.length > 0 ? (
              userReports.map((report) => {
                let borderColor = theme.colors.caution;
                if (report.level === 'moderate') borderColor = theme.colors.moderate;
                if (report.level === 'severe') borderColor = theme.colors.severe;
                return (
                  <View
                    key={report.id}
                    style={[
                      styles.reportCard,
                      { backgroundColor: theme.colors.card, borderLeftColor: borderColor, borderLeftWidth: 6 },
                    ]}
                  >
                    <Text style={[styles.reportMessage, { color: theme.colors.text }]}>
                      {report.description}
                    </Text>
                    <Text style={[styles.reportMeta, { color: theme.colors.text }]}>Level: {report.level}</Text>
                    {report.address && <Text style={[styles.reportMeta, { color: theme.colors.text }]}>Location: {report.address}</Text>}
                    <Text style={[styles.reportMeta, { color: theme.colors.text }]}>Reported: {new Date(report.reported_at).toLocaleString()}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="information-circle"
                  size={48}
                  color={theme.colors.primary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  No community reports yet
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.alertsSection}>
             {notifications.length > 0 && (
                 <TouchableOpacity onPress={clearNotifications} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>Clear All Notifications</Text>
                </TouchableOpacity>
             )}
            {notifications.length > 0 ? (
              notifications.map((item) => {
                const itemStyle = getNotificationStyle(item, theme);
                const level = item.level || '';
                const match = level.match(/Critical|Danger|Warning/);
                const alertLevel = match ? match[0] : '';

                // Determine border for unread/read
                const borderWidth = item.read ? 6 : 12; // Thicker for unread

                return (
                  <TouchableOpacity key={item.id} onPress={() => handleNotificationPress(item)}>
                    <View
                      style={[
                        styles.reportCard,
                        {
                          backgroundColor: itemStyle.backgroundColor,
                          borderLeftColor: itemStyle.borderColor,
                          borderLeftWidth: borderWidth,
                          // Remove shadow for notification cards
                          shadowColor: undefined,
                          shadowOpacity: undefined,
                          shadowRadius: undefined,
                        },
                      ]}
                    >
                      <View style={styles.notificationHeader}>
                        <Text style={[styles.levelText, { color: item.read ? theme.colors.text : '#FFFFFF' }]}>
                          Alert Level: {alertLevel}
                        </Text>
                        {!item.read && <View style={styles.unreadBadge} />}
                      </View>
                      <Text style={[styles.reportMessage, { color: item.read ? theme.colors.text : '#FFFFFF' }]}>
                        {item.message}
                      </Text>
                      <Text style={[styles.reportMeta, { color: item.read ? theme.colors.text : '#EAECEE' }]}>
                        Received: {new Date(item.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-off-outline"
                  size={60}
                  color={theme.colors.primary}
                />
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  You have no new notifications
                </Text>
                <Text
                  style={[styles.emptySubtext, { color: theme.colors.text }]}
                >
                  Pull down to refresh
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    padding: 16,
  },
  alertSummary: {
    marginBottom: 8,
  },
  alertSummaryText: {
    fontSize: 16,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  alertsSection: {
    paddingBottom: 16,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "500",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.7,
    textAlign: "center",
  },
  reportCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reportMessage: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  reportMeta: {
    fontSize: 12,
    opacity: 0.8,
  },
  unreadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3498DB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mapToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  clearButton: {
    marginHorizontal: 16,
    marginBottom: 10,
    alignItems: 'flex-end',
  },
  clearButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: '500',
  }
});

export default DashboardScreen;
