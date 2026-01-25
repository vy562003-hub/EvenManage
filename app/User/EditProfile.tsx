import React, {  useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfileImage,
} from "@/store/slices/userSlice";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const USER_ID = process.env.EXPO_PUBLIC_USER_ID_LOCAL;

export default function EditProfile() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { userId: UserID, userdata }: any = useAppSelector(
    (state) => state.user
  );

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");


  const fetchProfile = async () => {
      
    try {
      setUser(userdata);
      setName(userdata?.name || "");
      setPhone(userdata?.phone || "");
      setEmail(userdata?.email || "");
    } catch (err) {
      console.log("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  // LOAD PROFILE
  useFocusEffect(

    useCallback(() => {

      
  
      fetchProfile();
      return () => {};

    } ,[UserID, user,userdata] )
    
   );

  // PICK IMAGE FROM GALLERY
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setUser((prev: any) => ({ ...prev, profilePic: uri }));
      uploadImage(uri);
    }
  };

  // UPLOAD TO BACKEND
  const uploadImage = async (uri: string) => {
    try {
      await dispatch(
        uploadProfileImage({
          userId: UserID,
          uri,
        })
      ).unwrap();

      setUser(userdata);
      alert("Profile picture updated!");
    } catch (err) {
      console.log("Upload error:", err);
      alert("Upload failed");
    }
  };

  // SAVE CHANGES
  const handleSave = async () => {
    try {
      const res = await dispatch(
        updateUserProfile({
          userId: UserID,
          obj: {
            name,
            phone,
            email,
          },
        })
      ).unwrap();

      if (!res?._id) {
        alert("Failed to update");
        return;
      }

      alert("Profile updated!");
      router.back();
    } catch (err) {
      console.log("Update error:", err);
    }
  };

  // LOADING STATE
  if (loading || !user) {
    return (
      <View
        style={[
          styles.center,
          {  paddingBottom: insets.bottom },
        ]}
      >
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {  paddingBottom: insets.bottom },
      ]}
    >
      <Text style={styles.title}>Edit Profile</Text>

      {/* PROFILE IMAGE */}
      <TouchableOpacity onPress={pickImage} style={{ alignSelf: "center" }}>
        <Image
          source={{
            uri:
            `${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${userdata.profilePic}`  +
            "?t="  ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png" +
                "?t=" 
          }}
          style={styles.profileImage}
        />
        <Text style={styles.changePhoto}>Change Profile Photo</Text>
      </TouchableOpacity>

      {/* NAME */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />

      {/* EMAIL */}
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} editable={false} />

      {/* PHONE */}
      <Text style={styles.label}>Phone</Text>
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        keyboardType="numeric"
      />

      {/* SAVE */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>

      {/* CANCEL */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 60,
    marginBottom: 5,
  },
  changePhoto: {
    textAlign: "center",
    color: "#0077ff",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: "#0a7d28",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    padding: 14,
    marginTop: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#333",
  },
});
