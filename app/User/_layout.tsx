import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { useAppSelector } from "@/store/hooks";




function CustomDrawerContent(props: any) {

  
  const user = useAppSelector((state) => (state.user.userdata));

  const routetoprofilepage = () => {
    console.log("Pick image");
    console.log(user.profilePic ,'user.profilePic');
    
  };

  return (
    <DrawerContentScrollView {...props}>
      {/* PROFILE SECTION */}
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={routetoprofilepage}>
          <Image
            source={{
              uri:
                `${process.env.EXPO_PUBLIC_API_BASE_ORGANIZER}${user.profilePic}` ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png",
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        <Text style={styles.name}>{user.name}</Text>
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
      <Drawer.Screen name="Home" options={{ title: "Home" }} />
      <Drawer.Screen name="History" options={{ title: "History" }} />
      <Drawer.Screen
  name="index"
  options={{
    drawerItemStyle: { display: "none" },
  }}
/>
<Drawer.Screen
  name="EditProfile"
  options={{
    drawerItemStyle: { display: "none" },
  }}
/>
<Drawer.Screen
  name="Organizer"
  options={{
    drawerItemStyle: { display: "none" },
  }}
/>
<Drawer.Screen
  name="Booking"
  options={{
    drawerItemStyle: { display: "none" },
  }}
/>
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
