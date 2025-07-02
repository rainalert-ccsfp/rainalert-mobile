import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const TermsOfServiceScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#2196F3" />
      </TouchableOpacity>
      <View style={styles.header}><Text style={styles.headerText}>Terms of Service</Text></View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>These are the placeholder Terms of Service. Please update with your actual terms.</Text>
          <Text style={styles.sectionTitle}>2. User Responsibilities</Text>
          <Text style={styles.text}>Users must use the app responsibly and follow all applicable laws.</Text>
          <Text style={styles.sectionTitle}>3. Data Usage</Text>
          <Text style={styles.text}>We respect your privacy and handle your data according to our Privacy Policy.</Text>
          <Text style={styles.sectionTitle}>4. Changes</Text>
          <Text style={styles.text}>We may update these terms at any time. Continued use of the app means you accept the new terms.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
    marginTop: 8,
    marginLeft: 8,
    marginBottom: 0,
    alignSelf: 'flex-start',
    padding: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  contentContainer: {
    alignItems: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#1976d2',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginTop: 16,
    marginBottom: 4,
  },
  text: {
    fontSize: 15,
    color: '#222',
    marginBottom: 8,
    lineHeight: 22,
  },
});

export default TermsOfServiceScreen; 