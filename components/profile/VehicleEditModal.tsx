import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface VehicleEditModalProps {
  visible: boolean;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  imageUri: string | null;
  isUpdating: boolean;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onLicensePlateChange: (value: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  onClose: () => void;
}

export function VehicleEditModal({
  visible,
  brand,
  model,
  year,
  licensePlate,
  imageUri,
  isUpdating,
  onBrandChange,
  onModelChange,
  onYearChange,
  onLicensePlateChange,
  onPickImage,
  onSave,
  onClose,
}: VehicleEditModalProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{"Arac\u0131 D\u00fczenle"}</Text>

          <TouchableOpacity style={styles.imagePickerBtn} onPress={onPickImage}>
            <Text style={styles.imagePickerText}>
              {imageUri
                ? "Yeni Resim Se\u00e7ildi (De\u011fi\u015ftir)"
                : "Ara\u00e7 Resmi Se\u00e7"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={"Marka (\u00d6rn: Toyota)"}
            placeholderTextColor="#999"
            value={brand}
            onChangeText={onBrandChange}
          />
          <TextInput
            style={styles.input}
            placeholder={"Model (\u00d6rn: Corolla)"}
            placeholderTextColor="#999"
            value={model}
            onChangeText={onModelChange}
          />
          <TextInput
            style={styles.input}
            placeholder={"Y\u0131l (\u00d6rn: 2022)"}
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={year}
            onChangeText={onYearChange}
          />
          <TextInput
            style={styles.input}
            placeholder="Plaka (Opsiyonel)"
            placeholderTextColor="#999"
            value={licensePlate}
            onChangeText={onLicensePlateChange}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalBtn, styles.cancelButton]}
              onPress={onClose}
              disabled={isUpdating}
            >
              <Text style={styles.modalBtnText}>{"\u0130ptal"}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalBtn, styles.saveButton]}
              onPress={onSave}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.modalBtnText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: "#555",
  },
  imagePickerBtn: {
    alignItems: "center",
    backgroundColor: "#3a3b40",
    borderRadius: 8,
    marginBottom: 15,
    padding: 12,
  },
  imagePickerText: {
    color: "#a8732b",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#17181a",
    borderColor: "#444",
    borderRadius: 8,
    borderWidth: 1,
    color: "white",
    marginBottom: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalBtn: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
  },
  modalBtnText: {
    color: "white",
    fontWeight: "bold",
  },
  modalContent: {
    backgroundColor: "#2a2b30",
    borderRadius: 12,
    padding: 20,
    width: "85%",
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    flex: 1,
    justifyContent: "center",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#a8732b",
  },
});