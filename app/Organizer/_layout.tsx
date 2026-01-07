import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";


function CustomDrawerContent(props: any) {
  const user = {
    profilePic: "",
    name: "John Doe",
  };

  const pickImage = () => {
    console.log("Pick image");
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* PROFILE SECTION */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri:
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.changeText}>Change Profile Photo</Text>
      </View>

      {/* DRAWER ITEMS (THIS IS THE KEY LINE) */}
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        drawerType: "slide",
      }}
    >
      {/* MUST MATCH FILE NAMES */}
      <Drawer.Screen name="organizerhome" options={{ title: "Home" }} />
      <Drawer.Screen name="OrganizerBookings" options={{ title: "Bookings" }} />
      <Drawer.Screen name="organizergallery" options={{ title: "Gallery" }} />
      <Drawer.Screen name="OrganizerProfile" options={{ title: "Profile" }} />
      <Drawer.Screen name="organizerservices" options={{ title: "Services" }} />
   

    </Drawer>
    
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    marginBottom: 10,
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  changeText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
});
