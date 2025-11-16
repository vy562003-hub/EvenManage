import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { useEffect } from 'react';
import registerForPushNotificationsAsync from "@/utils/notificationSetup"
import { db } from "@/config/firebaseConfig";


export const unstable_settings = {
  anchor: '(tabs)',
};


async function saveTokenToBackend(token: string) {
  try {
    console.log("Saving token to backend:", token);

    const response = await fetch("http://YOUR_SERVER/api/save-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // keep session cookie
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to save token:", data);
      return { success: false, error: data?.error || "Unknown error" };
    }

    console.log("Token saved successfully:", data);
    return { success: true, data };

  } catch (error) {
    console.error("Error saving token:", error);
    return { success: false, error };
  }
}
const registernotigy =  async ()=> {
  const token:any = await registerForPushNotificationsAsync();
    saveTokenToBackend(token)

}
export default function RootLayout() {
  const colorScheme = useColorScheme();
  useEffect( ()=>{
    registernotigy();
  },[]);

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* <Stack.Screen name="SignupScreen"  /> */}
        <Stack.Screen name="LoginScreen"  />
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}


