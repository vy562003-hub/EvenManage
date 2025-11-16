import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
//import {SIGN_UP} from "@env"
const SIGN_UP = process.env.EXPO_PUBLIC_SIGN_UP;
export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${SIGN_UP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Signup failed");

      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#0f172a"]}
      style={{ flex: 1, justifyContent: "center" }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            borderRadius: 20,
            padding: 24,
            shadowColor: "#000",
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: "700",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Create Account ✨
          </Text>

          <View style={{ marginBottom: 14 }}>
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "white",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
              }}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={{ marginBottom: 14 }}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "white",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
              }}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View style={{ marginBottom: 20 }}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "white",
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 16,
              }}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSignup}
            style={{
              backgroundColor: "#3b82f6",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <Ionicons name="person-add-outline" size={20} color="white" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("LoginScreen")}
            style={{ marginTop: 18 }}
          >
            <Text
              style={{
                color: "#9ca3af",
                textAlign: "center",
                fontSize: 15,
              }}
            >
              Already have an account?{" "}
              <Text style={{ color: "#3b82f6", fontWeight: "600" }}>
                Login
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
