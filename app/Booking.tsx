import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { fetchOrganizerById,setBigMedia } from "@/store/slices/organizersSlice";
import { useAppDispatch,useAppSelector, } from "@/store/hooks";
import { submitBooking, resetBookingState } from "@/store/slices/BookingSlice";

import { fetchUser } from "@/store/slices/userSlice";


// set redux for userid and handle booking 
export default function BookingScreen() {
  const dispatch:any = useAppDispatch();

  const { id } = useLocalSearchParams(); // organizerId
  const router = useRouter();

  const {selectedOrganizer:organizer,bigMedia,loading:ld} = useAppSelector((state) => (state.organizers))
  const { userId:UserID } = useAppSelector(state => state.user);


  const [loading, setLoading] = useState(ld);

  

  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Fetch organize
  const getUser = async () => {
    try {
      const data = await dispatch(fetchUser()).unwrap();
      Alert.alert("User ID", data.userId);
    } catch (err: any) {
      Alert.alert("Error", err);
    }
  };

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        await getUser();
       const selectedOrganizer = await dispatch(fetchOrganizerById(id)).unwrap();
       console.log(selectedOrganizer);
       
        if (organizer.gallery?.length > 0) {
          dispatch(setBigMedia(organizer.gallery[0])); // full object
        }
      } catch (err) {
        console.log("Error fetching organizer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [id,dispatch]);

  // Toggle service selection
  const toggleService = (srv: any) => {
    const exists = selectedServices.some((s) => s.name === srv.name);
    if (exists) {
      setSelectedServices(selectedServices.filter((s) => s.name !== srv.name));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  // Total price
  const total = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Submit booking
  const handleBooking = async () => {
    if (selectedServices.length === 0) {
      alert("Select at least one service");
      return;
    }
  
    try {
      await dispatch(
        submitBooking({
          customerId: UserID,
          organizerId: id,
          services: selectedServices,
          date,
          note,
        })
      ).unwrap();
  
      alert("Booking request sent!");
      dispatch(resetBookingState());
      router.back();
    } catch (err: any) {
      alert(err || "Booking failed");
    }
  };

  if (loading || !organizer) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading booking...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, padding: 16 }}>
        <Text style={styles.title}>Book {organizer.name}</Text>

        {/* Services */}
        <Text style={styles.sectionTitle}>Select Services</Text>
        <View style={styles.chipWrap}>
          {organizer.services?.map((srv: any, i: number) => {
            const selected = selectedServices.some(
              (s) => s.name === srv.name
            );
            return (
              <TouchableOpacity
                key={i}
                onPress={() => toggleService(srv)}
                style={[
                  styles.serviceChip,
                  selected && styles.serviceChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.serviceChipText,
                    selected && { color: "#fff" },
                  ]}
                >
                  {srv.name} ₹{srv.price}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <TouchableOpacity
          style={styles.dateBox}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.dateText}>{date.toDateString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selected) => {
              setShowPicker(false);
              if (selected) setDate(selected);
            }}
          />
        )}

        {/* Note */}
        <Text style={styles.sectionTitle}>Add Note</Text>
        <TextInput
          placeholder="Message for organizer..."
          multiline
          numberOfLines={4}
          value={note}
          onChangeText={setNote}
          style={styles.noteBox}
        />

        {/* Total */}
        <Text style={styles.totalText}>Total: ₹{total}</Text>
      </ScrollView>

      {/* Sticky button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmBtn} onPress={handleBooking}>
          <Text style={styles.confirmText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },

  sectionTitle: { fontSize: 16, fontWeight: "600", marginVertical: 8 },

  chipWrap: { flexDirection: "row", flexWrap: "wrap" },

  serviceChip: {
    backgroundColor: "#f2f2f2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceChipActive: {
    backgroundColor: "#0a7d28",
  },
  serviceChipText: { color: "#333" },

  dateBox: {
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    marginBottom: 12,
  },
  dateText: { fontSize: 16 },

  noteBox: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },

  totalText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#0a7d28",
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  confirmBtn: {
    backgroundColor: "#0a7d28",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
