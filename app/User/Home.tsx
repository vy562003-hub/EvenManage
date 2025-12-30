import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrganizers } from "../../store/slices/organizersSlice";

export default function HomeScreen() {
  const dispatch: any = useAppDispatch();
  const navigator = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState("All");
  const { list: organizers, loading: ld } = useAppSelector(
    (state) => state.organizers
  );
  const [loading, setLoading] = useState(ld);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        await dispatch(fetchOrganizers());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [dispatch]);

  const filtered = useMemo(() => {
    let list = [...organizers];

    // 🔍 Text search
    const q = search.toLowerCase();
    if (q) {
      list = list.filter((org: any) => {
        const name = org.name?.toLowerCase() || "";
        const location = org.location?.toLowerCase() || "";
        const services = (org.services || [])
          .map((s: any) => s.name?.toLowerCase())
          .join(" ");

        return (
          name.includes(q) ||
          location.includes(q) ||
          services.includes(q)
        );
      });
    }

    // 🎯 Filters
    if (activeFilter === "Top Rated") {
      list = list.filter((org: any) => org.rating >= 4.5);
    }

    if (activeFilter === "Budget") {
      list = list.filter(
        (org: any) => org.priceMin && org.priceMin <= 10000
      );
    }

    if (activeFilter === "Nearby") {
      list = list.filter((org: any) =>
        org.location?.toLowerCase().includes("mumbai")
      );
    }

    return list;
  }, [search, activeFilter, organizers]);

  // LOADING STATE
  if (loading) {
    return (
      <View
        style={[
          styles.centerContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator />
        <Text style={styles.loadingText}>Loading organizers...</Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#ffffff",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigator.navigate("User/Profile")}
          style={styles.chip}
        >
          <Text style={styles.chipText}>Profile</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Find Event Organizers</Text>
        <Text style={styles.headerSubtitle}>
          Book trusted professionals for your events
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchBoxContainer}>
        <TextInput
          placeholder="Search by name, service or location"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {["All", "Top Rated", "Budget", "Nearby"].map((f) => (
          <FilterChip
            key={f}
            label={f}
            active={activeFilter === f}
            onPress={() => setActiveFilter(f)}
          />
        ))}
      </View>

      {/* Organizer List */}
      <FlatList
        data={filtered}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
        renderItem={({ item }) => (
          <OrganizerCard
            organizer={item}
            onPress={() =>
              navigator.navigate("User/Organizer", {
                id: item._id,
                name: item.name,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: 16, marginTop: 40 }}>
            <Text style={styles.noResultText}>
              No organizers found. Try another search.
            </Text>
          </View>
        }
      />
    </View>
  );
}

function FilterChip({ label, active, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: "#0a7d28" },
      ]}
    >
      <Text style={[styles.chipText, active && { color: "#fff" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function OrganizerCard({
  organizer,
  onPress,
}: {
  organizer: any;
  onPress: () => void;
}) {
  const {
    name,
    profilePic,
    secondImage,
    rating,
    location,
    services,
    priceMin,
    priceMax,
  } = organizer;

  const servicesSummary =
    services && services.length > 0
      ? services
          .slice(0, 3)
          .map((s: any) => s.name)
          .join(" • ")
      : "Services not added";

  const priceText =
    priceMin != null && priceMax != null
      ? `₹${priceMin} - ₹${priceMax}`
      : "Price not specified";

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <View style={styles.imageRow}>
        <Image
          source={
            { uri: profilePic }
              
          }
          style={styles.mainImage}
        />

        {secondImage ? (
          <Image source={{ uri: secondImage }} style={styles.mainImage} />
        ) : (
          <View style={styles.emptyImage}>
            <Text style={styles.emptyGalleryText}>No gallery</Text>
          </View>
        )}
      </View>

      <Text numberOfLines={1} style={styles.cardTitle}>
        {name}
      </Text>

      <View style={styles.ratingRow}>
        <Text style={styles.star}>⭐</Text>
        <Text style={styles.ratingText}>
          {rating ? rating.toFixed(1) : "New"}
        </Text>
        {location ? (
          <Text style={styles.locationText} numberOfLines={1}>
            • {location}
          </Text>
        ) : null}
      </View>

      <Text numberOfLines={1} style={styles.serviceText}>
        {servicesSummary}
      </Text>

      <Text style={styles.priceText}>{priceText}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  centerContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: { marginTop: 8, color: "#666" },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  headerSubtitle: { marginTop: 4, color: "#666" },

  searchBoxContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  chip: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: { fontSize: 12, color: "#555" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
  },

  imageRow: { flexDirection: "row", marginBottom: 12 },
  mainImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 8,
  },
  emptyImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyGalleryText: { fontSize: 10, color: "#888" },

  cardTitle: { fontSize: 18, fontWeight: "600" },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  star: { color: "#f5b50a", marginRight: 4 },
  ratingText: { color: "#333", marginRight: 6 },
  locationText: { color: "#777" },

  serviceText: { color: "#555", marginTop: 4 },
  priceText: {
    color: "#0a7d28",
    fontWeight: "600",
    marginTop: 4,
  },

  noResultText: { textAlign: "center", color: "#777" },
});
