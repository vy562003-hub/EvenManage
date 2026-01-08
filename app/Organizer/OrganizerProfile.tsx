import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import {  useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import {
  uploadProfileImage,
  updateUserProfile,
} from "@/store/slices/userSlice";
import { fetchOrganizerById } from "@/store/slices/organizersSlice";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_ORGANIZER;
const USER_ID_API = process.env.EXPO_PUBLIC_USER_ID_LOCAL;

export default function OrganizerProfile() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // ---------------------
  // States
  // ---------------------
  const [UserID, setUserID] = useState(
    useAppSelector((state) => state.user.userId || state.organizers.userId)
  );

  const [profilePic, setProfilePic] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [about, setAbout] = useState("");

  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [startingPrice, setStartingPrice] = useState("");

  const [loading, setLoading] = useState(true);

  // ---------------------
  // Fetch Organizer Profile
  // ---------------------
  const loadProfile = async () => {
    try {
      const data = await dispatch(
        fetchOrganizerById(UserID as string)
      ).unwrap();

      setProfilePic(`${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${data.profilePic}`);
      console.log(data.profilePic,'profilePic');
      setName(data.name);
      setPhone(data.phone);
      setEmail(data.email);
      setAbout(data.about);

      // organizer-specific fields
      setLocation(data.location || "");
      setExperience(data.experience ? String(data.experience) : "");
      setStartingPrice(
        data.startingPrice ? String(data.startingPrice) : ""
      );
    } catch (err) {
      Alert.alert("Error", "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

 

  useFocusEffect(
    useCallback(() => {
      console.log(UserID,'organizer user id');
    
       if (UserID) loadProfile();
  
      return () => {};
    }, [UserID])
  );

  // ---------------------
  // Pick profile image
  // ---------------------
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      uploadProfilePic(result.assets[0]);
    }
  };

  const uploadProfilePic = async (file: any) => {
    const uri = file.uri;

    try {
      const data = await dispatch(
        uploadProfileImage({ userId: UserID, uri })
      ).unwrap();

      setProfilePic(`${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${data.profilePic}`);
      Alert.alert("Success", "Profile picture updated");
    } catch (err) {
      Alert.alert("Error", "Failed to upload picture");
    }
  };

  // ---------------------
  // Save Profile
  // ---------------------
  const saveProfile = async () => {
    try {
      const body = {
        name,
        phone,
        email,
        about,
        location,
        experience: Number(experience),
        startingPrice: Number(startingPrice),
      };

      const res = await dispatch(
        updateUserProfile({ userId: UserID, obj: body })
      ).unwrap();

      if (res.name) {
        Alert.alert("Success", "Profile updated");
      } else {
        Alert.alert("Error", res.error || "Failed to update profile");
      }
    } catch (err) {
      Alert.alert("Error", "Server error");
    }
  };

  // ---------------------
  // LOADING STATE
  // ---------------------
  if (loading) {
    return (
      <View
        style={[
          styles.center,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <Text>Loading Profile...</Text>
      </View>
    );
  }

  // ---------------------
  // UI
  // ---------------------
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: insets.top,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100 + insets.bottom,
        }}
      >
        {/* Profile Image */}
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          <Image
            source={
             { uri: profilePic }
                
            }
            style={styles.profilePic}
          />

          <TouchableOpacity style={styles.picBtn} onPress={pickImage}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* INPUT FIELDS */}
        <Text style={styles.label}>Name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>About</Text>
        <TextInput
          style={[styles.input, { height: 100 }]}
          value={about}
          onChangeText={setAbout}
          multiline
        />

        {/* ORGANIZER ONLY FIELDS */}
        <Text style={styles.sectionHeader}>Organizer Details</Text>

        <Text style={styles.label}>Location / City</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Experience (years)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={experience}
          onChangeText={setExperience}
        />

        <Text style={styles.label}>Starting Price (₹)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={startingPrice}
          onChangeText={setStartingPrice}
        />

        {/* SAVE BUTTON */}
        <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
          <Text style={styles.saveText}>Save Profile</Text>
        </TouchableOpacity>

        {/* MANAGE GALLERY */}
        <TouchableOpacity
          style={styles.galleryBtn}
          onPress={() => router.push("/Organizer/organizergallery")}
        >
          <Text style={styles.galleryText}>Manage Gallery</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// ---------------------
// Styles
// ---------------------
const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  picBtn: {
    marginTop: 10,
    backgroundColor: "#0a7d28",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 12,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 20,
  },
  saveBtn: {
    backgroundColor: "#0a7d28",
    padding: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  galleryBtn: {
    backgroundColor: "#0077ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 14,
    alignItems: "center",
  },
  galleryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
