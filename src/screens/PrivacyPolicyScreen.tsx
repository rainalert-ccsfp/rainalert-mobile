import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e3f2fd' }}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="#2196F3" />
      </TouchableOpacity>
      <View style={styles.header}><Text style={styles.headerText}>Privacy Policy</Text></View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>This Privacy Policy explains how we collect, use, and protect your information when you use our app.</Text>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.text}>We may collect information you provide directly (such as your name, email, and reports) and information automatically (such as device info and usage data).</Text>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.text}>We use your information to provide and improve our services, communicate with you, and ensure the security of the app.</Text>
          <Text style={styles.sectionTitle}>4. Sharing of Information</Text>
          <Text style={styles.text}>We do not sell your personal information. We may share data with service providers or as required by law.</Text>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.text}>We implement reasonable security measures to protect your data, but no system is 100% secure.</Text>
          <Text style={styles.sectionTitle}>6. Your Choices</Text>
          <Text style={styles.text}>You may update your information or request deletion by contacting us. Some data may be retained as required by law.</Text>
          <Text style={styles.sectionTitle}>7. Children's Privacy</Text>
          <Text style={styles.text}>Our app is not intended for children under 13. We do not knowingly collect data from children under 13.</Text>
          <Text style={styles.sectionTitle}>8. Changes to This Policy</Text>
          <Text style={styles.text}>We may update this Privacy Policy. We will notify you of significant changes by updating the date or providing notice in the app.</Text>
          <Text style={styles.sectionTitle}>9. Contact Us</Text>
          <Text style={styles.text}>
            If you have questions or concerns about this Privacy Policy, please contact us at 
            <Text style={styles.emailLink} onPress={() => Linking.openURL('mailto:rainalertcsfp@gmail.com')}> rainalertcsfp@gmail.com</Text>.
          </Text>
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
  emailLink: {
    color: '#1976d2',
    textDecorationLine: 'underline',
  },
});

export default PrivacyPolicyScreen; 