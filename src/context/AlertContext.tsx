"use client"

import { createContext, useState, type ReactNode, useEffect, useCallback } from "react"
import { getFloodReports, reportFlood as reportFloodAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { navigate } from '../navigation/NavigationService';

const NOTIFICATIONS_STORAGE_KEY = 'push_notifications';

type Location = {
  latitude: number
  longitude: number
  address?: string
}

export type AlertLevel = "caution" | "moderate" | "severe"

export type FloodAlert = {
  id: string
  title: string
  description: string
  level: AlertLevel
  location: Location
  timestamp: Date
}

export interface StoredNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  level: 'Critical' | 'Danger' | 'Warning' | string;
}

export type UserReport = {
  id: number;
  latitude: number;
  longitude: number;
  address?: string;
  level: AlertLevel;
  description: string;
  reported_at: string; 
  status: 'En-route' | 'On-site' | 'Available';
};

export type EmergencyVehicle = {
  id: string;
  name: string;
  type: string;
  location: Location;
  status: 'En-route' | 'On-site' | 'Available';
};

export type AlertContextType = {
  alerts: FloodAlert[]
  floodedAreas: {
    location: Location
    level: AlertLevel
  }[]
  userReports: UserReport[]
  emergencyVehicles: EmergencyVehicle[]
  notifications: StoredNotification[]
  addAlert: (alert: Omit<FloodAlert, "id" | "timestamp">) => void
  reportFlood: (location: Location, level: AlertLevel, description: string) => Promise<void>
  clearFloodAlerts: () => void
  onRefresh: () => Promise<void>
  refreshNotifications: () => Promise<void>
  clearNotifications: () => Promise<void>
  markNotificationAsRead: (notificationId: string) => Promise<void>
}

