"use client";

import { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";

// Developer profile images
const DEV_IMAGES = {
  remzlyn: require("../../assets/developer1.jpg"),
  jerson: require("../../assets/developer2.jpg"),
};

// FAQ data structure
type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    id: "faq1",
    question: "How does RainAlert detect floods?",
    answer:
      "RainAlert uses a IoT sensors placed in strategic locations to monitor water levels. This data is analyzed in real-time to monitor and detect flooding conditions.",
  },
  {
    id: "faq2",
    question: "How accurate are the flood alerts?",
    answer:
      "Our system combines real-time sensor data with historical flooding patterns to provide highly accurate alerts. The system is continuously improved based on feedback and actual flood events.",
  },
  {
    id: "faq3",
    question: "What should I do when I receive a flood alert?",
    answer:
      "When you receive an alert, check the severity level and follow the recommended actions. For severe alerts, consider evacuating to higher ground or designated evacuation centers. Always follow instructions from local authorities.",
  },
  {
    id: "faq4",
    question: "Can I report flooding in my area?",
    answer:
      "Yes! You can use the 'Report Flood' feature in the app to submit information about flooding in your area. Your reports help us improve our detection system and alert other users in real-time.",
  },
  {
    id: "faq5",
    question: "How can I track emergency vehicles?",
    answer:
      "The 'Track Emergency Vehicles' feature shows the location of rescue vehicles that responds to flood emergencies. This can help you locate the nearest assistance during emergencies.",
  },
];

