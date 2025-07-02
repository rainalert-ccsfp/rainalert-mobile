import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";

export async function registerForPushNotificationsAsync(userId) {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      // alert("Failed to get push token!");
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;

    // Show the token for debugging
    // alert('Expo Push Token: ' + token);

    try {
      // Send token to backend
      const response = await axios.post(
        "http://192.168.1.17:5000/api/mob_app_users/save-token",
        { userId, token }
      );
      // alert('Token sent! Response: ' + JSON.stringify(response.data));
    } catch (e) {
      // alert('Failed to send token: ' + e.message);
    }
  } else {
    // alert("Must use physical device for Push Notifications");
  }

  return token;
}
