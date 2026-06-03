import { DatePickerField } from "@/components/forms/DatePickerField";
import { getActiveVehicle, updateVehicle } from "@/services/vehicleService";
import type { Vehicle } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function VehicleDetail() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [inspectionAppointmentDate, setInspectionAppointmentDate] =
    useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const activeVehicle = await getActiveVehicle();
        setVehicle(activeVehicle);
        setBrand(activeVehicle.brand);
        setModel(activeVehicle.model);
        setYear(activeVehicle.year.toString());
        setLicensePlate(activeVehicle.licensePlate ?? "");
        setInspectionAppointmentDate(
          activeVehicle.inspectionAppointmentDate ?? "",
        );
      } catch (error) {
        console.log("Vehicle detail fetch error:", error);
        Alert.alert("Hata", "Aktif ara\u00e7 bilgileri al\u0131namad\u0131.");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, []);

  const pickVehicleImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert("Hata", "Foto\u011fraf galerisine eri\u015fim izni gerekiyor.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!vehicle) return;

    const parsedYear = parseInt(year, 10);
    if (!brand.trim() || !model.trim() || Number.isNaN(parsedYear)) {
      Alert.alert(
        "Uyar\u0131",
        "L\u00fctfen marka, model ve y\u0131l alanlar\u0131n\u0131 doldurun.",
      );
      return;
    }

    setSaving(true);
    try {
      const updatedVehicle = await updateVehicle(vehicle.id, {
        brand: brand.trim(),
        model: model.trim(),
        year: parsedYear,
        licensePlate: licensePlate.trim(),
        inspectionAppointmentDate,
        imageUri,
      });

      setVehicle(updatedVehicle);
      setImageUri(null);
      setInspectionAppointmentDate(
        updatedVehicle.inspectionAppointmentDate ?? "",
      );
      Alert.alert("Ba\u015far\u0131l\u0131", "Ara\u00e7 bilgileri g\u00fcncellendi.");
    } catch (error) {
      console.error("Vehicle update error:", error);
      Alert.alert("Hata", "Ara\u00e7 g\u00fcncellenirken bir sorun olu\u015ftu.");
    } finally {
      setSaving(false);
    }
  };

  const imageSource = imageUri
    ? { uri: imageUri }
    : vehicle?.imageUrl
      ? { uri: getSecureImageUrl(vehicle.imageUrl) }
      : undefined;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#a8732b" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screen}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12}>
              <Text style={styles.backText}>Geri</Text>
            </Pressable>
            <Text style={styles.headerTitle}>{"Araç Düzenle"}</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Pressable style={styles.imageBox} onPress={pickVehicleImage}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.vehicleImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <Text style={styles.imagePlaceholder}>{"Araç Resmi Seç"}</Text>
            )}
            <View style={styles.imageAction}>
              <Text style={styles.imageActionText}>
                {imageSource ? "Resmi De\u011fi\u015ftir" : "Resim Ekle"}
              </Text>
            </View>
          </Pressable>

          <View style={styles.form}>
            <Text style={styles.label}>Marka</Text>
            <TextInput
              style={styles.input}
              placeholder="BMW"
              placeholderTextColor="#85858a"
              value={brand}
              onChangeText={setBrand}
            />

            <Text style={styles.label}>Model</Text>
            <TextInput
              style={styles.input}
              placeholder="M3 Competition"
              placeholderTextColor="#85858a"
              value={model}
              onChangeText={setModel}
            />

            <Text style={styles.label}>{"Yıl"}</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              maxLength={4}
              placeholder="2023"
              placeholderTextColor="#85858a"
              value={year}
              onChangeText={setYear}
            />

            <Text style={styles.label}>
              Plaka <Text style={styles.optional}>(Opsiyonel)</Text>
            </Text>
            <TextInput
              style={styles.input}
              autoCapitalize="characters"
              placeholder="34 ABC 123"
              placeholderTextColor="#85858a"
              value={licensePlate}
              onChangeText={setLicensePlate}
            />

            <DatePickerField
              label="Muayene Randevu Tarihi"
              value={inspectionAppointmentDate}
              onChange={setInspectionAppointmentDate}
              optional
            />
          </View>

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Kaydet</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backText: {
    color: "#d3d3d6",
    fontSize: 15,
    fontWeight: "700",
  },
  content: {
    padding: 22,
    paddingBottom: 34,
  },
  form: {
    gap: 12,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerSpacer: {
    width: 34,
  },
  headerTitle: {
    color: "#f2f2f2",
    fontSize: 20,
    fontWeight: "800",
  },
  imageAction: {
    backgroundColor: "rgba(0,0,0,0.62)",
    borderRadius: 6,
    bottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    position: "absolute",
    right: 12,
  },
  imageActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  imageBox: {
    alignItems: "center",
    backgroundColor: "#2a2b30",
    borderColor: "#3a3b40",
    borderRadius: 8,
    borderWidth: 1,
    height: 190,
    justifyContent: "center",
    marginBottom: 22,
    overflow: "hidden",
  },
  imagePlaceholder: {
    color: "#b9b9bd",
    fontSize: 14,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "#2a2b30",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    height: 50,
    paddingHorizontal: 16,
  },
  label: {
    color: "#f0f0f1",
    fontSize: 14,
    fontWeight: "800",
  },
  loadingBox: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  optional: {
    color: "#a9a9ae",
    fontSize: 12,
    fontWeight: "500",
  },
  safeArea: {
    backgroundColor: "#17181a",
    flex: 1,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: "#a8732b",
    borderRadius: 8,
    height: 52,
    justifyContent: "center",
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: "#6e4b1c",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  screen: {
    flex: 1,
  },
  vehicleImage: {
    height: "100%",
    width: "100%",
  },
});
