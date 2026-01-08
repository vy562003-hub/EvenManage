import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useNavigation } from "expo-router";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  fetchDashboardStats,
  fetchOrganizerBookings,
} from "@/store/slices/organizersSlice";
import { listenToChatMessages } from "@/services/messageListener";
import { BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function OrganizerDashboard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [bookings, setBookings] = useState<any[]>([]);

  const UserID = useAppSelector(
    (state) => state.user.userId ?? state.organizers.userId
  );

  console.log(UserID, "userId-organizer-home page");

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    if (UserID) loadBookings();
  }, [UserID]);

  // ----------------------------------
  // LOAD BOOKINGS
  // ----------------------------------
  const loadBookings = async () => {
    try {
      const data = await dispatch(
        fetchOrganizerBookings(UserID)
      ).unwrap();
      console.log(data, "bokking list data bitch");
      setBookings(data);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
    }
  };

  /* -------- useEffect global organizer chat event listner ----------- */

  useEffect(() => {
    if (!UserID || !bookings?.length) return;

    console.log(bookings, "booking list", UserID, "current user");

    let unsubscribers: Array<() => void> = [];
    let isMounted = true;

    const setupListeners = async () => {
      for (const obj of bookings) {
        const receiverId = obj.customerId._id;

        const chatId =
          UserID < receiverId
            ? `${UserID}_${receiverId}`
            : `${receiverId}_${UserID}`;

        console.log(chatId, "registering listener");

        try {
          const unsubscribe = await listenToChatMessages(chatId);

          if (isMounted && typeof unsubscribe === "function") {
            unsubscribers.push(unsubscribe);
          }
        } catch (err) {
          console.error("Failed to register listener for", chatId, err);
        }
      }
    };

    setupListeners();

    return () => {
      isMounted = false;

      console.log("🧹 Cleaning up chat listeners");

      unsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });

      unsubscribers = [];
    };
  }, [bookings, UserID]);

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

  const chartData = {
    labels: ["Total", "Pending", "Completed"],
    datasets: [
      {
        data: [stats.total, stats.pending, stats.completed],
      },
    ],
  };

  // ✅ UI-only width fix (card padding 16 + screen padding 16*2)
  const chartWidth = screenWidth - 16 * 2 - 16 * 2;

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Stats Card */}
        <View style={styles.card}>
          <Text style={styles.stat}>Total Bookings: {stats.total}</Text>
          <Text style={styles.stat}>
            Pending Requests: {stats.pending}
          </Text>
          <Text style={styles.stat}>Completed: {stats.completed}</Text>
        </View>

        {/* Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Booking Overview</Text>

          <View style={styles.chartWrapper}>
            <BarChart
              data={chartData}
              width={chartWidth}
              height={220}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                barPercentage: 0.6,
                fillShadowGradient: "#4F46E5",
                fillShadowGradientOpacity: 1,
                color: (opacity = 1) =>
                  `rgba(79, 70, 229, ${opacity})`,
                labelColor: () => "#374151",
                propsForBackgroundLines: {
                  strokeDasharray: "",
                },
              }}
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.actions}>
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
            onPress={() => router.push("/Organizer/organizergallery" as never)}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: 16,
  paddingBottom: 30,
  paddingTop: 4,   // 🔥 reduced (was 16)
  },
  actions: {
    marginTop: 10,
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
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 3,
  },
  stat: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    marginVertical: 3,
  },
  chartContainer: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 24,
    overflow: "hidden",
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
    textAlign: "center",
  },
  chartWrapper: {
    alignItems: "center",
  },
  chart: {
    borderRadius: 12,
  },
});
