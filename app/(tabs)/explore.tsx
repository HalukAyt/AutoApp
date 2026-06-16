import { Ionicons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";
import { getClubs } from "@/services/clubService";
import { getFeedPosts } from "@/services/postService";
import { getExploreRoutes } from "@/services/routeService";
import { getExploreVehicles } from "@/services/vehicleService";
import type { Club, FeedPost, UserRoute, Vehicle } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { buildRouteMapParams } from "@/utils/routeMapParams";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import type { ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const carFallback = require("../../assets/images/6.jpg");
const TEXT = {
  clubs: "Kul\u00fcpler",
  exploreError: "Ke\u015ffet verileri al\u0131namad\u0131.",
  garages: "Garajlar",
  members: "\u00fcye",
  noClub: "Kul\u00fcp bulunamad\u0131.",
  noGarage: "Garaj bulunamad\u0131.",
  noPost: "G\u00f6nderi bulunamad\u0131.",
  noRoute: "Rota bulunamad\u0131.",
  photoPost: "Foto\u011fraf g\u00f6nderisi",
  posts: "G\u00f6nderiler",
  routeDetailMissing: "Rota detay\u0131 yok",
  routes: "Rotalar",
  searchPlaceholder: "Ara rotalar, ara\u00e7lar, g\u00f6nderiler, kul\u00fcpler",
  vehicles: "Ara\u00e7lar",
};

export default function Explore() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<UserRoute[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchExploreData = useCallback(async () => {
    try {
      setErrorMessage("");
      const [vehicleData, routeData, postData, clubData] = await Promise.all([
        getExploreVehicles(),
        getExploreRoutes(),
        getFeedPosts(),
        getClubs(),
      ]);

      setVehicles(vehicleData);
      setRoutes(routeData);
      setPosts(postData);
      setClubs(clubData);
      console.log("Explore data fetched:", {
        vehicles: vehicleData,
        routes: routeData,
        posts: postData,
        clubs: clubData,
      });
    } catch (error) {
      console.error("Explore fetch error:", error);
      setErrorMessage(TEXT.exploreError);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchExploreData();
    }, [fetchExploreData]),
  );

  const normalizedSearch = search.trim().toLocaleLowerCase("tr-TR");

  const visibleVehicles = useMemo(
    () =>
      vehicles
        .filter((vehicle) =>
          matchesSearch(
            normalizedSearch,
            vehicle.brand,
            vehicle.model,
            vehicle.licensePlate,
            String(vehicle.year),
          ),
        )
        .slice(0, 4),
    [normalizedSearch, vehicles],
  );

  const visibleRoutes = useMemo(
    () =>
      routes
        .filter((route) =>
          matchesSearch(
            normalizedSearch,
            route.title,
            route.detail,
            `${route.distance}`,
            `${route.duration}`,
          ),
        )
        .slice(0, 4),
    [normalizedSearch, routes],
  );

  const visiblePosts = useMemo(
    () =>
      posts
        .filter((post) =>
          matchesSearch(normalizedSearch, post.content, post.authorName),
        )
        .slice(0, 4),
    [normalizedSearch, posts],
  );

  const visibleClubs = useMemo(
    () =>
      clubs
        .filter((club) =>
          matchesSearch(
            normalizedSearch,
            club.name,
            club.description,
            club.managerName,
          ),
        )
        .slice(0, 4),
    [clubs, normalizedSearch],
  );

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>AutoTrack</Text>

        <TextInput
          placeholder={TEXT.searchPlaceholder}
          placeholderTextColor="#d8d8dc"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.filterRow}>
          <Text style={styles.filter}>{`${TEXT.vehicles} ${vehicles.length}`}</Text>
          <Text style={styles.filter}>{`${TEXT.routes} ${routes.length}`}</Text>
          <Text style={styles.filter}>{`${TEXT.posts} ${posts.length}`}</Text>
          <Text style={styles.filter}>{`${TEXT.clubs} ${clubs.length}`}</Text>
        </View>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <ExploreSection title={TEXT.garages}>
          {visibleVehicles.length > 0 ? (
            <View style={styles.grid}>
              {visibleVehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </View>
          ) : (
            <EmptyText text={TEXT.noGarage} />
          )}
        </ExploreSection>

        <ExploreSection title={TEXT.routes}>
          {visibleRoutes.length > 0 ? (
            <View style={styles.grid}>
              {visibleRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onPress={() =>
                    router.push({
                      pathname: "/route-map",
                      params: buildRouteMapParams(route),
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyText text={TEXT.noRoute} />
          )}
        </ExploreSection>

        <ExploreSection title={TEXT.posts}>
          {visiblePosts.length > 0 ? (
            <View style={styles.grid}>
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onPress={() =>
                    router.push({
                      pathname: "/post-detail",
                      params: { id: String(post.id) },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyText text={TEXT.noPost} />
          )}
        </ExploreSection>

        <ExploreSection title={TEXT.clubs}>
          {visibleClubs.length > 0 ? (
            <View style={styles.grid}>
              {visibleClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  onPress={() =>
                    router.push({
                      pathname: "/club-detail",
                      params: { id: String(club.id) },
                    })
                  }
                />
              ))}
            </View>
          ) : (
            <EmptyText text={TEXT.noClub} />
          )}
        </ExploreSection>
      </ScrollView>
    </SafeAreaView>
  );
}

function matchesSearch(
  search: string,
  ...values: (number | string | null | undefined)[]
) {
  if (!search) return true;

  return values.some((value) =>
    String(value ?? "")
      .toLocaleLowerCase("tr-TR")
      .includes(search),
  );
}

function ExploreSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const imageSource = vehicle.imageUrl
    ? { uri: getSecureImageUrl(vehicle.imageUrl) }
    : carFallback;

  return (
    <View style={styles.vehicleCard}>
      <Image
        source={imageSource}
        style={styles.vehicleImage}
        contentFit="cover"
      />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {vehicle.brand} {vehicle.model}
        </Text>
        <Text style={styles.cardMeta}>
          {vehicle.year}
          {vehicle.licensePlate ? `  ${vehicle.licensePlate}` : ""}
        </Text>
      </View>
    </View>
  );
}

function RouteCard({
  route,
  onPress,
}: {
  route: UserRoute;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.routeCard} onPress={onPress}>
      <Text style={styles.routeBadge}>Rota</Text>
      <Text style={styles.cardTitle} numberOfLines={2}>
        {route.title}
      </Text>
      <Text style={styles.routeDetail} numberOfLines={2}>
        {route.detail || TEXT.routeDetailMissing}
      </Text>
      <View style={styles.metricRow}>
        <Text style={styles.metric}>{`${route.distance} km`}</Text>
        <Text style={styles.metric}>{`${route.duration} saat`}</Text>
      </View>
    </Pressable>
  );
}

function PostCard({ onPress, post }: { onPress: () => void; post: FeedPost }) {
  const imageSource = post.postPhoto
    ? { uri: getSecureImageUrl(post.postPhoto) }
    : null;

  return (
    <Pressable style={styles.postCard} onPress={onPress}>
      <Text style={styles.user} numberOfLines={1}>
        @{post.authorUsername || post.authorName}
      </Text>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.postImage}
          contentFit="cover"
        />
      ) : (
        <View style={styles.textPostBody}>
          <Text style={styles.textPostContent} numberOfLines={5}>
            {post.content || TEXT.photoPost}
          </Text>
        </View>
      )}
      {post.content ? (
        <Text style={styles.postCaption} numberOfLines={2}>
          {post.content}
        </Text>
      ) : null}
    </Pressable>
  );
}

function ClubCard({ club, onPress }: { club: Club; onPress: () => void }) {
  const imageUrl = club.imageUrl ? getSecureImageUrl(club.imageUrl) : undefined;

  return (
    <Pressable style={styles.clubCard} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.clubImage} contentFit="cover" />
      ) : (
        <View style={styles.clubImagePlaceholder}>
          <Ionicons name="people-outline" size={28} color="#c47a2d" />
        </View>
      )}
      <Text style={styles.clubTitle} numberOfLines={1}>
        {club.name}
      </Text>
      <Text style={styles.clubText} numberOfLines={2}>
        {club.description || `${club.memberCount} ${TEXT.members}`}
      </Text>
      <Text style={styles.clubMeta}>
        {club.memberCount} {TEXT.members} - {club.managerName || "-"}
      </Text>
    </Pressable>
  );
}

