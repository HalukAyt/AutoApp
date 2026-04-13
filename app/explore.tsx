import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from "react-native";
  
  const carImage = require("../assets/images/6.jpg");
  const routeOne = require("../assets/images/9.png");
  const routeTwo = require("../assets/images/10.png");
  const postOne = require("../assets/images/5.jpg");
  const postTwo = require("../assets/images/6.jpg");
  const clubOne = require("../assets/images/33.jpg");
  const clubTwo = require("../assets/images/21.jpg");
  
  export default function Explore() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            placeholder="Ara rotalar, araçlar, yerler"
            placeholderTextColor="#d8d8dc"
            style={styles.search}
          />
  
          <View style={styles.filterRow}>
            <Text style={styles.filter}>Popüler</Text>
            <Text style={styles.filter}>Yakınımda</Text>
            <Text style={styles.filter}>Güncel</Text>
          </View>
  
          <View style={styles.heroCard}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Garajlar</Text>
              <Text style={styles.heroSubtitle}>Uygulamadaki tüm garajlara ulaşın</Text>
            </View>
            <Image source={carImage} style={styles.heroImage} />
            <Text style={styles.arrow}>›</Text>
          </View>
  
          <Text style={styles.sectionTitle}>Rotalar</Text>
          <View style={styles.twoColumn}>
            <Image source={routeOne} style={styles.routeImage} />
            <Image source={routeTwo} style={styles.routeImage} />
          </View>
  
          <Text style={styles.sectionTitle}>Gönderiler</Text>
          <View style={styles.twoColumn}>
            <PostCard image={postOne} user="jamesgreen" />
            <PostCard image={postTwo} user="noahhesler" />
          </View>
  
          <Text style={styles.sectionTitle}>Kulüpler</Text>
          <View style={styles.twoColumn}>
            <ClubCard image={clubOne} title="BMW Addicts" />
            <ClubCard image={clubTwo} title="Vintage Collectors" />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  function PostCard({ image, user }: { image: number; user: string }) {
    return (
      <View style={styles.postCard}>
        <Text style={styles.user}>● {user}</Text>
        <Image source={image} style={styles.postImage} />
      </View>
    );
  }
  
  function ClubCard({ image, title }: { image: number; title: string }) {
    return (
      <View style={styles.clubCard}>
        <Image source={image} style={styles.clubImage} />
        <Text style={styles.clubTitle}>{title}</Text>
        <Text style={styles.clubText}>Tüm BMW seven sürücüleri bir araya getiren topluluk.</Text>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#202124" },
    content: { padding: 24, paddingBottom: 32 },
    search: {
      backgroundColor: "#55565a",
      borderRadius: 18,
      color: "#fff",
      height: 38,
      paddingHorizontal: 14,
    },
    filterRow: { flexDirection: "row", gap: 14, marginTop: 12, marginBottom: 18 },
    filter: {
      backgroundColor: "#55565a",
      borderRadius: 8,
      color: "#f4f4f4",
      fontSize: 13,
      fontWeight: "800",
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    heroCard: {
      backgroundColor: "#37383f",
      borderRadius: 8,
      flexDirection: "row",
      minHeight: 128,
      overflow: "hidden",
      padding: 16,
    },
    heroText: { flex: 1, justifyContent: "center" },
    heroTitle: { color: "#f4f4f6", fontSize: 28, fontWeight: "800" },
    heroSubtitle: { color: "#d8d8dc", fontSize: 15, marginTop: 10 },
    heroImage: { height: 76, width: 130, alignSelf: "center", borderRadius: 8 },
    arrow: { color: "#151619", fontSize: 42, alignSelf: "flex-end" },
    sectionTitle: {
      color: "#f4f4f6",
      fontSize: 24,
      fontWeight: "800",
      marginTop: 18,
      marginBottom: 10,
    },
    twoColumn: { flexDirection: "row", gap: 18 },
    routeImage: { flex: 1, height: 92, borderRadius: 8 },
    postCard: { flex: 1 },
    user: { color: "#f0f0f2", fontSize: 13, fontWeight: "800", marginBottom: -16, zIndex: 1, paddingLeft: 8 },
    postImage: { height: 102, borderRadius: 8 },
    clubCard: { backgroundColor: "#2f313a", borderRadius: 8, flex: 1, overflow: "hidden", paddingBottom: 12 },
    clubImage: { height: 78, width: "100%" },
    clubTitle: { color: "#f1f1f2", fontSize: 19, fontWeight: "800", paddingHorizontal: 10, marginTop: 8 },
    clubText: { color: "#d1d1d5", fontSize: 12, lineHeight: 18, paddingHorizontal: 10, marginTop: 8 },
  });
  