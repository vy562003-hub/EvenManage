import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ref, push, onValue } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { useRoute } from "@react-navigation/native";
//import {USER_ID,SEND_NOTIFY} from "@env";
const USER_ID=process.env.EXPO_PUBLIC_USER_ID;const SEND_NOTIFY = process.env.EXPO_PUBLIC_SEND_NOTIFY;
export default function ChatScreen() {
  const route = useRoute();
  const { receiverId, receiverName } = route.params as {
    receiverId: string;
    receiverName: string;
  };

  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const chatId =
    currentUserId < receiverId
      ? `${currentUserId}_${receiverId}`
      : `${receiverId}_${currentUserId}`;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${USER_ID}`, {
          credentials: "include",
        });
        const data = await res.json();
        setCurrentUserId(data.userId);
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const chatRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.values(data).sort(
          (a: any, b: any) => a.timestamp - b.timestamp
        );
        setMessages(msgs);
      }
    });
    return () => unsubscribe();
  }, [currentUserId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const chatRef = ref(db, `chats/${chatId}/messages`);
    await push(chatRef, {
      senderId: currentUserId,
      receiverId,
      text,
      timestamp: Date.now(),
    });
    setText("");
    await fetch(`${SEND_NOTIFY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        receiverId,
        message: text,
        senderName: "You",
      }),
    });
  };

  const renderItem = ({ item }: any) => {
    const isSender = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.messageWrapper,
          isSender ? styles.alignRight : styles.alignLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isSender ? styles.senderBubble : styles.receiverBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timeText}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 20}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerContent}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#fff"
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={styles.receiverName}>{receiverName}</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </View>
        </Animated.View>

        {/* Messages */}
        <FlatList
          data={messages}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesContainer}
        />

        {/* Input area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
              value={text}
              onChangeText={setText}
            />
            {text.length > 0 && (
              <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(30,41,59,0.85)",
    borderBottomWidth: 0.5,
    borderBottomColor: "#334155",
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  receiverName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  status: {
    color: "#94a3b8",
    fontSize: 12,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 12,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 4,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  senderBubble: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },
  receiverBubble: {
    backgroundColor: "#334155",
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
  },
  messageText: {
    color: "#fff",
    fontSize: 15,
  },
  timeText: {
    fontSize: 11,
    color: "#cbd5e1",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  alignRight: {
    alignItems: "flex-end",
  },
  alignLeft: {
    alignItems: "flex-start",
  },
  inputContainer: {
    borderTopWidth: 0.5,
    borderTopColor: "#334155",
    backgroundColor: "#1e293b",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 25,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 8,
  },
  sendButton: {
    backgroundColor: "#2563eb",
    borderRadius: 20,
    padding: 8,
    marginLeft: 6,
  },
});
