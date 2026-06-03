import { FeedPostCard } from "@/components/feed/FeedPostCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getFeedPosts } from "@/services/postService";
import type { FeedPost } from "@/types/domain";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

const defaultAvatar = require("../assets/images/3.jpg");

const users = [
  { name: "Semih \u0130lkay", image: require("../assets/images/3.jpg") },
  { name: "jade", image: require("../assets/images/19.jpeg") },
  { name: "madeline", image: require("../assets/images/23.jpg") },
  { name: "katrina", image: require("../assets/images/18.jpeg") },
];

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const feedPosts = await getFeedPosts();
        setPosts(feedPosts);
      } catch (error) {
        console.error("Feed fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.logo}>AutoTrack</Text>

        <View style={styles.storyRow}>
          {users.map((user) => (
            <View style={styles.story} key={user.name}>
              <Image
                source={user.image}
                style={styles.storyImage}
                contentFit="cover"
              />
              <Text style={styles.storyName} numberOfLines={1}>
                {user.name}
              </Text>
            </View>
          ))}
        </View>

        {posts.length > 0 ? (
          posts.map((post) => (
            <FeedPostCard
              key={post.id}
              post={post}
              defaultAvatar={defaultAvatar}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>
            {"Hen\u00fcz kimse bir \u015fey payla\u015fmam\u0131\u015f."}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 34,
    paddingHorizontal: 24,
    paddingTop: 22,
  },
  emptyText: {
    color: "#a9a9ae",
    marginTop: 40,
    textAlign: "center",
  },
  logo: {
    color: "#c47a2d",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  story: {
    alignItems: "center",
    width: 72,
  },
  storyImage: {
    borderColor: "#c457a5",
    borderRadius: 8,
    borderWidth: 2,
    height: 58,
    width: 58,
  },
  storyName: {
    color: "#f2f2f4",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
  },
  storyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
});