import { Ionicons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserAvatar } from "@/components/UserAvatar";
import { getDirectConversations } from "@/services/directMessageService";
import type { DirectConversation } from "@/types/domain";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TEXT = {
  detailError: "Mesajlar al\u0131namad\u0131.",
  empty: "Hen\u00fcz mesaj yok.",
  inbox: "Mesajlar",
};

export default function DirectInbox() {
  const router = useRouter();
  const [conversations, setConversations] = useState<DirectConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const data = await getDirectConversations();
      setConversations(data);
    } catch (error) {
      console.log("Direct conversations error:", error);
      Alert.alert("Hata", TEXT.detailError);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConversations(true);
      const refreshTimer = setInterval(() => {
        fetchConversations();
      }, 4000);

      return () => clearInterval(refreshTimer);
    }, [fetchConversations]),
  );

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
        </Pressable>
        <Text style={styles.headerTitle}>{TEXT.inbox}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {conversations.length > 0 ? (
          conversations.map((conversation) => (
            <Pressable
              key={conversation.otherUserId}
              style={styles.conversationRow}
              onPress={() =>
                router.push({
                  pathname: "/direct-chat",
                  params: {
                    name: conversation.otherName,
                    profilePhoto: conversation.otherProfilePhoto ?? "",
                    username: conversation.otherUsername,
                  },
                })
              }
            >
              <UserAvatar
                imageUrl={conversation.otherProfilePhoto}
                name={conversation.otherName}
                username={conversation.otherUsername}
                size={48}
                borderRadius={10}
              />
              <View style={styles.conversationText}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>
                    {conversation.otherName || conversation.otherUsername}
                  </Text>
                  <Text style={styles.time}>
                    {formatMessageTime(conversation.lastMessageAt)}
                  </Text>
                </View>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {conversation.lastMessage}
                </Text>
              </View>
              {conversation.unreadCount > 0 ? (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="paper-plane-outline" size={30} color="#c47a2d" />
            <Text style={styles.emptyText}>{TEXT.empty}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
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
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  conversationRow: {
    alignItems: "center",
    backgroundColor: "#1f2227",
    borderColor: "#30333b",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 12,
  },
  conversationText: {
    flex: 1,
    minWidth: 0,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 34,
  },
  emptyText: {
    color: "#b9bbc2",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: "#f4f4f6",
    fontSize: 19,
    fontWeight: "900",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  lastMessage: {
    color: "#aeb1ba",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
  },
  name: {
    color: "#f4f4f6",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  time: {
    color: "#8f929b",
    fontSize: 11,
    fontWeight: "800",
  },
  unreadBadge: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    minWidth: 24,
    paddingHorizontal: 7,
  },
  unreadText: {
    color: "#111213",
    fontSize: 11,
    fontWeight: "900",
  },
});
