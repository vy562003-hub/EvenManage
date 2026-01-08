import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { useRoute } from "@react-navigation/native";
import { fetchOrganizerById, setBigMedia } from "@/store/slices/organizersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

// expo-video imports
import { VideoView, useVideoPlayer } from "expo-video";

// =============================
// COMPONENT: Big Media View
// =============================
function BigMediaView({ media }: any) {
  if (!media) return null;

  if (media.type === "image") {
    return <Image source={{ uri: `${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${media.url}` }} style={styles.bigImage} />;
  }

  const player = useVideoPlayer(`${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${media.url}`, (p) => p.pause());

  return (
    <VideoView
      style={styles.bigImage}
      player={player}
      showsControls
      allowsFullscreen
      contentFit="contain"
    />
  );
}

// =============================
// COMPONENT: Thumbnail
// =============================
function GalleryThumbnail({ item, isActive, onPress }: any) {
  const thumbnailStyle = [
    styles.thumbnail,
    isActive && { borderColor: "#0a7d28", borderWidth: 2 },
  ];

  if (item.type === "image") {
    return (
      <TouchableOpacity onPress={onPress}>
        <Image source={{ uri: item.url }} style={thumbnailStyle} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[thumbnailStyle, { justifyContent: "center" }]}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
    </TouchableOpacity>
  );
}

// =============================
// MAIN SCREEN
// =============================
export default function OrganizerDetails() {
  const dispatch: any = useAppDispatch();
  const route = useRoute();
  const navigator = useNavigation();
  const insets = useSafeAreaInsets();

  const { id, name } = route.params as { id: string; name: string };

  const {
    selectedOrganizer: organizer,
    bigMedia,
    loading: ld,
  } = useAppSelector((state) => state.organizers);

  const [loading, setLoading] = useState(ld);

  useEffect(() => {
    const fetchOrganizer = async () => {
      try {
        const selectedOrganizer = await dispatch(
          fetchOrganizerById(id)
        ).unwrap();

        if (selectedOrganizer.gallery?.length > 0) {
          dispatch(setBigMedia(selectedOrganizer.gallery[0]));
        }
      } catch (err) {
        console.log("Error fetching organizer:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizer();
  }, [id, dispatch]);

  if (loading || !organizer) {
    return (
      <View
        style={[
          styles.centerContainer,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8, color: "#666" }}>
          Loading organizer...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
      }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        {/* BIG MEDIA */}
        <BigMediaView media={bigMedia} />

        {/* THUMBNAILS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailRow}
        >
          {organizer.gallery?.map((item: any, i: number) => (
            <GalleryThumbnail
              key={i}
              item={item}
              isActive={bigMedia?.url === item.url}
              onPress={() => dispatch(setBigMedia(item))}
            />
          ))}
        </ScrollView>

        {/* HEADER */}
        <View style={styles.header}>
          <Image
            source={{ uri: organizer.profilePic }}
            style={styles.profilePic}
          />

          <View style={{ marginLeft: 12 }}>
            <Text style={styles.name}>{organizer.name}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.star}>⭐</Text>
              <Text style={styles.ratingText}>
                {organizer.rating ? organizer.rating.toFixed(1) : "New"}
              </Text>
              <Text style={styles.locationText}>
                • {organizer.location}
              </Text>
            </View>
          </View>
        </View>

        {/* ABOUT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionText}>{organizer.about}</Text>
        </View>

        {/* SERVICES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>

          <View style={styles.chipWrap}>
            {organizer.services?.map((srv: any, i: number) => (
              <View key={i} style={styles.serviceChip}>
                <Text style={styles.serviceChipText}>
                  {srv.name} ₹{srv.price}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: insets.bottom + 10 },
        ]}
      >
        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => navigator.navigate("Booking", { id })}
        >
          <Text style={styles.bookText}>Book Now</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() =>
            navigator.navigate("ChatScreen", {
              receiverId: id,
              receiverName: name,
            })
          }
        >
          <Text style={styles.chatText}>Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// =============================
// STYLES
// =============================
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  bigImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#000",
  },

  playIcon: {
    color: "#fff",
    fontSize: 27,
    fontWeight: "bold",
    textAlign: "center",
  },

  thumbnailRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingLeft: 10,
  },

  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: "#000",
  },

  header: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  star: {
    color: "#f5b50a",
    marginRight: 4,
  },
  ratingText: {
    color: "#333",
    marginRight: 6,
  },
  locationText: {
    color: "#777",
  },

  section: {
    paddingHorizontal: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  sectionText: {
    color: "#555",
    lineHeight: 20,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  serviceChip: {
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
  },
  serviceChipText: {
    color: "#333",
    fontSize: 13,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 14,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },

  bookBtn: {
    flex: 1,
    backgroundColor: "#0a7d28",
    padding: 14,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  bookText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  chatBtn: {
    flex: 1,
    backgroundColor: "#0077ff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  chatText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
