import { DatePickerField } from "@/components/forms/DatePickerField";
import { addVehicle } from "@/services/vehicleService";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

export default function AddVehicle() {
  const router = useRouter();

  const [licensePlate, setLicensePlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [inspectionAppointmentDate, setInspectionAppointmentDate] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(false);

  // --- GÜNCEL FOTOĞRAF SEÇME MANTIĞI VE LOGLAR ---

  // Galeriden Fotoğraf Seçme
  const chooseFromLibrary = async () => {
    console.log("LOG: Galeriden Seç butonuna basıldı.");
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log("LOG: Galeri izni verilmedi.");
      Alert.alert("Hata", "Fotoğraf galerisine erişim izni gerekiyor!");
      return;
    }

    console.log("LOG: Galeri izni tamam, galeri açılıyor.");
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      console.log("LOG: Fotoğraf seçildi. URI:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    } else {
      console.log("LOG: Kullanıcı fotoğraf seçmeyi iptal etti.");
    }
  };

  // Kamera ile Yeni Fotoğraf Çekme
  const takeNewPhoto = async () => {
    console.log("LOG: Fotoğraf Çek butonuna basıldı.");
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      console.log("LOG: Kamera izni verilmedi.");
      Alert.alert("Hata", "Kamerayı kullanmak için izin vermelisiniz.");
      return;
    }

    console.log("LOG: Kamera izni tamam, kamera açılıyor.");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled) {
      console.log("LOG: Fotoğraf çekildi. URI:", result.assets[0].uri);
      setImageUri(result.assets[0].uri);
    } else {
      console.log("LOG: Kullanıcı fotoğraf çekmeyi iptal etti.");
    }
  };

  // --- KAYDETME MANTIĞI ---

  // Tüm verileri tek seferde Backend'e gönderme
  const handleSaveVehicle = async () => {
    // 1. Doğrulama (Validation) - DİKKAT: licensePlate artık zorunlu değil!
    if (!brand || !model || !year) {
      Alert.alert("Uyarı", "Lütfen marka, model ve yıl alanlarını doldurun.");
      return;
    }

    setLoading(true);
    try {
      console.log("LOG: Ara\u00e7 kaydediliyor...");
      await addVehicle({
        licensePlate,
        brand,
        model,
        year,
        inspectionAppointmentDate,
        imageUri,
      });

      console.log("LOG: Ara\u00e7 ba\u015far\u0131yla kaydedildi.");
      Alert.alert("Ba\u015far\u0131l\u0131", "Ara\u00e7 garaj\u0131n\u0131za ba\u015far\u0131yla eklendi!", [
        { text: "Tamam", onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error("Araç kaydetme hatası:", error);
      Alert.alert("Hata", "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Üst Kısım (Header) */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.cancelText}>İptal</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Yeni Araç Ekle</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Fotoğraf Seçme Alanı - YENİ TASARIM */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            // Eğer resim seçildiyse resmi göster ve tıklanınca galeriyi aç (değiştirmek için)
            <Pressable
              onPress={chooseFromLibrary}
              style={{ width: "100%", height: "100%" }}
            >
              <Image
                source={{ uri: imageUri }}
                style={styles.vehicleImage}
                contentFit="cover"
                transition={200}
              />
              <View style={styles.changeImageOverlay}>
                <Text style={styles.changeImageText}>Değiştir</Text>
              </View>
            </Pressable>
          ) : (
            // Resim yoksa iki tane buton göster
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📸</Text>
              <Text style={styles.placeholderText}>Araç Fotoğrafı Ekle</Text>

              <View style={styles.actionRow}>
                <Pressable style={styles.actionButton} onPress={takeNewPhoto}>
                  <Text style={styles.actionButtonText}>📷 Kamera</Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={chooseFromLibrary}
                >
                  <Text style={styles.actionButtonText}>🖼️ Galeri</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Form Alanları */}
        <View style={styles.formContainer}>
          <Text style={styles.label}>
            Plaka <Text style={styles.optionalText}>(Opsiyonel)</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 34 ABC 123"
            placeholderTextColor="#888"
            autoCapitalize="characters"
            value={licensePlate}
            onChangeText={setLicensePlate}
          />

          <Text style={styles.label}>Marka</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: BMW"
            placeholderTextColor="#888"
            value={brand}
            onChangeText={setBrand}
          />

          <Text style={styles.label}>Model</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: M3 Competition"
            placeholderTextColor="#888"
            value={model}
            onChangeText={setModel}
          />

          <Text style={styles.label}>Yıl</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 2023"
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={4}
            value={year}
            onChangeText={setYear}
          />

          <DatePickerField
            label="Muayene Randevu Tarihi"
            value={inspectionAppointmentDate}
            onChange={setInspectionAppointmentDate}
            optional
          />
        </View>

        {/* Kaydet Butonu */}
        <Pressable
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveVehicle}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Garaja Ekle</Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stiller
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#17181a",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    color: "#f0f0f1",
    fontSize: 18,
    fontWeight: "800",
  },
  cancelText: {
    color: "#a9a9ae",
    fontSize: 16,
  },
  imageContainer: {
    height: 180,
    backgroundColor: "#2a2b30",
    borderRadius: 12,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#3a3b40",
    borderStyle: "dashed",
  },
  vehicleImage: {
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  placeholderText: {
    color: "#a9a9ae",
    fontSize: 14,
    fontWeight: "600",
  },
  formContainer: {
    gap: 16,
    marginBottom: 30,
  },
  label: {
    color: "#f0f0f1",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: -8,
  },
  optionalText: {
    color: "#a9a9ae",
    fontSize: 12,
    fontWeight: "400",
  },
  input: {
    backgroundColor: "#2a2b30",
    color: "#fff",
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#a8732b",
    height: 54,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  saveButtonDisabled: {
    backgroundColor: "#6e4b1c",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    backgroundColor: "#3a3b40",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionButtonText: {
    color: "#f0f0f1",
    fontSize: 13,
    fontWeight: "600",
  },
  changeImageOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});
