let activeChatId: string | null = "";

export const setActiveChat = (chatId: string | null) => {
  activeChatId = chatId;
};

export const getActiveChat = () => activeChatId;
