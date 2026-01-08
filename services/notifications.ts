import * as Notifications from "expo-notifications";
import { getActiveChat } from "@/utils/chatPresence";

type IncomingMessage = {
  chatId: string;
  text?: string;
  senderName?: string;
};

export const handleIncomingMessage = async (
  message: IncomingMessage
) => {
  const activeChat = getActiveChat();

  console.log('activechat',activeChat);
  console.log(message.chatId,'messagechatid');
  
  

  // ❌ User already on this chat
  if (activeChat === message.chatId) return;

  console.log('calling notification');
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: message.senderName ?? "New message",
      body: message.text ?? "Sent you a file",
      sound: true,
    },
    trigger: null, // immediate
  });
};
