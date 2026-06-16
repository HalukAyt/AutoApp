import { Ionicons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserAvatar } from "@/components/UserAvatar";
import { getFollowers, getFollowing } from "@/services/profileService";
import type { ProfileConnection } from "@/types/domain";
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

type ConnectionType = "followers" | "following";

type UserConnectionsParams = {
  type?: string | string[];
  username?: string | string[];
};

const TEXT = {
  emptyFollowers: "Hen\u00fcz takip\u00e7i yok.",
  emptyFollowing: "Hen\u00fcz takip edilen yok.",
  error: "Liste al\u0131namad\u0131.",
  followers: "Takip\u00e7iler",
  following: "Takip Edilen",
  self: "Sen",
};

export default function UserConnectionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<UserConnectionsParams>();
  const username = readParam(params.username)?.replace(/^@/, "").trim() ?? "";
  const type = readConnectionType(readParam(params.type));
  const [users, setUsers] = useState<ProfileConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const data =
        type === "followers"
          ? await getFollowers(username)
          : await getFollowing(username);
      setUsers(data);
    } catch (error) {
      console.log("Connections fetch error:", error);
      Alert.alert("Hata", TEXT.error);
    } finally {
      setLoading(false);
    }
  }, [type, username]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchUsers();
    }, [fetchUsers]),
  );

  const openUserProfile = (connection: ProfileConnection) => {
    const cleanUsername = connection.username?.replace(/^@/, "").trim();

    if (!cleanUsername) return;

    router.push({
      pathname: "/user-profile",
      params: { username: cleanUsername },
    });
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {type === "followers" ? TEXT.followers : TEXT.following}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {users.length > 0 ? (
          users.map((user) => (
            <Pressable
              key={user.id}
              style={styles.userRow}
              onPress={() => openUserProfile(user)}
            >
              <UserAvatar
                imageUrl={user.profilePhoto}
                name={user.name}
                username={user.username}
                size={44}
                borderRadius={8}
              />
              <View style={styles.userTextBlock}>
                <Text style={styles.name} numberOfLines={1}>
                  {user.name || user.username}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                  @{user.username.replace(/^@/, "")}
                </Text>
              </View>
              {user.ownProfile ? (
                <Text style={styles.selfBadge}>{TEXT.self}</Text>
              ) : null}
            </Pressable>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {type === "followers" ? TEXT.emptyFollowers : TEXT.emptyFollowing}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function readConnectionType(value?: string): ConnectionType {
  return value === "following" ? "following" : "followers";
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
    padding: 32,
  },
  emptyText: {
    color: "#b9bbc2",
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
  name: {
    color: "#f4f4f6",
    fontSize: 14,
    fontWeight: "900",
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  selfBadge: {
    backgroundColor: "#302a22",
    borderRadius: 8,
    color: "#c47a2d",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  userRow: {
    alignItems: "center",
    backgroundColor: "#1f2227",
    borderColor: "#30333b",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 10,
  },
  userTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  username: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
});
