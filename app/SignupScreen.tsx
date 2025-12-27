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
import registerForPushNotificationsAsync from "@/utils/notificationSetup";

const savetoken = process.env.EXPO_PUBLIC_SAVE_TOKEN;
const localsavetoken = process.env.EXPO_PUBLIC_SAVE_TOKEN_LOCAL;
const SIGN_UP = process.env.EXPO_PUBLIC_SIGN_UP_LOCAL;
const API_BASE = process.env.EXPO_PUBLIC_API_URL;

/* ============================
   SAVE PUSH TOKEN
============================ */
async function saveTokenToBackend(token: string, userId: string) {
  try {
    const response = await fetch(`${localsavetoken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId, token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data?.error };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

const registerNotify = async (userId: string) => {
  const token: any = await registerForPushNotificationsAsync();
  if (token) {
    await saveTokenToBackend(token, userId);
  }
};

/* ============================
   SIGNUP SCREEN
============================ */
export default function SignupScreen() {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔥 ROLE SELECTION
  const [userType, setUserType] = useState<"customer" | "organizer">(
    "customer"
  );

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const response = await fetch(`${SIGN_UP}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          userType, // ✅ customer OR organizer
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      Alert.alert("Success", "Account created successfully!");

      // 🔔 Register push notification token
      await registerNotify(data.user);

      navigation.navigate("LoginScreen" as never);
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

          {/* NAME */}
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            style={inputStyle}
            value={name}
            onChangeText={setName}
          />

          {/* EMAIL */}
          <TextInput
            placeholder="Email"
            placeholderTextColor="#9ca3af"
            style={inputStyle}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          {/* PASSWORD */}
          <TextInput
            placeholder="Password"
            placeholderTextColor="#9ca3af"
            secureTextEntry
            style={inputStyle}
            value={password}
            onChangeText={setPassword}
          />

          {/* ROLE SELECTION */}
          <Text
            style={{
              color: "#e5e7eb",
              fontSize: 16,
              marginBottom: 10,
              fontWeight: "600",
            }}
          >
            Join as
          </Text>

          <View
            style={{
              flexDirection: "row",
              backgroundColor: "rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 4,
              marginBottom: 20,
            }}
          >
            <RoleButton
              label="Customer"
              active={userType === "customer"}
              onPress={() => setUserType("customer")}
            />
            <RoleButton
              label="Organizer"
              active={userType === "organizer"}
              onPress={() => setUserType("organizer")}
            />
          </View>

          {/* SIGNUP BUTTON */}
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

          {/* LOGIN LINK */}
          <TouchableOpacity
            onPress={() => navigation.navigate("LoginScreen" as never)}
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

/* ============================
   SMALL REUSABLE COMPONENTS
============================ */
const inputStyle = {
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 12,
  fontSize: 16,
  marginBottom: 14,
};

function RoleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: active ? "#3b82f6" : "transparent",
        alignItems: "center",
      }}
    >
      <Text style={{ color: "white", fontWeight: "600" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