function EmptyText({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

const styles = StyleSheet.create({
  cardBody: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  cardMeta: {
    color: "#c7c7cc",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  cardTitle: {
    color: "#f4f4f6",
    fontSize: 15,
    fontWeight: "800",
  },
  clubCard: {
    backgroundColor: "#2f313a",
    borderRadius: 8,
    flexBasis: "47%",
    overflow: "hidden",
    paddingBottom: 12,
  },
  clubImage: {
    height: 78,
    width: "100%",
  },
  clubImagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#24272e",
    height: 78,
    justifyContent: "center",
    width: "100%",
  },
  clubMeta: {
    color: "#aeb1ba",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  clubText: {
    color: "#d1d1d5",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  clubTitle: {
    color: "#f1f1f2",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  emptyText: {
    color: "#a9a9ae",
    fontSize: 13,
    paddingVertical: 8,
  },
  errorText: {
    color: "#ffb4a2",
    fontSize: 13,
    marginBottom: 6,
  },
  filter: {
    backgroundColor: "#55565a",
    borderRadius: 8,
    color: "#f4f4f4",
    fontSize: 12,
    fontWeight: "800",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 6,
    marginTop: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  logo: {
    color: "#c47a2d",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
  },
  metric: {
    color: "#f4f4f6",
    fontSize: 12,
    fontWeight: "800",
  },
  metricRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  postCaption: {
    color: "#d8d8dc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 7,
  },
  postCard: {
    flexBasis: "47%",
  },
  postImage: {
    borderRadius: 8,
    height: 118,
    width: "100%",
  },
  routeBadge: {
    color: "#c47a2d",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  routeCard: {
    backgroundColor: "#2f313a",
    borderRadius: 8,
    flexBasis: "47%",
    minHeight: 138,
    padding: 12,
  },
  routeDetail: {
    color: "#c7c7cc",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  search: {
    backgroundColor: "#55565a",
    borderRadius: 18,
    color: "#fff",
    height: 40,
    paddingHorizontal: 14,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    color: "#f4f4f6",
    fontSize: 23,
    fontWeight: "800",
    marginBottom: 10,
  },
  textPostBody: {
    backgroundColor: "#2f313a",
    borderRadius: 8,
    minHeight: 118,
    padding: 12,
  },
  textPostContent: {
    color: "#f4f4f6",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  user: {
    color: "#f0f0f2",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  vehicleCard: {
    backgroundColor: "#2f313a",
    borderRadius: 8,
    flexBasis: "47%",
    overflow: "hidden",
  },
  vehicleImage: {
    height: 104,
    width: "100%",
  },
});
