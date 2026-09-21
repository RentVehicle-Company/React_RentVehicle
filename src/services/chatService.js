import { API_BASE_URL, request } from "./api.js";

export const sendChatMessage = async (conversationId, message) => {
  const payload = {
    conversationId:
      conversationId === undefined || conversationId === null
        ? 1
        : Number(conversationId),
    message: String(message ?? "").trim(),
  };

  if (!payload.message) {
    const error = new Error("Message is required.");
    error.status = 400;
    throw error;
  }

  const response = await request(`${API_BASE_URL}/chat`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response) {
    throw new Error("Failed to send chat message - no response from server");
  }

  const replyMessage =
    typeof response === "string"
      ? response
      : response.message || response.data?.message || "";

  if (!replyMessage) {
    throw new Error("Chat service returned an empty response.");
  }

  return replyMessage;
};
