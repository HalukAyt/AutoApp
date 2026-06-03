import { getActiveVehicle } from "@/services/vehicleService";
import type { Vehicle } from "@/types/domain";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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

const formatTryAmount = (amount?: number | null) => {
  const numericAmount = Number(amount ?? 0);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return `\u20ba${safeAmount.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDisplayDate = (date?: string | null) => {
  if (!date) return "-";

  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
};

export default function Home() {
  const router = useRouter();
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchCarData = async () => {
        try {
          const vehicle = await getActiveVehicle();
          console.log("Active Vehicle Data:", vehicle);
          setActiveVehicle(vehicle);
        } catch (error) {
          console.log("Active Vehicle Data error:", error);
        }
      };

      fetchCarData();
    }, []),
  );

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
            <Text style={styles.iconText}>{"\u25cb"}</Text>
          </Pressable>

          <Text style={styles.logo}>AutoTrack</Text>

          <Pressable style={styles.iconButton}>
            <Text style={styles.bellText}>{"\u2302"}</Text>
          </Pressable>
        </View>

        <TextInput
          placeholder={"Kullan\u0131c\u0131 Ara ..."}
          placeholderTextColor="#eee2cf"
          style={styles.searchInput}
        />

        <View style={styles.featureRow}>
          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/explore")}
          >
            <Text style={styles.featureTitle}>{"Ke\u015ffet"}</Text>
            <Text style={styles.featureText}>
              {"Ara\u00e7 tutkunlar\u0131n\u0131 ke\u015ffet"}
            </Text>
            <Image source={carImage} style={styles.featureImage} />
          </Pressable>
          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/feed")}
          >
            <Text style={styles.featureTitle}>{"G\u00f6nderiler"}</Text>
            <Text style={styles.featureText}>
              {"Dostlar\u0131n\u0131z\u0131n g\u00f6nderilerini ke\u015ffet"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.featureCard}
            onPress={() => router.push("/clubs")}
          >
            <Text style={styles.featureTitle}>{"Kul\u00fcpler"}</Text>
            <Text style={styles.featureText}>
              {"Ara\u00e7 tutkunlar\u0131 ile sohbet et, deneyimlerini payla\u015f"}
            </Text>
          </Pressable>
        </View>

        <Pressable style={styles.activityCard}>
          <View style={styles.activityTextBox}>
            <Text style={styles.sectionTitle}>Etkinlikler</Text>
            <Text style={styles.bodyText}>{"Bulu\u015fmalara kat\u0131l,"}</Text>
            <Text style={styles.bodyText}>{"yeni dostluklar kur"}</Text>
          </View>
          <Image source={eventImage} style={styles.activityImage} />
        </Pressable>

        <Pressable
          style={styles.vehicleCard}
          onPress={() => {
            if (activeVehicle) router.push("/vehicle-detail");
          }}
        >
          <View style={styles.vehicleImageFrame}>
            {activeVehicle?.imageUrl ? (
              <Image
                source={{ uri: activeVehicle.imageUrl }}
                style={styles.activityVehicleImage}
              />
            ) : (
              <Text style={styles.vehicleImagePlaceholder}>AT</Text>
            )}
          </View>
          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleHeaderRow}>
              <View style={styles.vehicleTitleBlock}>
                <Text style={styles.vehicleEyebrow}>{"Aktif Ara\u00e7"}</Text>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {activeVehicle
                    ? `${activeVehicle.brand} ${activeVehicle.model}`
                    : "-"}
                </Text>
              </View>
              <Text style={styles.vehicleEditText}>{"D\u00fczenle"}</Text>
            </View>
            <View style={styles.vehicleStatsRow}>
              <View style={styles.vehicleStat}>
                <Text style={styles.vehicleStatLabel}>{"Bu Ay"}</Text>
                <Text style={styles.vehicleStatValue}>
                  {formatTryAmount(activeVehicle?.monthlyExpenseTotal)}
                </Text>
              </View>
              <View style={styles.vehicleDivider} />
              <View style={styles.vehicleStat}>
                <Text style={styles.vehicleStatLabel}>{"Muayene"}</Text>
                <Text style={styles.vehicleStatValue}>
                  {formatDisplayDate(activeVehicle?.inspectionAppointmentDate)}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>

        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>{"Hat\u0131rlatma"}</Text>
          <Text style={styles.reminderText}>{"\u2022 Bak\u0131ma 3 g\u00fcn kald\u0131 !"}</Text>
          <Text style={styles.reminderText}>
            {"\u2022 Track Day etkinli\u011fine 1 hafta kald\u0131."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    alignItems: "stretch",
    backgroundColor: "#2f313a",
    flexDirection: "row",
    height: 100,
    marginHorizontal: 24,
    marginTop: 20,
  },
  activityImage: {
    borderRadius: 8,
    height: 100,
    width: 100,
  },
  activityTextBox: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 10,
    paddingVertical: 8,
  },
  activityVehicleImage: {
    height: "100%",
    width: "100%",
  },
  bellText: {
    color: "#202124",
    fontSize: 22,
    fontWeight: "800",
  },
  bodyText: {
    color: "#cfd0d3",
    fontSize: 15,
    lineHeight: 22,
  },
  featureCard: {
    backgroundColor: "#282a33",
    borderRadius: 8,
    borderTopLeftRadius: 54,
    borderTopRightRadius: 54,
    flex: 1,
    height: 150,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  featureImage: {
    alignSelf: "center",
    borderRadius: 8,
    height: 50,
    marginTop: 18,
    width: 100,
  },
  featureRow: {
    backgroundColor: "#a8732b",
    flexDirection: "row",
    gap: 20,
    paddingBottom: 44,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  featureText: {
    color: "#e3e3e5",
    fontSize: 12,
    lineHeight: 21,
  },
  featureTitle: {
    color: "#c47a2d",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  header: {
    alignItems: "center",
    backgroundColor: "#a8732b",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingHorizontal: 28,
    paddingTop: 20,
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
  logo: {
    color: "#f1f1f1",
    fontSize: 28,
    fontWeight: "800",
  },
  reminderCard: {
    backgroundColor: "#111213",
    marginHorizontal: 24,
    marginTop: 12,
    minHeight: 116,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  reminderText: {
    color: "#cfd0d3",
    fontSize: 15,
    lineHeight: 23,
  },
  reminderTitle: {
    color: "#c47a2d",
    fontSize: 24,
    fontWeight: "500",
    marginBottom: 10,
    textAlign: "center",
  },
  safeArea: {
    backgroundColor: "#000000",
    flex: 1,
  },
  scrollContent: {
    backgroundColor: "#191a1c",
    paddingBottom: 28,
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
  sectionTitle: {
    color: "#c47a2d",
    fontSize: 24,
    fontWeight: "500",
  },
  vehicleCard: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#24262c",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 126,
    marginHorizontal: 24,
    marginTop: 20,
    padding: 14,
  },
  vehicleDivider: {
    backgroundColor: "#34363d",
    height: 34,
    width: 1,
  },
  vehicleEditText: {
    color: "#c47a2d",
    fontSize: 12,
    fontWeight: "800",
    paddingLeft: 8,
  },
  vehicleEyebrow: {
    color: "#c47a2d",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  vehicleHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vehicleImageFrame: {
    alignItems: "center",
    backgroundColor: "#24262c",
    borderRadius: 10,
    height: 88,
    justifyContent: "center",
    overflow: "hidden",
    width: 88,
  },
  vehicleImagePlaceholder: {
    color: "#c47a2d",
    fontSize: 18,
    fontWeight: "800",
  },
  vehicleInfo: {
    flex: 1,
    gap: 14,
  },
  vehicleName: {
    color: "#f0f0f1",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  vehicleStat: {
    flex: 1,
    gap: 3,
  },
  vehicleStatLabel: {
    color: "#8f929b",
    fontSize: 12,
    fontWeight: "800",
  },
  vehicleStatValue: {
    color: "#d7d8dc",
    fontSize: 14,
    fontWeight: "700",
  },
  vehicleStatsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  vehicleTitleBlock: {
    flex: 1,
  },
});
