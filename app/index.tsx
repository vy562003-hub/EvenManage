import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useRouter } from "expo-router";
import { useAppSelector,useAppDispatch } from "@/store/hooks";
import { fetchUserProfile } from "@/store/slices/userSlice";
import { fetchOrganizerById } from "@/store/slices/organizersSlice";
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const ME_URL = process.env.EXPO_PUBLIC_USER_ID_LOCAL; // /me/full

type UserDetails = {
  name: string;
  email: string;
  userType: "customer" | "organizer";
  profilePic?: string;
};

type MeFullResponse = {
  userId: string;
  details: UserDetails;
};

export default function Index() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [user, setUser] = useState<MeFullResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch(`${ME_URL}`, {
          credentials: "include",
        });

        if (!res.ok) {
          router.replace("/LoginScreen");
          return;
        }

        const data: MeFullResponse = await res.json();
        setUser(data);
      } catch (err) {
        router.replace("/LoginScreen");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

   async function userprocessing(){
    SplashScreen.hide();
    if (!loading && user) {
      if (user.details.userType === "customer") {
        let customerdata = await dispatch(fetchUserProfile(user.userId)).unwrap();
        console.log(customerdata,'customerdata');
        
        router.replace("/User/Home");
      } else {
        let organizerdata = await dispatch(fetchOrganizerById(user.userId)).unwrap();
        router.replace("/Organizer/organizerhome");
      }
    }

  }

  // ✅ Role-based navigation AFTER user is restored
  useEffect(() => {
    userprocessing();
    
    
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // nothing rendered; navigation already handled
  return null;
}
