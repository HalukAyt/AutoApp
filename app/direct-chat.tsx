import { Ionicons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserAvatar } from "@/components/UserAvatar";
import {
  getDirectMessages,
  sendDirectMessage,
} from "@/services/directMessageService";
import type { DirectMessage } from "@/types/domain";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type DirectChatParams = {
  name?: string | string[];
  profilePhoto?: string | string[];
  username?: string | string[];
};

const TEXT = {
  error: "Mesajlar al\u0131namad\u0131.",
  messagePlaceholder: "Mesaj yaz...",
  sendError: "Mesaj g\u00f6nderilemedi.",
};

export default function DirectChat() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView | null>(null);
  const params = useLocalSearchParams<DirectChatParams>();
  const username = readParam(params.username)?.replace(/^@/, "").trim() ?? "";
  const displayName = readParam(params.name) || `@${username}`;
  const profilePhoto = readParam(params.profilePhoto) || null;
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async (showLoader = false) => {
    if (!username) {
      setLoading(false);
      return;
    }

    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await getDirectMessages(username);
      setMessages(data);
    } catch (error) {
      console.log("Direct messages error:", error);
      Alert.alert("Hata", TEXT.error);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      fetchMessages(true);
      const refreshTimer = setInterval(() => {
        fetchMessages();
      }, 3000);

      return () => clearInterval(refreshTimer);
    }, [fetchMessages]),
  );

  const handleSend = async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || sending) return;

    try {
      setSending(true);
      const sentMessage = await sendDirectMessage(username, trimmedMessage);
      setMessages((currentMessages) => [...currentMessages, sentMessage]);
      setMessageText("");
      fetchMessages();
    } catch (error) {
      console.log("Direct send error:", error);
      Alert.alert("Hata", TEXT.sendError);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
          </Pressable>
          <Pressable
            style={styles.headerUser}
            onPress={() =>
              router.push({
                pathname: "/user-profile",
                params: { username },
              })
            }
          >
            <UserAvatar
              imageUrl={profilePhoto}
              name={displayName}
              username={username}
              size={36}
              borderRadius={8}
            />
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {displayName}
              </Text>
              <Text style={styles.headerUsername} numberOfLines={1}>
                @{username}
              </Text>
            </View>
          </Pressable>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.sentByMe ? styles.messageRowOwn : null,
              ]}
            >
              {!message.sentByMe ? (
                <UserAvatar
                  imageUrl={message.senderProfilePhoto}
                  name={message.senderName}
                  username={message.senderUsername}
                  size={28}
                  borderRadius={7}
                />
              ) : null}
              <View
                style={[
                  styles.bubble,
                  message.sentByMe ? styles.ownBubble : styles.otherBubble,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sentByMe ? styles.ownMessageText : null,
                  ]}
                >
                  {message.content}
                </Text>
                <Text
                  style={[
                    styles.messageTime,
                    message.sentByMe ? styles.ownMessageTime : null,
                  ]}
                >
                  {formatMessageTime(message.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder={TEXT.messagePlaceholder}
            placeholderTextColor="#8f929b"
            value={messageText}
            onChangeText={setMessageText}
            multiline
          />
          <Pressable
            style={[
              styles.sendButton,
              !messageText.trim() || sending ? styles.disabledButton : null,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#111213" />
            ) : (
              <Ionicons name="send" size={18} color="#111213" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatMessageTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 8,
    maxWidth: "78%",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  disabledButton: {
    opacity: 0.55,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  headerTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  headerTitle: {
    color: "#f4f4f6",
    fontSize: 16,
    fontWeight: "900",
  },
  headerUser: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minWidth: 0,
  },
  headerUsername: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  input: {
    backgroundColor: "#24272e",
    borderColor: "#343842",
    borderRadius: 8,
    borderWidth: 1,
    color: "#f4f4f6",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    maxHeight: 100,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputWrap: {
    alignItems: "flex-end",
    borderTopColor: "#30333b",
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    padding: 12,
  },
  keyboardView: {
    flex: 1,
  },
  messageRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  messageRowOwn: {
    justifyContent: "flex-end",
  },
  messageText: {
    color: "#f4f4f6",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  messageTime: {
    color: "#aeb1ba",
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5,
    textAlign: "right",
  },
  messagesContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
    padding: 16,
  },
  otherBubble: {
    backgroundColor: "#30333a",
  },
  ownBubble: {
    backgroundColor: "#c47a2d",
  },
  ownMessageText: {
    color: "#111213",
  },
  ownMessageTime: {
    color: "#3e2a14",
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  sendButton: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 44,
  },
});
