"use client";

import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import EnhancedWaterAnimation from "../../components/EnhancedWaterAnimation";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { forgotPassword, resetPassword } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [waterFillPercentage, setWaterFillPercentage] = useState(0);

  useEffect(() => {
    setWaterFillPercentage(35);
  }, []);

  const handleReset = async () => {
    if (!email || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email);
      await resetPassword(email, newPassword);
      Alert.alert("Success", "Password reset successfully!");
      navigation.navigate("Login" as never);
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <EnhancedWaterAnimation
        fillPercentage={waterFillPercentage}
        duration={8000}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <Text style={[styles.title, { color: "#ffffff" }]}>
            Reset Password
          </Text>
          <Text style={[styles.subtitle, { color: "#E3F2FD" }]}>
            Please enter your email and set a new password.
          </Text>

          <View
            style={[
              styles.formContainer,
              { backgroundColor: `rgba(13, 71, 161, 0.7)` },
            ]}
          >
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail-outline"
              labelStyle={{ color: "#ffffff" }}
              inputStyle={{ color: "#ffffff" }}
            />

            <Input
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              labelStyle={{ color: "#ffffff" }}
              inputStyle={{ color: "#ffffff" }}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              leftIcon="lock-closed-outline"
              labelStyle={{ color: "#ffffff" }}
              inputStyle={{ color: "#ffffff" }}
            />

            <Button
              title="Reset Password"
              onPress={handleReset}
              loading={loading}
              style={{ backgroundColor: theme.colors.primary, marginTop: 20 }}
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={{ color: "#ffffff" }}>Remember your password?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Login" as never)}
            >
              <Text style={[styles.loginLink, { color: "#90CAF9" }]}>
                {" "}
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    paddingTop: 60,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
  },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default ForgotPasswordScreen;
