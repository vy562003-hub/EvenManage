import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppSelector } from "@/store/hooks";

// Get from backend or AsyncStorage in real app
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const USER_ID = process.env.EXPO_PUBLIC_USER_ID_LOCAL;
console.log(USER_ID,'USER,ID');


export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const UserID= useAppSelector((state) => state.user.userId);
  const user = useAppSelector((state) => state.user.userdata);
  const [loading, setLoading] = useState(true);

  

  
  /* // LOADING STATE
  if (loading || !user) {
    return (
      <View
        style={[
          styles.center,
          {  paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }
 */
  return (
    <View
      style={[
        styles.container,
        {  paddingBottom: insets.bottom },
      ]}
    >
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
            `${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${user.profilePic}` ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png" +
                "?t=" +
                Date.now(),
          }}
          style={styles.profileImage}
        />

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <Text style={styles.phone}>{user.phone}</Text>
      </View>

      {/* BUTTONS */}
      <View style={styles.btnContainer}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() =>
            router.push({
              pathname: "/User/EditProfile",
              params: { id: UserID },
            })
          }
        >
          <Text style={styles.btnPrimaryText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/User/History")}
        >
          <Text style={styles.btnSecondaryText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnLogout}
          onPress={() => {
            router.replace("/LoginScreen");
          }}
        >
          <Text style={styles.btnLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },

  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 15,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
  },

  email: {
    color: "#444",
    marginTop: 4,
  },

  phone: {
    color: "#444",
    marginTop: 2,
  },

  btnContainer: {
    marginTop: 20,
  },

  btnPrimary: {
    backgroundColor: "#0a7d28",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  btnSecondary: {
    backgroundColor: "#0077ff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    alignItems: "center",
  },
  btnSecondaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  btnLogout: {
    backgroundColor: "#d9534f",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnLogoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
