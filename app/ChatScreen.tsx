import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Image,
  Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ref, push, onValue } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { useRoute } from "@react-navigation/native";
import io, { Socket } from "socket.io-client";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { useNavigation } from "expo-router";
import { setActiveChat } from "@/utils/chatPresence";
import * as Notifications from "expo-notifications";
import { useHeaderHeight } from '@react-navigation/elements';

const USER_ID = process.env.EXPO_PUBLIC_USER_ID_LOCAL;
const SEND_NOTIFY = process.env.EXPO_PUBLIC_SEND_NOTIFY_LOCAL;
const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL_LOCAL ||"https://event-server.yellowbush-163ce8ef.centralindia.azurecontainerapps.io";

type ChatMessage = {
  senderId: string;
  receiverId: string;
  type?: "text" | "file";
  text?: string;
  fileName?: string;
  storageKey?: string;
  
  timestamp: number;
};
let chatId:any = null;


export default function ChatScreen() {
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const route = useRoute();
  const { receiverId, receiverName } = route.params as {
    receiverId: string;
    receiverName: string;
  };

  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const socketRef = useRef<Socket | null>(null);
  const fileBuffersRef = useRef<Record<string, string[]>>({});

  const baseDir =
    FileSystem.documentDirectory || FileSystem.cacheDirectory || "";

  const [currentUserId, setCurrentUserId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [verticaloffset,setVerticaloffset] = useState(0);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleKeyboardShow = (event) => {
    console.log('keyboard - visible ');
    
    setVerticaloffset(-34);
    
    
    setIsKeyboardVisible(true);
  };

  const handleKeyboardHide = (event) => {
    console.log('keyboard - not- visible ');
    setVerticaloffset(0);
    setIsKeyboardVisible(false);
  };

 

  /* ------------------ animations ------------------ */
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

    // 1️⃣ Get current user from backend session
    useEffect(() => {
      console.log('fetch user');
      console.log(USER_ID,"USER_ID");
      
      
      const fetchSession = async () => {
        try {
          const res = await fetch(`${USER_ID}`, {
            credentials: "include",
          });
          const data = await res.json();
          console.log(data,'chat screen');
          
          if (data?.userId) {
            setCurrentUserId(data.userId);
            console.log(data.userId);
            
          } else {
            console.warn("No userId in session response");
          }
        } catch (err) {
          console.error("Error fetching session:", err);
        }
      };
      fetchSession();
    }, []);
  
    
    

      console.log(chatId,'chat id from chat screen');
/*-------- saving chat id globally whom to notification is not to be send ---------
  */
      useEffect(() => {
        
        chatId = currentUserId && receiverId
        ? currentUserId < receiverId
          ? `${currentUserId}_${receiverId}`
          : `${receiverId}_${currentUserId}`
        : "";

        console.log(chatId,'chat id from chat screen-2');
        setActiveChat(chatId);
        return () => setActiveChat(null);
      }, [chatId]);


   /* ------------------ firebase ------------------ */
   useEffect(() => {
    if (!currentUserId || !chatId) return;

    const chatRef = ref(db, `chats/${chatId}/messages`);
    return onValue(chatRef, snapshot => {
      const data = snapshot.val();
      
      
      setMessages(
        data
          ? Object.values(data).sort(
              (a: any, b: any) => a.timestamp - b.timestamp
            )
          : []
      );
    });
  }, [currentUserId, chatId]);

  /* ------------------ socket ------------------ */
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

 
  /* ------------------ auto scroll ------------------ */
  useEffect(() => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages]);

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

    if (SEND_NOTIFY) {

      const token = await Notifications.getExpoPushTokenAsync();
  console.log("✅ EXPO PUSH TOKEN:", token.data);
      await fetch(SEND_NOTIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId,
          message: text,
          senderName: "",
        }),
      });
    }
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

      await FileSystem.copyAsync({ from: asset.uri, to: localPath });

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

      await push(ref(db, `chats/${chatId}/messages`), {
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
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={isKeyboardVisible?-34:0}
      >
        {/* TOP */}
        <View style={styles.safeContainer}>
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <Ionicons
              name="arrow-back"
              size={22}
              color="#fff"
              onPress={() => {
                setActiveChat(null)
                navigation.pop()
              }}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.receiverName}>{receiverName}</Text>
              <Text style={styles.status}>Online</Text>
            </View>
          </Animated.View>
  
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.messagesContainer}
          />
        </View>
  
        {/* INPUT */}
        <View style={styles.inputSafe}>
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
    </SafeAreaView>
  );
  
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    paddingBottom:0,
  },

  safeContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },

  header: {
    backgroundColor: "#1e293b",
    padding: 14,
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
    padding: 12,
    paddingBottom: 10,
  },

  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
  },

  senderBubble: {
    backgroundColor: "#2563eb",
    alignSelf: "flex-end",
  },

  receiverBubble: {
    backgroundColor: "#334155",
    alignSelf: "flex-start",
  },

  messageText: {
    color: "#fff",
    fontSize: 15,
  },

  inputSafe: {
    backgroundColor: "#1e293b",
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#334155",
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 25,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    marginHorizontal: 8,
  },

  fileNameText: {
    color: "#e5e7eb",
    fontSize: 13,
    marginBottom: 6,
  },

  fileImage: {
    width: 170,
    height: 170,
    borderRadius: 12,
  },
});


