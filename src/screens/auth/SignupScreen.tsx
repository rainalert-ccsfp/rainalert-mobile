import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
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

const { width, height } = Dimensions.get("window");

const SignupScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { register } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waterFillPercentage, setWaterFillPercentage] = useState(0);

  useEffect(() => {
    setWaterFillPercentage(50);
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await register(name, email, password);
      
      // Show success message and navigate to login
      Alert.alert(
        "Account Created",
        "Your account has been created successfully. Please log in.",
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login" as never),
          },
        ]
      );
    } catch (err: any) {
      setError(err.message || "Failed to create account");
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
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.contentContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, { color: "#ffffff" }]}>
              Create Account
            </Text>
            <Text style={[styles.headerSubtitle, { color: "#ffffff" }]}>
              Sign up to get started with RainAlert
            </Text>
          </View>

          <View>
            {error ? (
              <View
                style={[
                  styles.errorContainer,
                  { backgroundColor: `${theme.colors.notification}20` },
                ]}
              >
                <Text
                  style={[
                    styles.errorText,
                    { color: theme.colors.notification },
                  ]}
                >
                  {error}
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.formContainer,
                { backgroundColor: `rgba(13, 71, 161, 0.7)` },
              ]}
            >
              <Input
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                leftIcon="person-outline"
                labelStyle={{ color: "#ffffff" }}
                inputStyle={{ color: "#ffffff" }}
              />

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
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                labelStyle={{ color: "#ffffff" }}
                inputStyle={{ color: "#ffffff" }}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                labelStyle={{ color: "#ffffff" }}
                inputStyle={{ color: "#ffffff" }}
              />

              <Button
                title="Sign Up"
                onPress={handleSignup}
                loading={loading}
                style={{ backgroundColor: "#1976D2" }}
              />
            </View>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: "#ffffff" }]}>
                Already have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Login" as never)}
              >
                <Text style={[styles.loginLink, { color: "#90CAF9" }]}>
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  contentContainer: { flex: 1, padding: 24, justifyContent: "center" },
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
  headerContainer: { marginBottom: 32, alignItems: "center" },
  headerTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 5 },
  headerSubtitle: { fontSize: 16, textAlign: "center" },
  errorContainer: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: "center" },
  formContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 16,
  },
  loginText: { fontSize: 14 },
  loginLink: { fontSize: 14, fontWeight: "bold", marginLeft: 4 },
});

export default SignupScreen;
