import React, { useContext, useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { ThemeContext } from "../context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { AuthContext } from "../context/AuthContext"

const ProfileInformationScreen = () => {
  const { theme } = useContext(ThemeContext)
  const navigation = useNavigation()
  const { user, resetPassword } = useContext(AuthContext)

  // Profile info
  const name = user?.full_name || "Juan Dela Cruz"
  const email = user?.email || "juan.delacruz@email.com"
  const status = user?.status || "Active"
  const dateJoined = user?.created_at ? new Date(user.created_at) : null
  const lastLogin = user?.updated_at ? new Date(user.updated_at) : null

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSavePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.")
      return
    }
    setLoading(true)
    try {
      await resetPassword(email, newPassword)
      Alert.alert("Success", "Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowChangePassword(false)
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelPassword = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setShowChangePassword(false)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#e3f2fd', flex: 1 }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={theme.colors.primary} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.outerCenterContainer} keyboardShouldPersistTaps="handled">
        <View style={[styles.profileCard, { backgroundColor: theme.colors.primary }]}> 
          <View style={styles.profilePicContainer}>
            <View style={styles.profilePicCircle}>
              <Ionicons name="person" size={64} color={theme.colors.primary} />
            </View>
          </View>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
          <View style={styles.infoRowCentered}>
            <Text style={styles.infoLabelCentered}>Status:</Text>
            <Text style={styles.infoValueCentered}>{status}</Text>
          </View>
          <View style={styles.infoRowCentered}>
            <Text style={styles.infoLabelCentered}>Date Joined:</Text>
            <Text style={styles.infoValueCentered}>{dateJoined ? dateJoined.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</Text>
          </View>
          <View style={styles.infoRowCentered}>
            <Text style={styles.infoLabelCentered}>Last Login:</Text>
            <Text style={styles.infoValueCentered}>{lastLogin ? `${lastLogin.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}  ${lastLogin.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}` : 'N/A'}</Text>
          </View>

          {/* Change Password Collapsible Section */}
          <TouchableOpacity style={styles.changePasswordButton} onPress={() => setShowChangePassword((v) => !v)}>
            <Ionicons name="key" size={20} color="#fff" />
            <Text style={styles.changePasswordButtonText}>Change Password</Text>
            <Ionicons name={showChangePassword ? "chevron-up" : "chevron-down"} size={20} color="#fff" style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          {showChangePassword && (
            <View style={[styles.changePasswordCard, { backgroundColor: theme.colors.primary }]}> 
              <Text style={styles.changePasswordTitle}>Change Password</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.primary }]}
                  placeholder="Current Password"
                  placeholderTextColor={theme.colors.primary}
                  secureTextEntry={!showPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.primary }]}
                  placeholder="New Password"
                  placeholderTextColor={theme.colors.primary}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={[styles.input, { color: theme.colors.primary }]}
                  placeholder="Confirm New Password"
                  placeholderTextColor={theme.colors.primary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
              <View style={styles.buttonRow}>
                <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: '#fff', opacity: loading ? 0.6 : 1 }]} onPress={handleSavePassword} disabled={loading}>
                  <Ionicons name="save-outline" size={20} color={theme.colors.primary} />
                  <Text style={[styles.buttonText, { color: theme.colors.primary }]}>{loading ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.cancelButton, { borderColor: '#fff', backgroundColor: 'transparent' }]} onPress={handleCancelPassword}>
                  <Ionicons name="close-outline" size={20} color="#fff" />
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  outerCenterContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 32,
  },
  backButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    padding: 8,
  },
  profileCard: {
    width: 320,
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1976d2',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: '#2196F3',
  },
  profilePicContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    width: '100%',
  },
  profilePicCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    color: '#fff',
    letterSpacing: 0.5,
  },
  profileEmail: {
    fontSize: 15,
    color: '#e3f2fd',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.2,
  },
  infoRowCentered: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 14,
    width: '100%',
  },
  infoLabelCentered: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
  },
  infoValueCentered: {
    fontSize: 16,
    color: '#b3e5fc',
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 2,
  },
  changePasswordButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 18,
    marginBottom: 0,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  changePasswordButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  changePasswordCard: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    marginTop: 18,
    alignItems: 'center',
    shadowColor: '#1976d2',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 2,
  },
  changePasswordTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 6,
    textAlign: 'left',
  },
  input: {
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 2,
    paddingRight: 40,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 36,
    padding: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginLeft: 8,
  },
  saveButton: {
    backgroundColor: '#fff',
  },
  cancelButton: {
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
})

export default ProfileInformationScreen 