import { FormField } from "@/components/forms/FormField";
import { getProfile, updateProfile } from "@/services/profileService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile({
        name,
        lastName,
        phoneNumber,
      });

      Alert.alert("Ba\u015far\u0131l\u0131", "Profil g\u00fcncellendi.");
    } catch (error) {
      console.error(error);
      Alert.alert("Hata", "Profil g\u00fcncellenirken bir sorun olu\u015ftu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getProfile();
        setName(data.name || "");
        setLastName(data.lastName || "");
        setEmail(data.email || "");
        setPhoneNumber(data.phoneNumber || "");
      } catch {
        Alert.alert("Hata", "Profil bilgileri al\u0131namad\u0131.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>{"Profil D\u00fczenle"}</Text>
        <Text style={styles.sectionTitle}>{"Ki\u015fisel Bilgiler"}</Text>

        <FormField label="Ad" value={name} onChangeText={setName} />
        <FormField label="Soyad" value={lastName} onChangeText={setLastName} />
        <FormField label="E-posta" value={email} onChangeText={setEmail} />
        <FormField
          label="Telefon"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />

        <Pressable
          style={styles.wideButton}
          onPress={() => router.push("/add-vehicle")}
        >
          <Text style={styles.buttonText}>{"Ara\u00e7 Ekle"}</Text>
        </Pressable>

        <Pressable
          style={styles.saveButton}
          onPress={handleUpdate}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Bekleyin..." : "Kaydet"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  buttonText: {
    color: "#f7f7f7",
    fontSize: 16,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    paddingHorizontal: 34,
    paddingTop: 54,
  },
  safeArea: {
    backgroundColor: "#242528",
    flex: 1,
  },
  saveButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#c77d2b",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginTop: 84,
    width: 178,
  },
  sectionTitle: {
    color: "#f3f3f4",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 16,
  },
  title: {
    color: "#f3f3f4",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 30,
  },
  wideButton: {
    alignItems: "center",
    backgroundColor: "#c77d2b",
    borderRadius: 8,
    height: 48,
    justifyContent: "center",
    marginTop: 18,
  },
});