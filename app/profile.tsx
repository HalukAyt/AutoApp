import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ImageSourcePropType } from "react-native";

const coverImage = require("../assets/images/21.jpg");
const avatarImage = require("../assets/images/3.jpg");
const garageOne = require("../assets/images/5.jpg");
const garageTwo = require("../assets/images/6.jpg");
const postImage = require("../assets/images/33.jpg");
const routeMapOne = require("../assets/images/9.png");
const routeMapTwo = require("../assets/images/10.png");

export default function Profile() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          <Image source={coverImage} style={styles.coverImage} />
          <Pressable style={styles.settingsButton}>
            <Text style={styles.settingsText}>⚙</Text>
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Image source={avatarImage} style={styles.avatarImage} />
          </View>

          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>John Doe</Text>
              <Pressable
                style={styles.editButton}
                onPress={() => router.push("/edit-profile")}
              >
                <Text style={styles.editText}>Profili Düzenle</Text>
              </Pressable>
            </View>

            <Text style={styles.username}>@johndoe</Text>

            <View style={styles.followRow}>
              <Text style={styles.followNumber}>1</Text>
              <Text style={styles.followLabel}> Takipçi</Text>
              <Text style={styles.followNumber}>   1</Text>
              <Text style={styles.followLabel}> Takip Edilen</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Garajım</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.garageRow}>
            <View style={styles.garageItem}>
              <Image source={garageOne} style={styles.garageImage} />
              <Text style={styles.imageLabel}>BMW X1</Text>
            </View>

            <View style={styles.garageItem}>
              <Image source={garageTwo} style={styles.garageImage} />
              <Text style={styles.imageLabel}>BMW X1</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Gönderiler</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          <PostRow
            image={postImage}
            title="Fethiye Sürüşü'nden"
            time="2 saat önce"
            likes="29"
            comments="12"
          />
          <PostRow
            image={garageOne}
            title="Gün batımı sürüşü"
            time="3 gün önce"
            likes="48"
            comments="4"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Rotalar</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          <RouteRow
            title="İstanbul'dan Bodrum'a Sürüş"
            detail="702 km   8 saat sürüş"
            image={routeMapOne}
          />
          <RouteRow
            title="Ayazağa'dan SAW'A Sürüş"
            detail="36 km   30 dakika sürüş"
            image={routeMapTwo}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PostRow({
  image,
  title,
  time,
  likes,
  comments,
}: {
  image: ImageSourcePropType;
  title: string;
  time: string;
  likes: string;
  comments: string;
}) {
  return (
    <View style={styles.postRow}>
      <Image source={image} style={styles.postImage} />
      <View style={styles.postTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{time}</Text>
      </View>
      <Text style={styles.metricText}>{likes} ♡</Text>
      <Text style={styles.metricText}>{comments} ▱</Text>
    </View>
  );
}

function RouteRow({
  title,
  detail,
  image,
}: {
  title: string;
  detail: string;
  image: ImageSourcePropType;
}) {
  return (
    <View style={styles.routeRow}>
      <Image source={image} style={styles.routeImage} />
      <View style={styles.routeTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#17181a",
  },
  scrollContent: {
    backgroundColor: "#17181a",
    paddingBottom: 18,
  },
  coverWrap: {
    height: 170,
  },
  coverImage: {
    height: "100%",
    width: "100%",
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 10,
    width: 34,
  },
  settingsText: {
    color: "#202124",
    fontSize: 25,
    fontWeight: "800",
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: -44,
    paddingHorizontal: 30,
    paddingBottom: 14,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderColor: "#111213",
    borderRadius: 8,
    borderWidth: 2,
    height: 84,
    justifyContent: "center",
    overflow: "hidden",
    width: 84,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  identity: {
    flex: 1,
    marginLeft: 10,
    marginTop: 28,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  name: {
    color: "#f0f0f1",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 10,
  },
  editButton: {
    backgroundColor: "#56565c",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editText: {
    color: "#f5f5f5",
    fontSize: 11,
    fontWeight: "800",
  },
  username: {
    color: "#a9a9ae",
    fontSize: 12,
    marginBottom: 2,
  },
  followRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  followNumber: {
    color: "#f3f3f3",
    fontSize: 19,
    fontWeight: "800",
  },
  followLabel: {
    color: "#d5d5d8",
    fontSize: 17,
  },
  card: {
    backgroundColor: "#34353c",
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#f2f2f2",
    fontSize: 17,
    fontWeight: "800",
  },
  chevron: {
    color: "#17181a",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 30,
  },
  garageRow: {
    flexDirection: "row",
    gap: 12,
  },
  garageItem: {
    flex: 1,
  },
  garageImage: {
    borderRadius: 8,
    height: 78,
    width: "100%",
  },
  imageLabel: {
    color: "#eeeeee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: -18,
    paddingLeft: 10,
  },
  postRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 14,
  },
  postImage: {
    borderRadius: 8,
    height: 44,
    width: 72,
  },
  postTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  rowTitle: {
    color: "#f0f0f1",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
  rowDetail: {
    color: "#c3c3c8",
    fontSize: 12,
    fontWeight: "700",
  },
  metricText: {
    color: "#d1d1d5",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 12,
  },
  routeRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  routeImage: {
    borderRadius: 8,
    height: 50,
    width: 76,
  },
  routeTextBox: {
    flex: 1,
    marginLeft: 12,
  },
});
