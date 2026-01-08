import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  updateBookingStatus,
  fetchOrganizerBookings,
} from "@/store/slices/organizersSlice";

export default function OrganizerBookings() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userId, setUserId]: any = useState(
    useAppSelector((state) => state.user.userId ?? state.organizers.userId)
  );
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    if (userId) loadBookings();
  }, [userId]);

  // ----------------------------------
  // LOAD BOOKINGS
  // ----------------------------------
  const loadBookings = async () => {
    try {
      const data = await dispatch(
        fetchOrganizerBookings(userId)
      ).unwrap();
      console.log(data,'bookings');
      
      setBookings(data);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------
  // UPDATE BOOKING STATUS
  // ----------------------------------
  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await dispatch(
        updateBookingStatus({ bookingId: id, status })
      ).unwrap();

      if (!res.status) {
        Alert.alert("Error", res as any);
        return;
      }

      

      setBookings((prev: any) =>
        prev.map((b: any) => (b._id === id ? { ...b, status } : b))
      );
    } catch (err) {
      Alert.alert("Error", "Status update failed");
    }
  };

  // ----------------------------------
  // FILTER
  // ----------------------------------
  const filtered = useMemo(() => {
    if (activeFilter === "All") return bookings;
    return bookings.filter(
      (b: any) => b.status === activeFilter.toLowerCase()
    );

    
  }, [bookings, activeFilter]);

  // LOADING STATE
  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log(filtered,'filtered data');


  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>Booking Requests</Text>

      {/* FILTERS */}
      <View style={styles.filterRow}>
        {["All", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.filterChip,
              activeFilter.toLowerCase() === f && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter.toLowerCase() === f &&
                  styles.filterTextActive,
              ]}
            >
              {f.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item._id}
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            onUpdateStatus={updateStatus}
            onOpenDetails={() =>
              router.push({
                pathname: "/Organizer/OrganizerBookingDetails",
                params: { id: item._id },
              })
            }
            onChat={() =>
              router.push({
                pathname: "/ChatScreen",
                params: {
                  receiverId: item.customerId?._id,
                  receiverName: item.customerId?.name,
                },
              })
            }
          />
        )}
      />
    </View>
  );
}

// ----------------------------
// STATUS PILL
// ----------------------------
function StatusPill({ status }: { status: string }) {
  const color =
    status === "pending"
      ? "#f59e0b"
      : status === "confirmed"
      ? "#16a34a"
      : status === "completed"
      ? "#2563eb"
      : "#dc2626";

  return (
    <View style={[styles.statusPill, { backgroundColor: color + "22" }]}>
      <Text style={{ color, fontWeight: "600" }}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
}

// ----------------------------
// BOOKING CARD
// ----------------------------
function BookingCard({
  booking,
  onUpdateStatus,
  onOpenDetails,
  onChat,
}: any) {
  const total = booking.services.reduce(
    (a: number, b: any) => a + b.price,
    0
  );

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onOpenDetails}>
        <View style={styles.topRow}>
          <Text style={styles.customerName}>
            {booking.customerId?.name}
          </Text>
          <StatusPill status={booking.status} />
        </View>

        <Text style={styles.services}>
          {booking.services.map((s: any) => s.name).join(", ")}
        </Text>

        <Text style={styles.amount}>₹{total}</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.chatBtn} onPress={onChat}>
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>

        {booking.status === "pending" && (
          <>
            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={() =>
                onUpdateStatus(booking._id, "confirmed")
              }
            >
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={() =>
                onUpdateStatus(booking._id, "cancelled")
              }
            >
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </>
        )}

        {booking.status === "confirmed" && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() =>
              onUpdateStatus(booking._id, "completed")
            }
          >
            <Text style={styles.actionText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  filterChip: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  filterChipActive: {
    backgroundColor: "#0a7d28",
  },
  filterText: {
    fontSize: 12,
  },
  filterTextActive: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#f9fafb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  customerName: {
    fontSize: 17,
    fontWeight: "600",
  },
  services: {
    marginTop: 6,
    color: "#555",
  },
  amount: {
    marginTop: 6,
    fontWeight: "700",
    color: "#0a7d28",
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  actions: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: "flex-end",
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  chatBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  acceptBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  rejectBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  completeBtn: {
    backgroundColor: "#0a7d28",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
});
