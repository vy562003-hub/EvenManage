import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  senderId: string;
  receiverId: string;
  text?: string;
  type: "text" | "file";
  timestamp: number;
  fileName?: string;
  storageKey?: string;
}

interface ChatState {
  messages: Message[];
}

const initialState: ChatState = {
  messages: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    clearChat(state) {
      state.messages = [];
    },
  },
});

export const { setMessages, addMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
