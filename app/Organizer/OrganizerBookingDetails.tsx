import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAppDispatch } from "@/store/hooks";
import {
  uploadBookingBill,
  updateBookingStatus,
} from "@/store/slices/organizersSlice";

import * as DocumentPicker from "expo-document-picker";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_ORGANIZER;

export default function BookingDetails() {
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [booking, setBooking] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const loadBooking = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/booking/${id}`);
      const data = await res.json();
      setBooking(data);
    } catch (err) {
      console.log("Error:", err);
    }
  };

  useEffect(() => {
    loadBooking();
  }, []);

  const updateStatus = async (status: string) => {
    try {
      await dispatch(updateBookingStatus({ bookingId: id, status }));
      Alert.alert("Success", `Booking marked as ${status}`);
      loadBooking();
    } catch (err) {
      Alert.alert("Error", "Failed to update");
    }
  };

  // -----------------------
  // 📌 BILL UPLOAD FUNCTION
  // -----------------------
  const uploadBillPdf = async () => {
    try {
      const file = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });

      if (file.canceled) return;

      const asset = file.assets[0];
      setUploading(true);

      const data = await dispatch(
        uploadBookingBill({ bookingId: id as string, file: asset })
      ).unwrap();

      

      console.log(data,'organizer updated bill');
      

      setUploading(false);

      if (!data) {
        Alert.alert("Error", data.error || "Upload failed");
        return;
      }

      Alert.alert("Success", "Bill uploaded successfully!");
      loadBooking();
    } catch (err) {
      console.log("Upload error:", err);
      setUploading(false);
      Alert.alert("Error", "Failed to upload bill");
    }
  };

  // LOADING STATE
  if (!booking) {
    return (
      <View
        style={[
          styles.center,
          {  paddingBottom: insets.bottom },
        ]}
      >
        <Text>Loading booking...</Text>
      </View>
    );
  }

  const total = booking.services.reduce((a: number, b: any) => a + b.price, 0);

  return (
    <View
      style={[
        styles.container,
        {  paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>Booking Details</Text>

      <Text style={styles.label}>Customer:</Text>
      <Text style={styles.value}>{booking.customerId.name}</Text>

      <Text style={styles.label}>Services:</Text>
      <Text style={styles.value}>
        {booking.services.map((s: any) => s.name).join(", ")}
      </Text>

      <Text style={styles.label}>Total Price:</Text>
      <Text style={styles.value}>₹{total}</Text>

      <Text style={styles.label}>Date:</Text>
      <Text style={styles.value}>
        {new Date(booking.date).toDateString()}
      </Text>

      <Text style={styles.label}>Notes:</Text>
      <Text style={styles.value}>
        {booking.note || "No note provided."}
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>Bill:</Text>

        {booking.billUrl ? (
          <TouchableOpacity
            style={styles.viewBillBtn}
            onPress={() => Linking.openURL(`${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${booking.billUrl}`)}
          >
            <Text style={styles.actionText}>View Bill</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.value}>No bill uploaded yet.</Text>
        )}
      </View>

      {/* Upload Bill Button */}
      <TouchableOpacity
        style={styles.uploadBtn}
        onPress={uploadBillPdf}
        disabled={uploading}
      >
        <Text style={styles.actionText}>
          {uploading ? "Uploading..." : "Upload Bill (PDF)"}
        </Text>
      </TouchableOpacity>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            router.push({
              pathname: "/ChatScreen",
              params: {
                receiverId: booking.customerId._id,
                name: booking.customerId.name,
              },
            })
          }
        >
          <Text style={styles.actionText}>Chat</Text>
        </TouchableOpacity>

        {booking.status === "confirmed" && (
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={() => updateStatus("completed")}
          >
            <Text style={styles.actionText}>Mark Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// --------------------
// STYLES
// --------------------
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginTop: 12,
  },
  value: {
    fontSize: 15,
    color: "#444",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    marginTop: 24,
  },
  chatBtn: {
    padding: 12,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    marginRight: 8,
  },
  completeBtn: {
    padding: 12,
    backgroundColor: "#16a34a",
    borderRadius: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "600",
  },
  uploadBtn: {
    padding: 12,
    backgroundColor: "#ea580c",
    borderRadius: 10,
    marginTop: 14,
    alignItems: "center",
  },
  viewBillBtn: {
    padding: 12,
    backgroundColor: "#7c3aed",
    borderRadius: 10,
    marginTop: 8,
    width: 150,
    alignItems: "center",
  },
});
