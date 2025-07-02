import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import Input from "../../components/Input";
import Button from "../../components/Button";
import EnhancedWaterAnimation from "../../components/EnhancedWaterAnimation";
import { registerForPushNotificationsAsync } from "../../utils/notifications";

const { width, height } = Dimensions.get("window");

const LoginScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const { login, isAuthenticated, user } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [waterFillPercentage, setWaterFillPercentage] = useState(0);

  useEffect(() => {
    setWaterFillPercentage(40);
  }, []);

  useEffect(() => {
    const registerToken = async () => {
      if (isAuthenticated && user && user.id) {
        try {
          await registerForPushNotificationsAsync(user.id);
          console.log("Push notification token registration attempted for user:", user.id);
        } catch (e) {
          console.error("Push notification registration failed:", e);
          // Optionally, show an alert to the user
          // Alert.alert("Could not enable notifications", "Please try again later.");
        }
      }
    };
    registerToken();
  }, [isAuthenticated, user]);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        setError("Please enter both email and password");
        return;
      }

      setLoading(true);
      setError("");
      await login(email, password);

    } catch (err: any) {
      setError(err.message || "Invalid email or password");
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
          <View style={styles.headerContainer}>
            <Text style={[styles.appName, { color: "#ffffff" }]}>
              RainAlert
            </Text>
            <Text style={[styles.tagline, { color: "#ffffff" }]}>
              Stay safe during floods
            </Text>
          </View>

          <View style={styles.formWrapper}>
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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                leftIcon="lock-closed-outline"
                rightIcon={showPassword ? "eye-off-outline" : "eye-outline"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                labelStyle={{ color: "#ffffff" }}
                inputStyle={{ color: "#ffffff" }}
              />

              <View style={styles.rememberForgotContainer}>
                <View style={styles.rememberMeContainer}>
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{
                      false: "#D9D9D9",
                      true: `${theme.colors.primary}80`,
                    }}
                    thumbColor={rememberMe ? theme.colors.primary : "#f4f3f4"}
                  />
                  <Text style={[styles.rememberMeText, { color: "#ffffff" }]}>
                    Remember me
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate("ForgotPassword" as never)}
                >
                  <Text
                    style={[styles.forgotPasswordText, { color: "#90CAF9" }]}
                  >
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <Button
                title="Login"
                onPress={handleLogin}
                loading={loading}
                style={{ backgroundColor: "#1976D2" }}
              />
            </View>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: "#ffffff" }]}>
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup" as never)}
              >
                <Text style={[styles.signupLink, { color: "#90CAF9" }]}>
                  Sign Up
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
  contentContainer: { flex: 1, justifyContent: "center", padding: 24 },
  headerContainer: { alignItems: "center", marginBottom: 27 },
  appName: { fontSize: 36, fontWeight: "bold" },
  tagline: { fontSize: 18, marginTop: 5 },
  formWrapper: { width: "100%" },
  errorContainer: { padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { fontSize: 14, textAlign: "center" },
  formContainer: {
    marginBottom: 5,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  rememberForgotContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  rememberMeContainer: { flexDirection: "row", alignItems: "center" },
  rememberMeText: { marginLeft: 8, fontSize: 14 },
  forgotPasswordText: { fontSize: 14, fontWeight: "500" },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 16,
  },
  signupText: { fontSize: 14 },
  signupLink: { fontSize: 14, fontWeight: "bold", marginLeft: 4 },
});

export default LoginScreen;
