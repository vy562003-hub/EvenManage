import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useNavigation } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/slices/organizersSlice";

export default function OrganizerDashboard() {
  
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { userId: UserID }: any = useAppSelector((state) => state.user);

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    if (UserID) {
      loadStats();
    }
  }, [UserID]);

  const loadStats = async () => {
    try {
      const data = await dispatch(fetchDashboardStats(UserID)).unwrap();
      setStats(data);
    } catch (err) {
      console.log("Dashboard error:", err);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <Text style={styles.title}>Organizer Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.stat}>Total Bookings: {stats.total}</Text>
        <Text style={styles.stat}>Pending Requests: {stats.pending}</Text>
        <Text style={styles.stat}>Completed: {stats.completed}</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/Organizer/OrganizerBookings")}
      >
        <Text style={styles.btnText}>View Booking Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/Organizer/organizerservices")}
      >
        <Text style={styles.btnText}>Manage Services</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("Organizer/organizergallery" as never)}
      >
        <Text style={styles.btnText}>Manage Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/Organizer/OrganizerProfile")}
      >
        <Text style={styles.btnText}>View Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
  },
  card: {
    padding: 20,
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    marginBottom: 20,
  },
  stat: {
    fontSize: 18,
    marginVertical: 3,
  },
  btn: {
    backgroundColor: "#0077ff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});
