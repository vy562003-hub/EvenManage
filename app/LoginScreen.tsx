import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { FireBasedatabsetesting } from "@/app/FireBasedatabsetesting";
import { useAppDispatch } from "@/store/hooks";
import { loginUser } from "@/store/slices/userSlice";

import { useRouter } from 'expo-router';
//import {LOGIN_CONNECT,USER_ID} from "@env";
interface LoginScreenProps {
  onLogin?: (userId: string) => void;
}




export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const router = useRouter();
  const dispatch = useAppDispatch()
  const LOGIN_CONNECT = process.env.EXPO_PUBLIC_LOGIN_CONNECT_LOCAL ;const USER_ID =process.env.EXPO_PUBLIC_USER_ID_LOCAL;


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  interface resp{

  }

  const handleLogin = async () => {
    try {
      console.log(LOGIN_CONNECT,USER_ID,'log metadata')
      setLoading(true);
      const response = await dispatch(loginUser({ email, password ,userType:'organizer'})).unwrap();
      
      console.log('after request');
      

      if (!response.user.name) {
        const error =  response.payload;
        throw new Error(error.error || "Login failed");
      }

      Alert.alert("Success", "Logged in successfully!");
      console.log(response,'login user data');
      if(response.user.userType ==='customer'){
        router.push("/User/Home");
      }else{
        router.push("/Organizer/organizerhome");
      }
      
      
    } catch (err: any) {
      console.log('error tab');
      
      Alert.alert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const getuser = async () => {
    try {
      const response = await fetch( `${USER_ID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed");
      }

      const data = await response.json();
      Alert.alert("User ID", data.userId);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const firebassoperation = async () => {
    await FireBasedatabsetesting("vishal", "hatt");
  };

  return (
    <LinearGradient colors={["#1e3c72", "#2a5298"]} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Login to your account</Text>

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color="#ccc" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#aaa"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color="#ccc" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              style={styles.input}
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("SignupScreen")}
            style={styles.signupBtn}
          >
            <Text style={styles.signupText}>
              Don’t have an account?{" "}
              <Text style={{ color: "#fff", fontWeight: "700" }}>Sign up</Text>
            </Text>
          </TouchableOpacity>

          <View style={styles.testButtons}>
            <TouchableOpacity onPress={getuser} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Get User</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={firebassoperation} style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>Add User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    height: 45,
    color: "#fff",
    paddingLeft: 8,
  },
  loginBtn: {
    backgroundColor: "#4f8ef7",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  loginText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  signupBtn: {
    marginTop: 18,
  },
  signupText: {
    textAlign: "center",
    color: "#ccc",
  },
  testButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  smallBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  smallBtnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 13,
  },
});
