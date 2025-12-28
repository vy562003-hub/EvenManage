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
  SafeAreaView,
  Image,
} from "react-native";
import {  useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ref, push, onValue } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { useRoute } from "@react-navigation/native";
import io, { Socket } from "socket.io-client";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useNavigation } from "expo-router";

const USER_ID = process.env.EXPO_PUBLIC_USER_ID_LOCAL;
const SEND_NOTIFY = process.env.EXPO_PUBLIC_SEND_NOTIFY_LOCAL;
const SOCKET_URL =
  process.env.EXPO_PUBLIC_SOCKET_URL_LOCAL || "http://10.57.13.82:5000";


console.log('sdsad');



type ChatMessage = {
  senderId: string;
  receiverId: string;
  type?: "text" | "file";
  text?: string;
  fileName?: string;
  storageKey?: string;
  timestamp: number;
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { receiverId, receiverName } = route.params as {
    receiverId: string;
    receiverName: string;
  };

  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const socketRef = useRef<Socket | null>(null);
  const fileBuffersRef = useRef<Record<string, string[]>>({});

  const baseDir = FileSystem.documentDirectory || FileSystem.cacheDirectory || "";

  const chatId =
    currentUserId && receiverId
      ? currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`
      : "";

  // simple fade-in header
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // 1️⃣ Get current user from backend session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${USER_ID}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.userId) {
          setCurrentUserId(data.userId);
        } else {
          console.warn("No userId in session response");
        }
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };
    fetchSession();
  }, []);

  // 2️⃣ Setup Socket.IO once we know the user ID
  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("register", currentUserId); // backend: one socket per user
    });

    socket.on("file-chunk", async (data) => {
      try {
        const {
          chatId: incomingChatId,
          storageKey,
          fileName,
          chunk,
          chunkIndex,
          isLast,
        } = data;

        if (!incomingChatId || !storageKey || !chunk) return;
        if (!baseDir) return;

        const key = `${incomingChatId}_${storageKey}`;
        if (!fileBuffersRef.current[key]) fileBuffersRef.current[key] = [];
        fileBuffersRef.current[key][chunkIndex] = chunk;

        if (isLast) {
          const base64 = fileBuffersRef.current[key].join("");
          delete fileBuffersRef.current[key];

          const localPath = `${baseDir}${storageKey}`;
          await FileSystem.writeAsStringAsync(localPath, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });

          console.log("Received file saved at:", localPath);
        }
      } catch (err) {
        console.error("Error handling file-chunk:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      fileBuffersRef.current = {};
    };
  }, [currentUserId, baseDir]);

  // 3️⃣ Subscribe to Firebase messages
  useEffect(() => {
    if (!currentUserId || !chatId) return;

    const chatRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs: any = Object.values(data).sort(
          (a: any, b: any) => a.timestamp - b.timestamp
        );
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [currentUserId, chatId]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;

    const msgForNotify = text;
    const chatRef = ref(db, `chats/${chatId}/messages`);

    try {
      await push(chatRef, {
        senderId: currentUserId,
        receiverId,
        type: "text",
        text: msgForNotify,
        timestamp: Date.now(),
      });
      setText("");

      // FCM notify
      if (SEND_NOTIFY) {
        await fetch(`${SEND_NOTIFY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId,
            message: msgForNotify,
            senderName: "",
          }),
        });
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  // 📎 pick & send file through Socket.IO (chunked)
  const handleSendFile = async () => {
    try {
      if (!currentUserId || !receiverId || !chatId) return;
      const socket = socketRef.current;
      if (!socket || !socket.connected) {
        console.warn("Socket not connected");
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0)
        return;

      const asset = result.assets[0];
      const originalUri = asset.uri;
      const fileName = asset.name ?? `file_${Date.now()}`;

      const safeName = fileName.replace(/\s+/g, "_");
      const storageKey = `${chatId}_${Date.now()}_${safeName}`;
      const localPath = `${baseDir}${storageKey}`;

      // ensure we have some baseDir
      if (!baseDir) {
        console.error("No documentDirectory or cacheDirectory available");
        return;
      }

      // copy to our app directory
      await FileSystem.copyAsync({
        from: originalUri,
        to: localPath,
      });

      // read as base64
      const base64 = await FileSystem.readAsStringAsync(localPath, {
        encoding: "base64",
      });
      

      const CHUNK_SIZE = 30000;
      let index = 0;

      for (let offset = 0; offset < base64.length; offset += CHUNK_SIZE) {
        const chunk = base64.slice(offset, offset + CHUNK_SIZE);
        const isLast = offset + CHUNK_SIZE >= base64.length;

        socket.emit("file-chunk", {
          chatId,
          senderId: currentUserId,
          receiverId,
          storageKey,
          fileName,
          chunk,
          chunkIndex: index,
          isLast,
        });

        index++;
      }

      // Save file message metadata to Firebase
      const chatRef = ref(db, `chats/${chatId}/messages`);
      await push(chatRef, {
        senderId: currentUserId,
        receiverId,
        type: "file",
        fileName,
        storageKey,
        timestamp: Date.now(),
      });

      // optional notify for file
      if (SEND_NOTIFY) {
        try {
          await fetch(`${SEND_NOTIFY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              receiverId,
              message: "sent you a file",
              senderName: "",
            }),
          });
        } catch (err) {
          console.error("Error sending file notify:", err);
        }
      }
    } catch (err) {
      console.error("handleSendFile error:", err);
    }
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isSender = item.senderId === currentUserId;
    const isFile = item.type === "file" && item.storageKey;

    const fileUri =
      isFile && baseDir ? `${baseDir}${item.storageKey}` : undefined;

    const isImage =
      isFile &&
      item.fileName &&
      /\.(png|jpe?g|gif|webp)$/i.test(item.fileName || "");

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
          {isFile && fileUri ? (
            <>
              <Text style={styles.fileNameText}>
                {item.fileName || "File"}
              </Text>
              {isImage ? (
                <TouchableOpacity
  onPress={() => {
    navigation.navigate("ImageViewer", { uri: fileUri });
  }}
>
  <Image 
    source={{ uri: fileUri }} 
    style={styles.fileImage}
  />
</TouchableOpacity>
              ) : (
                <Text style={styles.messageTextSmall}>
                  (Tap to open from device storage)
                </Text>
              )}
              <Text style={styles.timeText}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.timeText}>
                {new Date(item.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </>
          )}
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
            {/* 📎 attach inside input */}
            <TouchableOpacity
              onPress={handleSendFile}
              style={styles.attachButton}
            >
              <Ionicons name="attach" size={20} color="#e5e7eb" />
            </TouchableOpacity>

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
  messageTextSmall: {
    color: "#cbd5e1",
    fontSize: 12,
    marginTop: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  attachButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    marginRight: 4,
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
  fileNameText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  fileImage: {
    width: 170,
    height: 170,
    borderRadius: 12,
    backgroundColor: "#020617",
  },
});
