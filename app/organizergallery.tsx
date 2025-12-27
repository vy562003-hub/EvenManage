import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import { useAppSelector,useAppDispatch } from "@/store/hooks";
import { uploadOrganizerMedia,deleteOrganizerMedia } from "@/store/slices/organizersSlice";

export default function ManageGallery() {
  const dispatch = useAppDispatch();
  const [UserID, setUserID] = useState(useAppSelector((state)=>(state.user.userId)));
  const [gallery, setGallery] = useState<any[]>(useAppSelector((state) => (state.user.userdata.gallery)));
  const [loading, setLoading] = useState(false);
  const [videoSource,setvideoSource] = useState('');

  

    console.log(gallery,'before update');
    

  

  // ----------------------------
  // GET USER ID FIRST
  // ----------------------------
  

  // ----------------------------
  // LOAD GALLERY AFTER USERID
  // ----------------------------
  

  // ----------------------------
  // PICK IMAGE OR VIDEO
  // ----------------------------
  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      uploadMedia(result.assets[0]);
    }
  };

  // ----------------------------
  // UPLOAD MEDIA
  // ----------------------------
  const uploadMedia = async (file: any) => {
    try{
   const updated = await  dispatch(uploadOrganizerMedia({userId:UserID,file})).unwrap();
      setGallery(updated);

      Alert.alert("Success", "Uploaded successfully!");
      console.log(gallery,' gallery after update ');
      
    } catch (err) {
      console.log("Upload media error:", err);
      Alert.alert("Upload failed!");
    }
  };

  // ----------------------------
  // DELETE MEDIA
  // ----------------------------
  const deleteMedia = async (url: string) => {
    try {
      const updated = await dispatch(deleteOrganizerMedia({userId:UserID,url})).unwrap()

      setGallery(updated);

      Alert.alert("Removed", "Media deleted");
    } catch (err) {
      console.log("Delete media error:", err);
    }
  };

  // ----------------------------
  // LOADING STATE
  // ----------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <Text>Loading gallery...</Text>
      </SafeAreaView>
    );
  }



  const GalleryItem = ({ item, deleteMedia }: any) => {
    const player = useVideoPlayer(item.url, (player) => {
      player.pause();
    });

    console.log(item.url,'item.url');
    
  
    return (
      <View style={styles.mediaBox}>
        {item.type === "image" ? (
          <Image source={{ uri: item.url }} style={styles.media} />
        ) : (
          <VideoView
            style={styles.media}
            player={player}
            nativeControls
            allowsFullscreen
            allowsPictureInPicture
            contentFit="cover"
          />
        )}
  
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteMedia(item.url)}
        >
          <Text style={{ color: "#fff" }}>X</Text>
        </TouchableOpacity>
      </View>
    );
  };

  


  // ----------------------------
  // MAIN UI
  // ----------------------------
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Manage Gallery</Text>

      <TouchableOpacity style={styles.addBtn} onPress={pickMedia}>
        <Text style={styles.addText}>+ Add Photo / Video</Text>
      </TouchableOpacity>

      <FlatList
  numColumns={3}
  data={gallery}
  keyExtractor={(_, i) => i.toString()}
  renderItem={({ item }) => (
    <GalleryItem item={item} deleteMedia={deleteMedia} />
  )}
/>
    </SafeAreaView>
  );
}

// ----------------------------
// STYLES
// ----------------------------
const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },

  addBtn: {
    backgroundColor: "#0a7d28",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    alignItems: "center",
  },
  addText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  mediaBox: {
    width: "30%",
    height: 130,
    margin: "1.6%",
    position: "relative",
    backgroundColor: "#000",
    borderRadius: 10,
    overflow: "hidden",
  },

  media: {
    width: "100%",
    height: "100%",
  },

  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
  },
});
