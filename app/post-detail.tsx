import { Ionicons } from "@expo/vector-icons";
import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getPost } from "@/services/postService";
import type { FeedPost } from "@/types/domain";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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

type PostDetailParams = {
  id?: string | string[];
};

const TEXT = {
  detailError: "Gonderi detayi alinamadi.",
  post: "Gonderi",
};

export default function PostDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<PostDetailParams>();
  const postId = Number(readParam(params.id));
  const [post, setPost] = useState<FeedPost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    if (!Number.isFinite(postId)) {
      setLoading(false);
      return;
    }

    try {
      const data = await getPost(postId);
      setPost(data);
    } catch (error) {
      console.log("Post detail fetch error:", error);
      Alert.alert("Hata", TEXT.detailError);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPost();
    }, [fetchPost]),
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
        <Text style={styles.headerTitle}>{TEXT.post}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {post ? (
          <FeedPostCard post={post} />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{TEXT.detailError}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: "#aeb1ba",
    fontSize: 13,
    fontWeight: "700",
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
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
});
