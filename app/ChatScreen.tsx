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
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  process.env.EXPO_PUBLIC_SOCKET_URL_LOCAL || "https://eventmanage.westindia.azurecontainerapps.io";

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

  const insets = useSafeAreaInsets();

  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const socketRef = useRef<Socket | null>(null);
  const fileBuffersRef = useRef<Record<string, string[]>>({});

  const baseDir =
    FileSystem.documentDirectory || FileSystem.cacheDirectory || "";

  const chatId =
    currentUserId && receiverId
      ? currentUserId < receiverId
        ? `${currentUserId}_${receiverId}`
        : `${receiverId}_${currentUserId}`
      : "";

  /* ------------------ animations ------------------ */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  /* ------------------ session ------------------ */
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`${USER_ID}`, { credentials: "include" });
        const data = await res.json();
        if (data?.userId) setCurrentUserId(data.userId);
      } catch (err) {
        console.error("Error fetching session:", err);
      }
    };
    fetchSession();
  }, []);

  /* ------------------ socket ------------------ */
  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", currentUserId);
    });

    socket.on("file-chunk", async (data) => {
      try {
        const {
          chatId: incomingChatId,
          storageKey,
          chunk,
          chunkIndex,
          isLast,
        } = data;

        if (!incomingChatId || !storageKey || !chunk) return;

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
        }
      } catch (err) {
        console.error("file-chunk error:", err);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      fileBuffersRef.current = {};
    };
  }, [currentUserId, baseDir]);

  /* ------------------ firebase ------------------ */
  useEffect(() => {
    if (!currentUserId || !chatId) return;

    const chatRef = ref(db, `chats/${chatId}/messages`);
    const unsubscribe = onValue(chatRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(
        data
          ? Object.values(data).sort(
              (a: any, b: any) => a.timestamp - b.timestamp
            )
          : []
      );
    });

    return () => unsubscribe();
  }, [currentUserId, chatId]);

  /* ------------------ send text ------------------ */
  const sendMessage = async () => {
    if (!text.trim() || !chatId) return;

    const chatRef = ref(db, `chats/${chatId}/messages`);
    await push(chatRef, {
      senderId: currentUserId,
      receiverId,
      type: "text",
      text,
      timestamp: Date.now(),
    });

    setText("");
  };

  /* ------------------ send file ------------------ */
  const handleSendFile = async () => {
    try {
      if (!socketRef.current || !socketRef.current.connected) return;

      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const fileName = asset.name || `file_${Date.now()}`;
      const storageKey = `${chatId}_${Date.now()}_${fileName.replace(
        /\s+/g,
        "_"
      )}`;
      const localPath = `${baseDir}${storageKey}`;

      await FileSystem.copyAsync({
        from: asset.uri,
        to: localPath,
      });

      const base64 = await FileSystem.readAsStringAsync(localPath, {
        encoding: "base64",
      });

      const CHUNK_SIZE = 30000;
      let index = 0;

      for (let i = 0; i < base64.length; i += CHUNK_SIZE) {
        socketRef.current.emit("file-chunk", {
          chatId,
          senderId: currentUserId,
          receiverId,
          storageKey,
          fileName,
          chunk: base64.slice(i, i + CHUNK_SIZE),
          chunkIndex: index++,
          isLast: i + CHUNK_SIZE >= base64.length,
        });
      }

      const chatRef = ref(db, `chats/${chatId}/messages`);
      await push(chatRef, {
        senderId: currentUserId,
        receiverId,
        type: "file",
        fileName,
        storageKey,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("handleSendFile error:", err);
    }
  };

  /* ------------------ render message ------------------ */
  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isSender = item.senderId === currentUserId;
    const isFile = item.type === "file" && item.storageKey;
    const fileUri = isFile ? `${baseDir}${item.storageKey}` : undefined;
    const isImage =
      isFile &&
      item.fileName &&
      /\.(png|jpe?g|gif|webp)$/i.test(item.fileName);

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
              <Text style={styles.fileNameText}>{item.fileName}</Text>
              {isImage && (
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("ImageViewer", { uri: fileUri })
                  }
                >
                  <Image source={{ uri: fileUri }} style={styles.fileImage} />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <Text style={styles.messageText}>{item.text}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View
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
              onPress={() => navigation.back()}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.receiverName}>{receiverName}</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </View>
        </Animated.View>

        <FlatList
          data={messages}
          renderItem={renderItem}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={styles.messagesContainer}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TouchableOpacity onPress={handleSendFile}>
              <Ionicons name="attach" size={20} color="#e5e7eb" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor="#aaa"
            />
            {text.length > 0 && (
              <TouchableOpacity onPress={sendMessage}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

/* ------------------ styles ------------------ */
const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#0f172a" },
  container: { flex: 1 },
  header: { backgroundColor: "#1e293b", padding: 14 },
  headerContent: { flexDirection: "row", alignItems: "center" },
  receiverName: { color: "#fff", fontSize: 18, fontWeight: "700" },
  status: { color: "#94a3b8", fontSize: 12 },
  messagesContainer: { padding: 12 },
  messageWrapper: { marginVertical: 4 },
  messageBubble: { maxWidth: "75%", padding: 12, borderRadius: 18 },
  senderBubble: { backgroundColor: "#2563eb", alignSelf: "flex-end" },
  receiverBubble: { backgroundColor: "#334155", alignSelf: "flex-start" },
  messageText: { color: "#fff" },
  alignRight: { alignItems: "flex-end" },
  alignLeft: { alignItems: "flex-start" },
  inputContainer: { backgroundColor: "#1e293b", padding: 10 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155",
    borderRadius: 25,
    paddingHorizontal: 12,
  },
  input: { flex: 1, color: "#fff" },
  fileNameText: { color: "#e5e7eb", fontSize: 13, marginBottom: 6 },
  fileImage: { width: 170, height: 170, borderRadius: 12 },
});
