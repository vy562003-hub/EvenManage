// UserListScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator,StyleSheet } from "react-native";
import { useNavigation } from "expo-router";
//import {USER_LIST} from "@env"
const USER_LIST = process.env.EXPO_PUBLIC_USER_LIST;

export default function UserListScreen() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${USER_LIST}`, {
          credentials: "include", // to include session cookies
        });
        //console.log("request send",res);
        
        const data = await res.json();
        console.log("data",data);
        
        setUsers(data);

      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
        console.log(users,"Users",loading);
        
      }
    };
    fetchUsers();
  }, []);

   if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    ); 
return (
    <View style={styles.container}>
      <Text style={styles.header}>Chat with Friends 💬</Text>
     
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.userCard}
              onPress={() =>
                navigation.navigate("ChatScreen", {
                  receiverId: item._id,
                  receiverName: item.name,
                })
              }
            >
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </TouchableOpacity>
          )
        }
      />
    </View>
  );
    
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#111827", // same as bg-gray-900
      padding: 16, // p-4
    },
    header: {
      color: "#000", // text-black
      fontSize: 24, // text-2xl
      fontWeight: "bold", // font-bold
      marginBottom: 16, // mb-4
      textAlign: "center", // text-center
    },
    userCard: {
      backgroundColor: "#1111", // bg-black
      borderRadius: 8, // rounded-lg
      padding: 16, // p-4
      marginBottom: 12, // mb-3
    },
    userName: {
      color: "#fff", // text-white
      fontSize: 18, // text-lg
      fontWeight: "600", // font-semibold
    },
    userEmail: {
      color: "#ccc", // light gray text
      marginTop: 4,
    },
  });
