import {
  addPostComment,
  getPostComments,
  togglePostLike,
} from "@/services/postService";
import { UserAvatar } from "@/components/UserAvatar";
import type { FeedPost, PostCommentContent } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface FeedPostCardProps {
  post: FeedPost;
}

export function FeedPostCard({ post }: FeedPostCardProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likeCount, setLikeCount] = useState(post.likesCount);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentCount, setCommentCount] = useState(post.commentsCount);
  const [comments, setComments] = useState<PostCommentContent[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsLoaded, setCommentsLoaded] = useState(false);

  const openUserProfile = (username?: string | null) => {
    const cleanUsername = username?.replace(/^@/, "").trim();

    if (!cleanUsername) return;

    router.push({
      pathname: "/user-profile",
      params: { username: cleanUsername },
    });
  };

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

    try {
      await togglePostLike(post.id);
    } catch (error) {
      setLiked(!liked);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
      console.log("Like error:", error);
    }
  };

  const handleCommentPress = async () => {
    setShowCommentInput(!showCommentInput);

    if (!showCommentInput && !commentsLoaded) {
      setCommentsLoading(true);
      try {
        const postComments = await getPostComments(post.id);
        setComments(postComments);
        setCommentsLoaded(true);
      } catch (error) {
        console.log("Comment fetch error:", error);
      } finally {
        setCommentsLoading(false);
      }
    }
  };

  const handleCommentSubmit = async () => {
    const trimmedComment = commentText.trim();
    if (!trimmedComment) return;

    try {
      await addPostComment(post.id, trimmedComment);
      const postComments = await getPostComments(post.id);

      setCommentCount((prev) => prev + 1);
      setComments(postComments);
      setCommentsLoaded(true);
      setCommentText("");
    } catch (error) {
      console.log("Comment submit error:", error);
      Alert.alert("Hata", "Yorum gönderilemedi.");
    }
  };

  return (
    <View style={styles.post}>
      <Pressable
        style={styles.authorRow}
        onPress={() => openUserProfile(post.authorUsername)}
      >
        <UserAvatar
          imageUrl={post.authorProfilePhoto}
          name={post.authorName}
          username={post.authorUsername}
          size={30}
          borderRadius={15}
          style={styles.authorAvatar}
        />
        <Text style={styles.author}>{post.authorName}</Text>
      </Pressable>

      {post.postPhoto && (
        <Image
          source={{ uri: getSecureImageUrl(post.postPhoto) }}
          style={styles.postImage}
          contentFit="cover"
          transition={200}
        />
      )}

      <View style={styles.actionRow}>
        <Pressable onPress={handleLike} style={styles.actionButton}>
          <Text style={[styles.actionIcon, liked && styles.likedIcon]}>
            {liked ? "\u2764\ufe0f" : "\u2661"}
          </Text>
          <Text style={styles.actionText}>{likeCount}</Text>
        </Pressable>

        <Pressable onPress={handleCommentPress} style={styles.actionButton}>
          <Text style={styles.actionIcon}>{"\ud83d\udcac"}</Text>
          <Text style={styles.actionText}>{commentCount}</Text>
        </Pressable>
      </View>

      <Text style={styles.caption}>
        <Text style={styles.username}>{post.authorName}</Text>{" "}
        {post.content}
      </Text>
      <Text style={styles.time}>{post.time}</Text>

      {showCommentInput && (
        <View style={styles.commentSection}>
          {commentsLoading ? (
            <ActivityIndicator
              size="small"
              color="#c47a2d"
              style={styles.commentLoader}
            />
          ) : (
            comments.map((item, index) => (
              <Pressable
                key={`${item.authorUsername}-${index}`}
                style={styles.commentRow}
                onPress={() => openUserProfile(item.authorUsername)}
              >
                <UserAvatar
                  imageUrl={item.authorProfilePhoto}
                  name={item.authorName}
                  username={item.authorUsername}
                  size={28}
                  borderRadius={14}
                  style={styles.commentAvatar}
                />
                <View style={styles.commentTextBubble}>
                  <Text style={styles.commentUsername}>
                    {item.authorName || item.authorUsername}
                  </Text>
                  <Text style={styles.commentContentText}>{item.content}</Text>
                </View>
              </Pressable>
            ))
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorum ekle..."
              placeholderTextColor="#a9a9ae"
              value={commentText}
              onChangeText={setCommentText}
              autoFocus
            />
            <Pressable
              onPress={handleCommentSubmit}
              style={styles.commentSubmitBtn}
            >
              <Text style={styles.commentSubmitText}>{"Paylaş"}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  actionIcon: {
    color: "#f2f2f4",
    fontSize: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
    marginTop: 12,
  },
  actionText: {
    color: "#f2f2f4",
    fontSize: 14,
    fontWeight: "700",
  },
  author: {
    color: "#f2f2f4",
    fontSize: 16,
    fontWeight: "800",
  },
  authorAvatar: {
    borderRadius: 15,
    height: 30,
    marginRight: 10,
    width: 30,
  },
  authorRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 10,
  },
  caption: {
    color: "#f0f0f2",
    fontSize: 14,
    marginTop: 4,
  },
  commentAvatar: {
    borderRadius: 14,
    height: 28,
    marginRight: 10,
    width: 28,
  },
  commentContentText: {
    color: "#d1d1d5",
    fontSize: 13,
  },
  commentInput: {
    backgroundColor: "#34353a",
    borderRadius: 20,
    color: "#fff",
    flex: 1,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  commentInputRow: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  commentLoader: {
    marginVertical: 10,
  },
  commentRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    marginBottom: 12,
  },
  commentSection: {
    borderTopColor: "#34353a",
    borderTopWidth: 1,
    marginTop: 10,
    paddingTop: 10,
  },
  commentSubmitBtn: {
    padding: 8,
  },
  commentSubmitText: {
    color: "#c47a2d",
    fontSize: 14,
    fontWeight: "800",
  },
  commentTextBubble: {
    backgroundColor: "#2a2b30",
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commentUsername: {
    color: "#f2f2f4",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  likedIcon: {
    color: "#e74c3c",
  },
  post: {
    borderTopColor: "#34353a",
    borderTopWidth: 1,
    marginBottom: 26,
    paddingTop: 14,
  },
  postImage: {
    borderRadius: 8,
    height: 220,
    marginTop: 8,
    width: "100%",
  },
  time: {
    color: "#c7c7cc",
    fontSize: 12,
    marginTop: 4,
  },
  username: {
    fontWeight: "800",
  },
});
