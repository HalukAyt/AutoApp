import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const carImage = require("../assets/images/5.jpg");
const eventImage = require("../assets/images/33.jpg");

export default function Home() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.push("/profile")}
          >
            <Text style={styles.iconText}>○</Text>
          </Pressable>

          <Text style={styles.logo}>AutoTrack</Text>

          <Pressable style={styles.iconButton}>
            <Text style={styles.bellText}>⌂</Text>
          </Pressable>
        </View>

        <TextInput
          placeholder="Kullanıcı Ara ..."
          placeholderTextColor="#eee2cf"
          style={styles.searchInput}
        />

        <View style={styles.featureRow}>
          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.featureTitle}>Keşfet</Text>
            <Text style={styles.featureText}>Araç tutkunlarını keşfet</Text>
            <Image source={carImage} style={styles.featureImage} />
          </Pressable>

          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/clubs")}
          >
            <Text style={styles.featureTitle}>Kulüpler</Text>
            <Text style={styles.featureText}>
              Araç tutkunları ile sohbet et, deneyimlerini paylaş
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.activityCard}>
          <View style={styles.activityTextBox}>
            <Text style={styles.sectionTitle}>Etkinlikler</Text>
            <Text style={styles.bodyText}>Buluşmalara katıl,</Text>
            <Text style={styles.bodyText}>yeni dostluklar kur</Text>
          </View>
          <Image source={eventImage} style={styles.activityImage} />
        </Pressable>

        <Pressable
          style={styles.vehicleCard}
          onPress={() => router.push("/vehicle-detail")}
        >
          <View style={styles.vehicleIconBox}>
            <Text style={styles.vehicleIcon}>▰</Text>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.bodyText}>Aktif Araç: Audi A3</Text>
            <Text style={styles.bodyText}>Bu Ay Harcama: ₺3.250</Text>
            <Text style={styles.bodyText}>Muayene Randevu Tarihi:</Text>
            <Text style={styles.bodyText}>24/03/2028</Text>
          </View>
        </Pressable>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>Hatırlatma</Text>
          <Text style={styles.reminderText}>• Bakıma 3 gün kaldı !</Text>
          <Text style={styles.reminderText}>
            • Track Day etkinliğine 1 hafta kaldı.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    backgroundColor: "#191a1c",
    paddingBottom: 28,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#a8732b",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 14,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#f4f4f4",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  iconText: {
    color: "#202124",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 30,
  },
  bellText: {
    color: "#202124",
    fontSize: 22,
    fontWeight: "800",
  },
  logo: {
    color: "#f1f1f1",
    fontSize: 28,
    fontWeight: "800",
  },
  searchInput: {
    backgroundColor: "#b18752",
    borderRadius: 18,
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "700",
    height: 36,
    marginHorizontal: 28,
    marginTop: -2,
    paddingHorizontal: 16,
  },
  featureRow: {
    backgroundColor: "#a8732b",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 44,
  },
  featureCard: {
    backgroundColor: "#282a33",
    borderRadius: 8,
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    flex: 1,
    minHeight: 160,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  featureTitle: {
    color: "#c47a2d",
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 4,
  },
  featureText: {
    color: "#e3e3e5",
    fontSize: 15,
    lineHeight: 21,
  },
  featureImage: {
    alignSelf: "center",
    borderRadius: 8,
    height: 50,
    marginTop: 18,
    width: 128,
  },
  activityCard: {
    alignItems: "stretch",
    backgroundColor: "#2f313a",
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 20,
    minHeight: 78,
  },
  activityTextBox: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
    paddingVertical: 8,
  },
  sectionTitle: {
    color: "#c47a2d",
    fontSize: 24,
    fontWeight: "500",
  },
  bodyText: {
    color: "#cfd0d3",
    fontSize: 15,
    lineHeight: 22,
  },
  activityImage: {
    width: 126,
  },
  vehicleCard: {
    alignItems: "center",
    backgroundColor: "#111213",
    flexDirection: "row",
    marginHorizontal: 24,
    marginTop: 20,
    minHeight: 108,
    paddingHorizontal: 12,
  },
  vehicleIconBox: {
    alignItems: "center",
    justifyContent: "center",
    width: 58,
  },
  vehicleIcon: {
    color: "#f7f7f7",
    fontSize: 38,
    fontWeight: "800",
  },
  vehicleInfo: {
    flex: 1,
    paddingLeft: 10,
  },
  reminderCard: {
    backgroundColor: "#111213",
    marginHorizontal: 24,
    marginTop: 12,
    minHeight: 116,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  reminderTitle: {
    color: "#c47a2d",
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  reminderText: {
    color: "#cfd0d3",
    fontSize: 15,
    lineHeight: 23,
  },
});
