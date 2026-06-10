import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type IOSDatePickerDisplay = "default" | "compact" | "inline" | "spinner";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  optional?: boolean;
  placeholder?: string;
  iosDisplay?: IOSDatePickerDisplay;
}

const padDatePart = (value: number) => value.toString().padStart(2, "0");

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const formatDisplayDate = (value: string, placeholder: string) => {
  if (!value) return placeholder;

  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};

export function DatePickerField({
  label,
  value,
  onChange,
  optional,
  placeholder = "Tarih se\u00e7",
  iosDisplay = "inline",
}: DatePickerFieldProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const selectedDate = value ? parseIsoDate(value) : new Date();

  const handleDateChange = (
    event: DateTimePickerEvent,
    selected?: Date,
  ) => {
    if (Platform.OS === "android") {
      setPickerVisible(false);
    }

    if (event.type === "dismissed" || !selected) {
      return;
    }

    onChange(toIsoDate(selected));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {optional ? <Text style={styles.optional}> (Opsiyonel)</Text> : null}
      </Text>

      <Pressable
        style={styles.field}
        onPress={() => setPickerVisible((visible) => !visible)}
      >
        <Text style={[styles.fieldText, !value && styles.placeholderText]}>
          {formatDisplayDate(value, placeholder)}
        </Text>
        <Text style={styles.actionText}>{value ? "De\u011fi\u015ftir" : "Se\u00e7"}</Text>
      </Pressable>

      {isPickerVisible ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? iosDisplay : "calendar"}
            locale="tr-TR"
            onChange={handleDateChange}
          />
          {Platform.OS === "ios" ? (
            <View style={styles.iosActions}>
              {value ? (
                <Pressable onPress={() => onChange("")} hitSlop={8}>
                  <Text style={styles.clearText}>Temizle</Text>
                </Pressable>
              ) : (
                <View />
              )}
              <Pressable onPress={() => setPickerVisible(false)} hitSlop={8}>
                <Text style={styles.doneText}>Tamam</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionText: {
    color: "#c47a2d",
    fontSize: 13,
    fontWeight: "800",
  },
  clearText: {
    color: "#a9a9ae",
    fontSize: 14,
    fontWeight: "800",
  },
  container: {
    gap: 8,
  },
  doneText: {
    color: "#c47a2d",
    fontSize: 14,
    fontWeight: "800",
  },
  field: {
    alignItems: "center",
    backgroundColor: "#2a2b30",
    borderRadius: 8,
    flexDirection: "row",
    height: 50,
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  fieldText: {
    color: "#fff",
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    marginRight: 12,
  },
  iosActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingTop: 8,
  },
  label: {
    color: "#f0f0f1",
    fontSize: 14,
    fontWeight: "800",
  },
  optional: {
    color: "#a9a9ae",
    fontSize: 12,
    fontWeight: "500",
  },
  pickerWrap: {
    backgroundColor: "#202126",
    borderRadius: 8,
    padding: Platform.OS === "ios" ? 8 : 0,
  },
  placeholderText: {
    color: "#85858a",
    fontWeight: "600",
  },
});
