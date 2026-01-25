import { Drawer } from "expo-router/drawer";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { DrawerItemList } from "@react-navigation/drawer";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "expo-router";




function CustomDrawerContent(props: any) {
  const router = useRouter()
  async function logout (){
    try {
      await fetch(`${process.env.EXPO_PUBLIC_SOCKET_URL_LOCAL}/api/auth/logout`)
      router.replace('/LoginScreen')
    } catch (error) {
      
    }
  }


  
  const user =  useAppSelector((state) => (state.organizers.selectedOrganizer ??state.user.userdata ))

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
      <DrawerItem
        label="Help"
        onPress={() => ('https://mywebsite.com/help')}
      />
      <TouchableOpacity onPress={() => {}}>
      <DrawerItem
        label="Logout"
        onPress={logout}
        focused={false}
        inactiveTintColor="red"
        pressColor="rgba(0,0,0,0.1)"
        pressOpacity={0.6}
        
      />
      </TouchableOpacity>
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
      <Drawer.Screen name="OrganizerBookingDetails" options={{drawerItemStyle:{display:"none"}}} />
   

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