const HelpScreen = () => {
  const { theme } = useContext(ThemeContext);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [animatedValues] = useState<{ [key: string]: Animated.Value }>(() => {
    const values: { [key: string]: Animated.Value } = {};
    faqs.forEach((faq) => {
      values[faq.id] = new Animated.Value(0);
    });
    return values;
  });

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const toggleFaq = (id: string) => {
    // Close currently expanded FAQ if clicking on a different one
    if (expandedFaq && expandedFaq !== id) {
      Animated.timing(animatedValues[expandedFaq], {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }

    // Toggle the selected FAQ
    Animated.timing(animatedValues[id], {
      toValue: expandedFaq === id ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setExpandedFaq(expandedFaq === id ? null : id);
  };

  const getMaxHeight = (id: string) => {
    return animatedValues[id].interpolate({
      inputRange: [0, 1],
      outputRange: [0, 500], // Maximum height for the answer
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* About RainAlert Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            About RainAlert
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.text }]}>
            RainAlert: Real-Time Flood Monitoring and Notification System is an
            innovative solution designed to enhance community safety and
            preparedness in flood-prone areas like the City of San Fernando,
            Pampanga.
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.text }]}>
            Developed with modern IoT technology, RainAlert continuously
            monitors rainfall and water levels, analyzes real-time data, and
            provides instant flood notifications to residents and local
            authorities.
          </Text>
        </View>

        {/* Mission & Vision Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Our Mission
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.text }]}>
            To provide real-time, reliable, and accessible flood monitoring and
            alert solutions through innovative IoT technology, ensuring the
            safety, preparedness, and informed decision-making of communities in
            flood-prone areas.
          </Text>

          <Text
            style={[
              styles.sectionTitle,
              { color: theme.colors.text, marginTop: 16 },
            ]}
          >
            Our Vision
          </Text>
          <Text style={[styles.sectionText, { color: theme.colors.text }]}>
            To become a leading platform in disaster risk reduction, empowering
            communities with smart, data-driven tools that foster resilience,
            save lives, and build a safer and more sustainable future for all.
          </Text>
        </View>

        {/* Developers Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Meet Our Developers
          </Text>
          <View style={styles.developerCard}>
            <Image source={DEV_IMAGES.remzlyn} style={styles.developerPhoto} />
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>Remzlyn Cortez</Text>
              <Text style={styles.developerRole}>
                Full-Stack Software Engineer / IoT Developer
              </Text>
              <TouchableOpacity
                onPress={() => handleEmailPress("remzlyn.cortez@gmail.com")}
              >
                <Text style={styles.developerEmail}>
                  <Ionicons name="mail-outline" size={14} />{" "}
                  remzlyn.cortez@gmail.com
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePhonePress("+639557328537")}
              >
                <Text style={styles.developerContact}>
                  <Ionicons name="call-outline" size={14} /> +63 955 732 8537
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.developerCard}>
            <Image source={DEV_IMAGES.jerson} style={styles.developerPhoto} />
            <View style={styles.developerInfo}>
              <Text style={styles.developerName}>Jerson Vergara</Text>
              <Text style={styles.developerRole}>Assistant Developer</Text>
              <TouchableOpacity
                onPress={() => handleEmailPress("jersonvergera09@gmail.com")}
              >
                <Text style={styles.developerEmail}>
                  <Ionicons name="mail-outline" size={14} />{" "}
                  jersonvergera09@gmail.com
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handlePhonePress("+639933144024")}
              >
                <Text style={styles.developerContact}>
                  <Ionicons name="call-outline" size={14} /> +63 993 314 4024
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* School Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            School
          </Text>
          <Text style={[styles.schoolName, { color: theme.colors.text }]}>
            City College of San Fernando, Pampanga
          </Text>
          <Text style={[styles.schoolAddress, { color: theme.colors.text }]}>
            San Juan, City of San Fernando, Pampanga, Philippines
          </Text>
        </View>

        {/* FAQ Section - Enhanced with dropdown functionality */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Frequently Asked Questions
          </Text>
          {faqs.map((faq) => (
            <View key={faq.id} style={styles.faqItem}>
              <TouchableOpacity
                style={styles.faqQuestion}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.faqQuestionText, { color: theme.colors.text }]}
                >
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={theme.colors.text}
                />
              </TouchableOpacity>
              <Animated.View
                style={[
                  styles.faqAnswerContainer,
                  { maxHeight: getMaxHeight(faq.id) },
                ]}
              >
                <Text style={[styles.faqAnswer, { color: theme.colors.text }]}>
                  {faq.answer}
                </Text>
              </Animated.View>
            </View>
          ))}
        </View>

        {/* Contact Support Section - Enhanced with more contact options */}
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Contact Support
          </Text>

          <View style={styles.contactOptionsContainer}>
            <TouchableOpacity
              style={[
                styles.contactOption,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
              onPress={() => handleEmailPress("support@rainalert.com")}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="mail" size={20} color="#fff" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text
                  style={[styles.contactLabel, { color: theme.colors.text }]}
                >
                  Email Support
                </Text>
                <Text
                  style={[styles.contactValue, { color: theme.colors.primary }]}
                >
                  rainalertcsfp@gmail.com
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactOption,
                { backgroundColor: theme.colors.primary + "20" },
              ]}
              onPress={() => handlePhonePress("+6328123456")}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Ionicons name="call" size={20} color="#fff" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text
                  style={[styles.contactLabel, { color: theme.colors.text }]}
                >
                  Phone Support
                </Text>
                <Text
                  style={[styles.contactValue, { color: theme.colors.primary }]}
                >
                  +63 (2) 812-3456
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.contactOption,
                { backgroundColor: theme.colors.notification + "20" },
              ]}
              onPress={() => handlePhonePress("911")}
            >
              <View
                style={[
                  styles.contactIconContainer,
                  { backgroundColor: theme.colors.notification },
                ]}
              >
                <Ionicons name="alert-circle" size={20} color="#fff" />
              </View>
              <View style={styles.contactTextContainer}>
                <Text
                  style={[styles.contactLabel, { color: theme.colors.text }]}
                >
                  Emergency Hotline
                </Text>
                <Text
                  style={[
                    styles.contactValue,
                    { color: theme.colors.notification },
                  ]}
                >
                  911
                </Text>
                <Text
                  style={[
                    styles.contactNote,
                    { color: theme.colors.text + "80" },
                  ]}
                >
                  For urgent flood emergencies
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  developerCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
  },
  developerPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  developerInfo: {
    flex: 1,
  },
  developerName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  developerRole: {
    fontSize: 14,
    marginBottom: 6,
    opacity: 0.8,
  },
  developerEmail: {
    fontSize: 14,
    marginBottom: 4,
    textDecorationLine: "underline",
  },
  developerContact: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  schoolName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    opacity: 0.8,
  },
  faqItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    borderRadius: 8,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  faqAnswerContainer: {
    overflow: "hidden",
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    paddingTop: 0,
    backgroundColor: "rgba(0,0,0,0.03)",
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  contactOptionsContainer: {
    marginBottom: 16,
  },
  contactOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  contactTextContainer: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  contactNote: {
    fontSize: 12,
  },
  groupPhoto: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: "cover",
    alignSelf: "center",
  },
});

export default HelpScreen;
