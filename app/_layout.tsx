import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
            },
          }}
        >
          <Stack.Screen name="User" />
          <Stack.Screen name="Organizer" />
          <Stack.Screen name="LoginScreen" />
          <Stack.Screen name="ChatScreen" />
          
        </Stack>

        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </Provider>
    </SafeAreaProvider>
  );
}
