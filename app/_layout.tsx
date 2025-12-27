import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Provider } from "react-redux";
import { store } from '../store';


export const unstable_settings = {
  anchor: '(tabs)',
};



export default function RootLayout() {
  const colorScheme = useColorScheme();
  

  return (
    <ThemeProvider value={colorScheme === 'light' ? DarkTheme : DefaultTheme} children={undefined}>
      <Provider store={store}>
      <Stack>
        {/* <Stack.Screen name="SignupScreen"  /> */}
        <Stack.Screen name="LoginScreen"  />
        
      </Stack>
      <StatusBar style="auto" />
      </Provider>
    </ThemeProvider>
  );
}