export const AlertContext = createContext<AlertContextType>({
  alerts: [],
  floodedAreas: [],
  userReports: [],
  emergencyVehicles: [],
  notifications: [],
  addAlert: () => {},
  reportFlood: async () => {},
  clearFloodAlerts: () => {},
  onRefresh: async () => {},
  refreshNotifications: async () => {},
  clearNotifications: async () => {},
  markNotificationAsRead: async () => {},
})

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<FloodAlert[]>([])
  const [floodedAreas, setFloodedAreas] = useState<{ location: Location; level: AlertLevel }[]>([])
  const [userReports, setUserReports] = useState<UserReport[]>([]);
  const [emergencyVehicles, setEmergencyVehicles] = useState<EmergencyVehicle[]>([])
  const [notifications, setNotifications] = useState<StoredNotification[]>([])
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);

  const fetchUserReports = useCallback(async () => {
    try {
      console.log("Fetching user flood reports...");
      const response = await getFloodReports();
      const reports = response.data.map((report: any) => ({
        ...report,
        latitude: parseFloat(report.latitude),
        longitude: parseFloat(report.longitude),
      }));
      setUserReports(reports);
      console.log(`Successfully fetched ${reports.length} user reports.`);
    } catch (error) {
      console.error("Failed to fetch user reports:", error);
    }
  }, []);

  const processAndStoreNotification = async (notification: Notifications.Notification): Promise<StoredNotification[]> => {
    console.log("Processing notification:", notification.request.identifier);
    const { _body, timestamp, level } = notification.request.content.data || {};

    const newNotification: StoredNotification = {
      id: notification.request.identifier,
      message: _body || notification.request.content.body || 'No message',
      timestamp: timestamp || new Date().toISOString(),
      read: false,
      level: level || 'Warning',
    };

    const existingNotificationsJSON = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    const allNotifications = existingNotificationsJSON ? JSON.parse(existingNotificationsJSON) : [];
    if (allNotifications.some((n: StoredNotification) => n.id === newNotification.id)) {
      console.log("Duplicate notification detected, skipping.", newNotification.id);
      return allNotifications;
    }
    allNotifications.unshift(newNotification);
    await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(allNotifications));
    return allNotifications;
  };

  const loadNotificationsFromStorage = useCallback(async () => {
    try {
      const storedNotifications = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      }
    } catch (e) {
      console.error("Failed to load notifications from storage:", e);
    }
    setNotificationsLoaded(true);
  }, []);

  useEffect(() => {
    // Initial load from storage
    loadNotificationsFromStorage();
    fetchUserReports();

    // Listener for notifications that arrive while the app is in the foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log("Foreground notification received");
      const updatedNotifications = await processAndStoreNotification(notification);
      setNotifications(updatedNotifications);
    });

    // Listener for when a user taps on a notification (works when app is foregrounded, backgrounded, or killed)
    const backgroundSubscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      console.log("Background notification tapped");
      const updatedNotifications = await processAndStoreNotification(response.notification);
      setNotifications(updatedNotifications);
      // Navigate to details
      const { _body, timestamp, level } = response.notification.request.content.data || {};
      const notificationObj = {
        id: response.notification.request.identifier,
        message: _body || response.notification.request.content.body || 'No message',
        timestamp: timestamp || new Date().toISOString(),
        read: false,
        level: level || 'Warning',
      };
      navigate('NotificationDetails', { notification: notificationObj });
    });
    
    // Check if the app was launched from a notification
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response) {
        console.log("App launched from notification");
        processAndStoreNotification(response.notification).then(updatedNotifications => {
          setNotifications(updatedNotifications);
          // Navigate to details
          const { _body, timestamp, level } = response.notification.request.content.data || {};
          const notificationObj = {
            id: response.notification.request.identifier,
            message: _body || response.notification.request.content.body || 'No message',
            timestamp: timestamp || new Date().toISOString(),
            read: false,
            level: level || 'Warning',
          };
          navigate('NotificationDetails', { notification: notificationObj });
        });
      }
      setNotificationsLoaded(true);
    });

    // Mock flooded areas
    setFloodedAreas([
      { location: { latitude: 37.7749, longitude: -122.4194 }, level: "severe" },
      { location: { latitude: 37.7833, longitude: -122.4167 }, level: "moderate" },
      { location: { latitude: 37.8025, longitude: -122.4382 }, level: "caution" },
      { location: { latitude: 37.7923, longitude: -122.4102 }, level: "moderate" },
      { location: { latitude: 37.7899, longitude: -122.4303 }, level: "caution" },
    ])

    // For demonstration, we'll use static mock data.
    const mockEmergencyVehicles: EmergencyVehicle[] = [
      {
        id: '1',
        name: 'Vehicle 1',
        type: 'Rescue 1',
        location: {
          latitude: 15.02773, // SM Downtown San Fernando
          longitude: 120.69239,
        },
        status: 'En-route',
      },
      {
        id: '2',
        name: 'Vehicle 2',
        type: 'Rescue 2',
        location: {
          latitude: 15.0218, // Sta. Lucia, San Fernando
          longitude: 120.6890,
        },
        status: 'On-site',
      },
    ];
    setEmergencyVehicles(mockEmergencyVehicles);
    
    return () => {
      Notifications.removeNotificationSubscription(foregroundSubscription);
      Notifications.removeNotificationSubscription(backgroundSubscription);
    };
  }, [fetchUserReports, loadNotificationsFromStorage])

  const addAlert = (alert: Omit<FloodAlert, "id" | "timestamp">) => {
    const newAlert: FloodAlert = {
      ...alert,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setAlerts((prev) => [newAlert, ...prev])
  }

  const reportFlood = async (location: Location, level: AlertLevel, description: string) => {
    try {
      console.log("Submitting new flood report:", { location, level, description });
      const reportData = {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        level,
        description,
      };
      await reportFloodAPI(reportData);
      await fetchUserReports();
      console.log("Flood report submitted and reports refreshed.");
    } catch (error) {
      console.error("Failed to submit flood report:", error);
    }
  };

  const clearFloodAlerts = () => {
    setAlerts([]);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const newNotifications = notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      setNotifications(newNotifications);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(newNotifications));
    } catch (e) {
      console.error("Failed to mark notification as read:", e);
    }
  };

  const clearNotifications = async () => {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      setNotifications([]);
    } catch (e) {
      console.error("Failed to clear notifications:", e);
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        floodedAreas,
        userReports,
        emergencyVehicles,
        notifications,
        addAlert,
        reportFlood,
        clearFloodAlerts,
        onRefresh: fetchUserReports,
        refreshNotifications: loadNotificationsFromStorage,
        clearNotifications,
        markNotificationAsRead,
      }}
    >
      {notificationsLoaded ? children : null}
    </AlertContext.Provider>
  )
}
