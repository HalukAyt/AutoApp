import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

type IOSDatePickerDisplay = "default" | "compact" | "inline" | "spinner";
type PickerMode = "date" | "time";

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mode?: PickerMode;
  optional?: boolean;
  placeholder?: string;
  iosDisplay?: IOSDatePickerDisplay;
}

const padDatePart = (value: number) => value.toString().padStart(2, "0");

const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(
    date.getDate(),
  )}`;

const toIsoTime = (date: Date) =>
  `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;

const parseIsoDate = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const parseIsoTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date();

  date.setHours(
    Number.isFinite(hour) ? hour : 0,
    Number.isFinite(minute) ? minute : 0,
    0,
    0,
  );

  return date;
};

const formatDisplayDate = (value: string) => {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
};

const formatDisplayTime = (value: string) => {
  const [hour, minute] = value.split(":");

  return hour && minute ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}` : value;
};

const formatDisplayValue = (value: string, placeholder: string, mode: PickerMode) => {
  if (!value) return placeholder;

  return mode === "time" ? formatDisplayTime(value) : formatDisplayDate(value);
};

export function DatePickerField({
  label,
  value,
  onChange,
  mode = "date",
  optional,
  placeholder = "Tarih se\u00e7",
  iosDisplay = "inline",
}: DatePickerFieldProps) {
  const [isPickerVisible, setPickerVisible] = useState(false);
  const selectedDate = value
    ? mode === "time"
      ? parseIsoTime(value)
      : parseIsoDate(value)
    : new Date();
  const pickerDisplay =
    Platform.OS === "ios"
      ? mode === "time" && iosDisplay === "inline"
        ? "spinner"
        : iosDisplay
      : mode === "time"
        ? "clock"
        : "calendar";

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

    onChange(mode === "time" ? toIsoTime(selected) : toIsoDate(selected));
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
          {formatDisplayValue(value, placeholder, mode)}
        </Text>
        <Text style={styles.actionText}>{value ? "De\u011fi\u015ftir" : "Se\u00e7"}</Text>
      </Pressable>

      {isPickerVisible ? (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={selectedDate}
            mode={mode}
            display={pickerDisplay}
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
    marginBottom: 12,
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
