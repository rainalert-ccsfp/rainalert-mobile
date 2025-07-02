import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const NotificationDetailsScreen = () => {
  const route = useRoute();
  const { notification } = route.params as { notification: { id: string; message: string; timestamp: string; read: boolean } };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Ionicons name="notifications-circle-outline" size={60} color="#007BFF" />
          <Text style={styles.title}>Notification Details</Text>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.message}>{notification.message}</Text>
        </View>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={20} color="#555" />
            <Text style={styles.metaText}>
              Received on: {new Date(notification.timestamp).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={20} color="#555" />
            <Text style={styles.metaText}>
              At: {new Date(notification.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  message: {
    fontSize: 18,
    lineHeight: 26,
    color: '#34495E',
  },
  metaContainer: {
    marginTop: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#555',
  },
});

export default NotificationDetailsScreen;
