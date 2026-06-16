import { Ionicons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProfilePostRow } from "@/components/profile/ProfilePostRow";
import { ProfileRouteRow } from "@/components/profile/ProfileRouteRow";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { UserAvatar } from "@/components/UserAvatar";
import { followUser, getUserProfile, unfollowUser } from "@/services/profileService";
import type { UserProfile, Vehicle } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { buildRouteMapParams } from "@/utils/routeMapParams";
import { Image } from "expo-image";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const coverFallback = require("../assets/images/21.jpg");
const postFallback = require("../assets/images/33.jpg");
const vehicleFallbacks = [
  require("../assets/images/5.jpg"),
  require("../assets/images/6.jpg"),
];

type UserProfileParams = {
  username?: string | string[];
};

type ConnectionType = "followers" | "following";

const TEXT = {
  followers: " Takip\u00e7i",
  following: " Takip Edilen",
  follow: "Takip Et",
  followError: "Takip i\u015flemi yap\u0131lamad\u0131.",
  garage: "Garaj",
  noGarage: "Garajda hen\u00fcz ara\u00e7 yok.",
  noPost: "Hen\u00fcz g\u00f6nderi yok.",
  noRoute: "Hen\u00fcz rota yok.",
  posts: "G\u00f6nderiler",
  profile: "Profil",
  profileError: "Profil bilgileri al\u0131namad\u0131.",
  routes: "Rotalar",
  unfollow: "Takipten \u00c7\u0131k",
};

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<UserProfileParams>();
  const username = readParam(params.username)?.replace(/^@/, "").trim() ?? "";
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [followUpdating, setFollowUpdating] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const data = await getUserProfile(username);
      setProfile(data);
    } catch (error) {
      console.log("User profile fetch error:", error);
      Alert.alert("Hata", TEXT.profileError);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchProfile();
    }, [fetchProfile]),
  );

  const handleToggleFollow = async () => {
    if (!profile || profile.ownProfile || followUpdating) return;

    const previousProfile = profile;
    const nextFollowed = !profile.followedByMe;

    setProfile({
      ...profile,
      followedByMe: nextFollowed,
      followerCount: Math.max(
        0,
        profile.followerCount + (nextFollowed ? 1 : -1),
      ),
    });
    setFollowUpdating(true);

    try {
      const updatedProfile = nextFollowed
        ? await followUser(username)
        : await unfollowUser(username);
      setProfile(updatedProfile);
    } catch (error) {
      console.log("Follow toggle error:", error);
      setProfile(previousProfile);
      Alert.alert("Hata", TEXT.followError);
    } finally {
      setFollowUpdating(false);
    }
  };

  const openConnections = (type: ConnectionType) => {
    if (!username) return;

    router.push({
      pathname: "/user-connections",
      params: { type, username },
    });
  };

  const openDirectMessage = () => {
    if (!profile || !username) return;

    router.push({
      pathname: "/direct-chat",
      params: {
        name: formatFullName(profile),
        profilePhoto: profile.profilePhoto ?? "",
        username,
      },
    });
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={TEXT.profile} onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{TEXT.profileError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const garage = profile.garage ?? [];
  const posts = profile.posts ?? [];
  const routes = profile.routes ?? [];
  const fullName = formatFullName(profile);
  const displayUsername = formatUsername(profile.username || profile.userName);
  const coverSource = profile.coverPhoto
    ? { uri: getSecureImageUrl(profile.coverPhoto) }
    : coverFallback;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={TEXT.profile} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.coverWrap}>
          <Image source={coverSource} style={styles.coverImage} contentFit="cover" />
        </View>

        <View style={styles.profileHeader}>
          <UserAvatar
            imageUrl={profile.profilePhoto}
            name={fullName}
            username={displayUsername}
            size={82}
            borderRadius={8}
            textSize={24}
            style={styles.avatar}
          />

          <View style={styles.identity}>
            <Text style={styles.name} numberOfLines={1}>
              {fullName}
            </Text>
            <Text style={styles.username}>{displayUsername}</Text>
            <View style={styles.followRow}>
              <Pressable
                style={styles.followMetric}
                onPress={() => openConnections("followers")}
              >
                <Text style={styles.followNumber}>{profile.followerCount}</Text>
                <Text style={styles.followLabel}>{TEXT.followers}</Text>
              </Pressable>
              <Pressable
                style={styles.followMetric}
                onPress={() => openConnections("following")}
              >
                <Text style={styles.followNumber}>{profile.followingCount}</Text>
                <Text style={styles.followLabel}>{TEXT.following}</Text>
              </Pressable>
            </View>
            {!profile.ownProfile ? (
              <View style={styles.profileActionRow}>
                <Pressable
                  style={[
                    styles.followButton,
                    profile.followedByMe ? styles.followingButton : null,
                  ]}
                  onPress={handleToggleFollow}
                  disabled={followUpdating}
                >
                  {followUpdating ? (
                    <ActivityIndicator
                      size="small"
                      color={profile.followedByMe ? "#f4f4f6" : "#111213"}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.followButtonText,
                        profile.followedByMe ? styles.followingButtonText : null,
                      ]}
                    >
                      {profile.followedByMe ? TEXT.unfollow : TEXT.follow}
                    </Text>
                  )}
                </Pressable>
                <Pressable style={styles.messageButton} onPress={openDirectMessage}>
                  <Ionicons name="paper-plane-outline" size={15} color="#f4f4f6" />
                  <Text style={styles.messageButtonText}>Mesaj</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>

        <ProfileSection title={TEXT.garage}>
          <View style={styles.garageGrid}>
            {garage.length > 0 ? (
              garage.map((vehicle, index) => (
                <VehicleTile key={vehicle.id} vehicle={vehicle} index={index} />
              ))
            ) : (
              <Text style={styles.emptyText}>{TEXT.noGarage}</Text>
            )}
          </View>
        </ProfileSection>

        <ProfileSection title={TEXT.posts}>
          {posts.length > 0 ? (
            posts.map((post) => (
              <ProfilePostRow
                key={post.id}
                image={
                  post.postPhoto
                    ? { uri: getSecureImageUrl(post.postPhoto) }
                    : postFallback
                }
                title={post.content}
                time={post.time}
                likes={post.likesCount.toString()}
                comments={post.commentsCount.toString()}
                onPress={() =>
                  router.push({
                    pathname: "/post-detail",
                    params: { id: String(post.id) },
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.emptyText}>{TEXT.noPost}</Text>
          )}
        </ProfileSection>

        <ProfileSection title={TEXT.routes}>
          {routes.length > 0 ? (
            routes.map((route) => (
              <ProfileRouteRow
                key={route.id}
                title={route.title}
                detail={route.detail}
                duration={route.duration}
                distance={route.distance}
                routeDate={route.routeDate}
                onPress={() =>
                  router.push({
                    pathname: "/route-map",
                    params: buildRouteMapParams(route),
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.emptyText}>{TEXT.noRoute}</Text>
          )}
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({
  onBack,
  title,
}: {
  onBack: () => void;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
    </View>
  );
}

function VehicleTile({ index, vehicle }: { index: number; vehicle: Vehicle }) {
  const imageSource = vehicle.imageUrl
    ? { uri: getSecureImageUrl(vehicle.imageUrl) }
    : vehicleFallbacks[index % vehicleFallbacks.length];

  return (
    <View style={styles.vehicleTile}>
      <Image source={imageSource} style={styles.vehicleImage} contentFit="cover" />
      <Text style={styles.vehicleLabel} numberOfLines={2}>
        {vehicle.brand} {vehicle.model} {vehicle.year}
      </Text>
    </View>
  );
}

function formatFullName(profile: UserProfile) {
  return [profile.name, profile.lastName].filter(Boolean).join(" ") || formatUsername(profile.username || profile.userName);
}

function formatUsername(username?: string | null) {
  const cleanUsername = username?.replace(/^@/, "").trim();

  return cleanUsername ? `@${cleanUsername}` : "@kullanici";
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  avatar: {
    borderColor: "#202124",
    borderWidth: 4,
  },
  content: {
    paddingBottom: 32,
  },
  coverImage: {
    height: 170,
    width: "100%",
  },
  coverWrap: {
    backgroundColor: "#111213",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: "#b9bbc2",
    fontSize: 13,
    fontWeight: "700",
  },
  followLabel: {
    color: "#b9bbc2",
    fontSize: 12,
    fontWeight: "700",
  },
  followMetric: {
    alignItems: "center",
    flexDirection: "row",
  },
  followNumber: {
    color: "#f4f4f6",
    fontSize: 13,
    fontWeight: "900",
  },
  followRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginTop: 8,
  },
  followButton: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    flexGrow: 1,
    height: 36,
    justifyContent: "center",
    minWidth: 112,
    paddingHorizontal: 14,
  },
  followButtonText: {
    color: "#111213",
    fontSize: 13,
    fontWeight: "900",
  },
  followingButton: {
    backgroundColor: "#30333a",
    borderColor: "#464a54",
    borderWidth: 1,
  },
  followingButtonText: {
    color: "#f4f4f6",
  },
  messageButton: {
    alignItems: "center",
    backgroundColor: "#30333a",
    borderColor: "#464a54",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexGrow: 1,
    gap: 6,
    height: 36,
    justifyContent: "center",
    minWidth: 96,
    paddingHorizontal: 14,
  },
  messageButtonText: {
    color: "#f4f4f6",
    fontSize: 13,
    fontWeight: "900",
  },
  profileActionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },
  garageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
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
  identity: {
    flex: 1,
    minWidth: 0,
    paddingTop: 8,
  },
  name: {
    color: "#f4f4f6",
    fontSize: 22,
    fontWeight: "900",
  },
  profileHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 14,
    marginHorizontal: 20,
    marginTop: -30,
    paddingBottom: 14,
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  username: {
    color: "#a7aab2",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
  },
  vehicleImage: {
    borderRadius: 8,
    height: 82,
    width: "100%",
  },
  vehicleLabel: {
    color: "#eeeeee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
  vehicleTile: {
    flexBasis: "48%",
    flexGrow: 1,
    minWidth: 120,
  },
});
