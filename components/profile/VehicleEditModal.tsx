import { DatePickerField } from "@/components/forms/DatePickerField";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const EXPENSE_CATEGORIES = [
  "Zorunlu Trafik Sigortası",
  "Kasko",
  "Motorlu Taşıtlar Vergisi (MTV)",
  "Periyodik Bakım",
  "Araç Muayenesi",
  "Ağır Bakım",
  "Lastik Değişimi",
  "Yakıt Gideri",
  "Otoyol ve Köprü",
  "Park Ücreti",
  "Temizlik ve Kozmetik",
];

interface VehicleEditModalProps {
  visible: boolean;
  brand: string;
  model: string;
  year: string;
  licensePlate: string;
  inspectionAppointmentDate: string;
  imageUri: string | null;
  isUpdating: boolean;
  expenseCategory: string;
  expenseAmount: string;
  isAddingExpense: boolean;
  onBrandChange: (value: string) => void;
  onModelChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onLicensePlateChange: (value: string) => void;
  onInspectionAppointmentDateChange: (value: string) => void;
  onExpenseCategoryChange: (value: string) => void;
  onExpenseAmountChange: (value: string) => void;
  onPickImage: () => void;
  onSave: () => void;
  onAddExpense: () => void;
  onClose: () => void;
}

export function VehicleEditModal({
  visible,
  brand,
  model,
  year,
  licensePlate,
  inspectionAppointmentDate,
  imageUri,
  isUpdating,
  expenseCategory,
  expenseAmount,
  isAddingExpense,
  onBrandChange,
  onModelChange,
  onYearChange,
  onLicensePlateChange,
  onInspectionAppointmentDateChange,
  onExpenseCategoryChange,
  onExpenseAmountChange,
  onPickImage,
  onSave,
  onAddExpense,
  onClose,
}: VehicleEditModalProps) {
  const [isCategoryOpen, setCategoryOpen] = useState(false);

  const selectCategory = (category: string) => {
    onExpenseCategoryChange(category);
    setCategoryOpen(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>{"Aracı Düzenle"}</Text>

            <TouchableOpacity style={styles.imagePickerBtn} onPress={onPickImage}>
              <Text style={styles.imagePickerText}>
                {imageUri ? "Yeni Resim Seçildi (Değiştir)" : "Araç Resmi Seç"}
              </Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={"Marka (Örn: Toyota)"}
              placeholderTextColor="#999"
              value={brand}
              onChangeText={onBrandChange}
            />
            <TextInput
              style={styles.input}
              placeholder={"Model (Örn: Corolla)"}
              placeholderTextColor="#999"
              value={model}
              onChangeText={onModelChange}
            />
            <TextInput
              style={styles.input}
              placeholder={"Yıl (Örn: 2022)"}
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
            <DatePickerField
              label="Muayene Randevu Tarihi"
              value={inspectionAppointmentDate}
              onChange={onInspectionAppointmentDateChange}
              optional
              iosDisplay="compact"
            />

            <View style={styles.expenseBox}>
              <Text style={styles.expenseTitle}>{"Masraf Ekle"}</Text>
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setCategoryOpen((current) => !current)}
              >
                <Text
                  style={[
                    styles.dropdownButtonText,
                    !expenseCategory && styles.dropdownPlaceholder,
                  ]}
                  numberOfLines={2}
                >
                  {expenseCategory || "Masraf türü seç"}
                </Text>
                <Text style={styles.dropdownChevron}>{isCategoryOpen ? "⌃" : "⌄"}</Text>
              </TouchableOpacity>

              {isCategoryOpen ? (
                <View style={styles.dropdownList}>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.dropdownItem,
                        category === expenseCategory && styles.dropdownItemSelected,
                      ]}
                      onPress={() => selectCategory(category)}
                    >
                      <Text style={styles.dropdownItemText}>{category}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}

              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="Tutar"
                placeholderTextColor="#999"
                value={expenseAmount}
                onChangeText={onExpenseAmountChange}
              />
              <TouchableOpacity
                style={[styles.expenseButton, isAddingExpense && styles.disabledButton]}
                onPress={onAddExpense}
                disabled={isAddingExpense}
              >
                {isAddingExpense ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalBtnText}>{"Masraf Ekle"}</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelButton]}
                onPress={onClose}
                disabled={isUpdating || isAddingExpense}
              >
                <Text style={styles.modalBtnText}>{"İptal"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveButton]}
                onPress={onSave}
                disabled={isUpdating || isAddingExpense}
              >
                {isUpdating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.modalBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: "#555",
  },
  disabledButton: {
    opacity: 0.7,
  },
  dropdownButton: {
    alignItems: "center",
    backgroundColor: "#17181a",
    borderColor: "#444",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  dropdownButtonText: {
    color: "white",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 18,
  },
  dropdownChevron: {
    color: "#a8732b",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  dropdownItem: {
    borderBottomColor: "#34363c",
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: "#3a3024",
  },
  dropdownItemText: {
    color: "#f3f3f3",
    fontSize: 13,
    fontWeight: "700",
  },
  dropdownList: {
    backgroundColor: "#202126",
    borderColor: "#444",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
  },
  dropdownPlaceholder: {
    color: "#999",
  },
  expenseBox: {
    borderColor: "#444",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 12,
  },
  expenseButton: {
    alignItems: "center",
    backgroundColor: "#a8732b",
    borderRadius: 8,
    padding: 12,
  },
  expenseTitle: {
    color: "white",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
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
    marginTop: 14,
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
    maxHeight: "88%",
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