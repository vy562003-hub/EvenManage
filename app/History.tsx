import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { useRouter } from "expo-router";
import { useNavigation } from "expo-router";
import { useAppSelector ,useAppDispatch} from "@/store/hooks";
import {fetchBookingHistory}  from '@/store/slices/BookingSlice'

const API_BASE = process.env.EXPO_PUBLIC_API_URL_BOOKINGS_CUSTOMER;


export default function BookingHistoryScreen() {
   const dispatch = useAppDispatch();
    const [UserID,setUserID] = useState(useAppSelector((state) => (state.user.userId)));

  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // TODO: Replace with actual logged-in customer ID from context/session

  useEffect(() => {
    const fetchBookings = async () => {
        
      try {
        const res = await dispatch(fetchBookingHistory(UserID)).unwrap();
        console.log(res,'history res');
        
        setBookings(res || []);
      } catch (err) {
        console.log("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [dispatch]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  if (bookings.length === 0) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.noData}>No bookings yet</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => <BookingCard booking={item} router={router} />}
      />
    </SafeAreaView>
  );
}

function BookingCard({ booking, router }: any) {
  const nav = useNavigation();

    const organizer = booking.organizerId;
    const total = booking.services.reduce((sum: number, s: any) => sum + s.price, 0);
  
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{organizer.name}</Text>
  
        <Text style={styles.date}>Date: {new Date(booking.date).toDateString()}</Text>
  
        <Text style={styles.services}>
          Services: {booking.services.map((s: any) => s.name).join(", ")}
        </Text>
  
        <Text style={styles.total}>Total: ₹{total}</Text>
  
        <Text style={[styles.status, getStatusStyle(booking.status)]}>
          {booking.status.toUpperCase()}
        </Text>
  
        {/* ⭐ CHAT BUTTON HERE */}
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>{
            nav.navigate('ChatScreen',{receiverId:organizer._id , receiverName:organizer.name})
            }
          }
        >
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
      </View>
    );
  }
  

function getStatusStyle(status: string) {
  switch (status) {
    case "pending":
      return { color: "#d97706" };
    case "confirmed":
      return { color: "#0a7d28" };
    case "cancelled":
      return { color: "red" };
    case "completed":
      return { color: "#1d4ed8" };
    default:
      return {};
  }
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
  },
  noData: {
    fontSize: 18,
    color: "#888",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  date: { marginTop: 6, color: "#444" },
  services: { marginTop: 4, color: "#555" },
  total: {
    marginTop: 6,
    fontWeight: "600",
    color: "#0a7d28",
  },
  status: {
    marginTop: 6,
    fontWeight: "700",
  },
  viewBtn: {
    marginTop: 12,
    backgroundColor: "#0077ff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  viewText: {
    color: "#fff",
    fontWeight: "600",
  },
  chatBtn: {
    marginTop: 12,
    backgroundColor: "#0077ff",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  chatText: {
    color: "#fff",
    fontWeight: "600",
  },
  
});
