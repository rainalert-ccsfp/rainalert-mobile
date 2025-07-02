import React, { useContext, useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from "react-native"
import { ThemeContext } from "../context/ThemeContext"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const ChangePasswordScreen = () => {
  const { theme } = useContext(ThemeContext)
  const navigation = useNavigation()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSave = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields.")
      return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match.")
      return
    }
    // Simulate password change
    Alert.alert("Success", "Password changed successfully!")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const handleCancel = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#e3f2fd', flex: 1 }]}> 
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color={theme.colors.primary} />
      </TouchableOpacity>
      <View style={styles.outerCenterContainer}>
        <View style={[styles.card, { backgroundColor: theme.colors.primary }]}> 
          <Text style={styles.title}>Change Password</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.primary }]}
              placeholder="Current Password"
              placeholderTextColor={theme.colors.primary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.primary }]}
              placeholder="New Password"
              placeholderTextColor={theme.colors.primary}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={[styles.input, { color: theme.colors.primary }]}
              placeholder="Confirm New Password"
              placeholderTextColor={theme.colors.primary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: '#fff' }]} onPress={handleSave}>
              <Ionicons name="save-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.buttonText, { color: theme.colors.primary }]}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton, { borderColor: '#fff', backgroundColor: 'transparent' }]} onPress={handleCancel}>
              <Ionicons name="close-outline" size={20} color="#fff" />
              <Text style={[styles.buttonText, { color: '#fff' }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  outerCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  backButton: {
    marginTop: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
    padding: 8,
  },
  card: {
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: 0.5,
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

export default ChangePasswordScreen 