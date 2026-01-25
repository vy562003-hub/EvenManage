import { View, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";

export default function ImageViewer() {
  const router = useRouter();
  const { uri } = useLocalSearchParams(); // gets ?uri=...

  const imageUri = Array.isArray(uri) ? uri[0] : uri;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Image
  source={{
    uri: "https://cdn-icons-png.flaticon.com/512/1828/1828665.png",
  }}
  style={{ width: 28, height: 28 }}
  resizeMode="contain"
/>

      </TouchableOpacity>

      <Image
        source={{ uri: imageUri }}
        style={styles.fullImage}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
  },
});
