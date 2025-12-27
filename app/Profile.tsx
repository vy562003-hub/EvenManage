import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

// Get from backend or AsyncStorage in real app
const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const USER_ID =process.env.EXPO_PUBLIC_USER_ID_LOCAL;


export default function ProfileScreen() {

  const [UserID,setUserID] = useState();



  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  
  const getuser = async () => {
    try {
      
      console.log(USER_ID,"USERID");
      
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
      setUserID(data.userId)
      console.log(data.userId)

      console.log(UserID,'UserID');
      

      Alert.alert("User ID", data.userId);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {

        await getuser();
        console.log(`${API_BASE}/${UserID}`,"`${API_BASE}/user/${UserID}`");
        
        const res = await fetch(`${API_BASE}/${UserID}`);
        const data = await res.json();
        setUser(data);
        console.log(data,'data');
        
      } catch (err) {
        console.log(UserID,"UserID");

        console.log("Profile fetch error:", err);
        console.log(UserID);

      } finally {
        setLoading(false);
        console.log(UserID);
        
      }
    };

    fetchUser();
  }, [UserID]);

  if (loading || !user) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* PROFILE HEADER */}
      <View style={styles.header}>
        <Image
          source={{
            uri: user.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"  + "?t=" + Date.now()
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
              pathname: "/EditProfile",
              params: { id: UserID },
            })
          }
        >
          <Text style={styles.btnPrimaryText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/History")}
        >
          <Text style={styles.btnSecondaryText}>My Bookings</Text>
        </TouchableOpacity>


        <TouchableOpacity
          style={styles.btnLogout}
          onPress={() => {
            // Clear session, tokens etc.
            router.replace("/LoginScreen");
          }}
        >
          <Text style={styles.btnLogoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
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
