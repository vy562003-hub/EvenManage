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

// Get from backend or AsyncStorage in real app
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const USER_ID = process.env.EXPO_PUBLIC_USER_ID_LOCAL;

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [UserID, setUserID] = useState<any>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getuser = async () => {
    try {
      const response = await fetch(`${USER_ID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed");
      }

      const data = await response.json();
      setUserID(data.userId);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await getuser();

        if (!UserID) return;

        const res = await fetch(`${API_BASE}/${UserID}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.log("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [UserID]);

  // LOADING STATE
  if (loading || !user) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri:
              user.profilePic ||
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
              pathname: "User/EditProfile",
              params: { id: UserID },
            })
          }
        >
          <Text style={styles.btnPrimaryText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("User/History")}
        >
          <Text style={styles.btnSecondaryText}>My Bookings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnLogout}
          onPress={() => {
            router.replace("LoginScreen");
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
