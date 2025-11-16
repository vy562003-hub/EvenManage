import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { Redirect } from "expo-router";

export default function Index() {
  const navigation = useNavigation();
 

  return (
     <Redirect href="/LoginScreen" />
  );
}
