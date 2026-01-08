import { ref, onChildAdded,get } from "firebase/database";
import { db } from "@/config/firebaseConfig";
import { handleIncomingMessage } from "@/services/notifications";

/**
 * Tracks whether initial history has been consumed per chat
 */

console.log("here in ");

const lastSeenTimestamp: Record<string, number> = {};

export const listenToChatMessages = async (chatId: string) => {7
  const chatRef = ref(db, `chats/${chatId}/messages`);

  const snapshot = await get(chatRef);

  if (snapshot.exists()) {
    const values = Object.values(snapshot.val()) as any[];
    const last = values[values.length - 1];
    lastSeenTimestamp[chatId] = last?.timestamp ?? 0;
  } else {
    lastSeenTimestamp[chatId] = 0;
  }

  // 🔑 STEP 2: listen for NEW messages only
  return onChildAdded(chatRef, (snap) => {
    const message = snap.val();
    if (!message) return;

    // 🛑 Ignore history
    if (message.timestamp <= lastSeenTimestamp[chatId]) return;

    // ✅ Update last seen
    lastSeenTimestamp[chatId] = message.timestamp;

    console.log("🔔 NEW MESSAGE:", message);

    // ✅ Only real-time new messages reach here
    handleIncomingMessage({
      chatId,
      text: message.text,
      senderName: "New message",
    });
  });
};
