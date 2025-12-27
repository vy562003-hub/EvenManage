import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet,Alert } from "react-native";
import { useRouter,useNavigation } from "expo-router";
import { useAppSelector,useAppDispatch } from "@/store/hooks";
import { fetchDashboardStats } from "@/store/slices/organizersSlice";


export default function OrganizerDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const naviagtor = useNavigation()
  const {userId:UserID}:any = useAppSelector((state) => (state.user));



  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });
 
  useEffect(() => {
    loadStats();
  }, [UserID]);

  const loadStats = async () => {
    try {
      
      const data = await  dispatch(fetchDashboardStats(UserID)).unwrap();
      console.log();

      setStats(data);
    } catch (err) {
      console.log("Dashboard error:", err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Organizer Dashboard</Text>

      <View style={styles.card}>
        <Text style={styles.stat}>Total Bookings: {stats.total}</Text>
        <Text style={styles.stat}>Pending Requests: {stats.pending}</Text>
        <Text style={styles.stat}>Completed: {stats.completed}</Text>
      </View>

      {/* Buttons */}
      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/OrganizerBookings")}
      >
        <Text style={styles.btnText}>View Booking Requests</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/organizerservices")}
      >
        <Text style={styles.btnText}>Manage Services</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => naviagtor.navigate("organizergallery")}
      >
        <Text style={styles.btnText}>Manage Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => router.push("/OrganizerProfile")}
      >
        <Text style={styles.btnText}>View Profile</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  card: {
    padding: 20,
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    marginBottom: 20,
  },
  stat: { fontSize: 18, marginVertical: 3 },
  btn: {
    backgroundColor: "#0077ff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
  },
  btnText: { color: "#fff", fontSize: 16, textAlign: "center" },
});
