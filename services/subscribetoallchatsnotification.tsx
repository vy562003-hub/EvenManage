



import * as Notifications from "expo-notifications";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchDashboardStats, fetchOrganizerBookings } from "@/store/slices/organizersSlice";
import { listenToChatMessages } from "@/services/messageListener";
import { useEffect, useState } from "react";

function substonotificationofchat(){

    const dispatch = useAppDispatch();

  const UserID  = useAppSelector((state) => state.user.userId ?? state.organizers.userId);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log("🔔 Notification permission:", status);

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,   // ✅ REQUIRED (new)
          shouldShowList: true,     // ✅ REQUIRED (new)
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      
    })();
  }, []);

  
  useEffect(() => {
    if (UserID) loadBookings();
  }, [UserID]);

  // ----------------------------------
  // LOAD BOOKINGS
  // ----------------------------------
  const loadBookings = async () => {
    try {
      const data = await dispatch(
        fetchOrganizerBookings(UserID)
      ).unwrap();
      console.log(data,'bokking list data bitch');
      
      
      setBookings(data);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      //setLoading(false);
    }
  };


  /* -------- useEffect global organizer chat event listner ----------- */



  useEffect(() => {
    if (!UserID || !bookings?.length) return;
  
    console.log(bookings, "booking list", UserID, "current user");
  
    let unsubscribers: Array<() => void> = [];
    let isMounted = true;
  
    const setupListeners = async () => {
      for (const obj of bookings) {
        const receiverId = obj.customerId._id;
  
        const chatId =
          UserID < receiverId
            ? `${UserID}_${receiverId}`
            : `${receiverId}_${UserID}`;
  
        console.log(chatId, "registering listener");
  
        try {
          const unsubscribe = await listenToChatMessages(chatId);
  
          if (isMounted && typeof unsubscribe === "function") {
            unsubscribers.push(unsubscribe);
          }
        } catch (err) {
          console.error("Failed to register listener for", chatId, err);
        }
      }
    };
  
    setupListeners();
  
    return () => {
      isMounted = false;
  
      console.log("🧹 Cleaning up chat listeners");
  
      unsubscribers.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
  
      unsubscribers = [];
    };
  }, [bookings, UserID]);
}