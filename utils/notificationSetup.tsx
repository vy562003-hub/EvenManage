// notificationSetup.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

export default async function registerForPushNotificationsAsync() {
  console.log("entered request noti.");
  
  let token;

  if (Device.isDevice) {
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    console.log(existingStatus,"existingStatus");
    

    if (existingStatus !== "granted") {
      console.log("in fi");

      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      alert("Failed to get push token for push notification!");
      return;
    }
    console.log('here');
    

    token = (await Notifications.getExpoPushTokenAsync({"projectId":"ab2a07fc-7d5c-4ec8-a099-968becbcf55f"})).data;
    console.log("Expo Push Token:", token);
  } else {
    alert("Must use physical device for Push Notifications");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  return token;
}
