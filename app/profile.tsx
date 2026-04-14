import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import type { ImageSourcePropType } from "react-native";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator
} from "react-native";
import api from "../api"; 

const coverImage = require("../assets/images/21.jpg");
const avatarImage = require("../assets/images/3.jpg");
const garageOne = require("../assets/images/5.jpg");
const garageTwo = require("../assets/images/6.jpg");
const postImage = require("../assets/images/33.jpg");
const routeMapOne = require("../assets/images/9.png");
const routeMapTwo = require("../assets/images/10.png");

interface Vehicle {
  id: number;
  brand: string;
  model: string;
  year: number;
}

interface Post {
  id: number;
  content: string;
  likesCount: number;
  commentsCount: number;
  time: string;
}

interface UserProfile {
  name: string;
  username: string;
  followerCount: number; 
  followingCount: number;
  garage: Vehicle[];
  posts: Post[];
}

export default function Profile() {
  const router = useRouter();

  // profil verilerini tutacağımız stateler
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        
        // Token'ı başlığa (Header) ekleyerek GET isteği atıyoruz
        const response = await api().get("/profile/me", {
          headers: {
            Authorization: `Bearer ${token}` // Spring Security bu bileti bekler
          }
        });
        
        setProfile(response.data); // Gelen veriyi state'e kaydet
      } catch (error) {
        console.log("Profil çekme hatası:", error);
        Alert.alert("Hata", "Profil bilgileri alınamadı.");
      } finally {
        setLoading(false); // Yükleme bitti
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#17181a" }}>
        <ActivityIndicator size="large" color="#a8732b" />
      </View>
    );
  }

  // Eğer profil boş geldiyse (hata olduysa)
  if (!profile) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#17181a" }}>
        <Text style={{ color: "white" }}>Veri bulunamadı.</Text>
      </View>
    );
  }

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
              {/* DİNAMİK VERİ: İSİM */}
              <Text style={styles.name}>{profile.name}</Text>
              <Pressable
                style={styles.editButton}
                onPress={() => router.push("/edit-profile")}
              >
                <Text style={styles.editText}>Profili Düzenle</Text>
              </Pressable>
            </View>

            {/* DİNAMİK VERİ: KULLANICI ADI */}
            <Text style={styles.username}>{profile.username}</Text>

            <View style={styles.followRow}>
              {/* DİNAMİK VERİ: TAKİPÇİ VE TAKİP EDİLEN */}
              <Text style={styles.followNumber}>{profile.followerCount}</Text>
              <Text style={styles.followLabel}> Takipçi</Text>
              <Text style={styles.followNumber}> {profile.followingCount}</Text>
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
            {/* EĞER GARAJ BOŞSA BİLGİ VERELİM, DEĞİLSE ARAÇLARI LİSTELEYELİM */}
            {profile.garage && profile.garage.length > 0 ? (
              profile.garage.map((vehicle, index) => (
                <View style={styles.garageItem} key={vehicle.id}>
                  {/* Resimleri şimdilik sırayla sabit veriyoruz */}
                  <Image source={index % 2 === 0 ? garageOne : garageTwo} style={styles.garageImage} />
                  <Text style={styles.imageLabel}>{vehicle.brand} {vehicle.model}</Text>
                </View>
              ))
            ) : (
              <Text style={{color: '#a9a9ae', marginLeft: 10}}>Garajınızda henüz araç yok.</Text>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Gönderiler</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* DİNAMİK VERİ: GÖNDERİLER */}
          {profile.posts && profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <PostRow
                key={post.id}
                image={postImage} // Sabit resim
                title={post.content} // Backend'den gelen içerik
                time={post.time}
                likes={post.likesCount.toString()}
                comments={post.commentsCount.toString()}
              />
            ))
          ) : (
            <Text style={{color: '#a9a9ae', marginLeft: 10, marginBottom: 10}}>Henüz bir gönderi paylaşmadınız.</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Rotalar</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          {/* Rotaları şimdilik tasarım bozulmasın diye sabit bırakıyorum */}
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
        <Pressable
          style={styles.featureCard}
          onPress={() =>
            AsyncStorage.removeItem("token").then(() => router.push("/"))
          }
        >
          <Text style={styles.featureTitle}>Çıkış Yap</Text>
        </Pressable>
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
  featureCard: {
    backgroundColor: "#ff0000",
    borderRadius: 8,
    marginHorizontal: 150,
    marginVertical: 12,
    padding: 14,
  },
  featureTitle: {
    color: "#f2f2f2",
    fontSize: 14,
    fontWeight: "800",
    alignSelf: "center",
  },
});