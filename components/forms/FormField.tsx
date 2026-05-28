import { StyleSheet, Text, TextInput, View } from "react-native";

interface FormFieldProps {
  label: string;
  value?: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
}

export function FormField({
  label,
  value,
  placeholder,
  onChangeText,
}: FormFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#6f7075"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#0c0c0e",
    borderRadius: 8,
    color: "#f5f5f5",
    fontSize: 16,
    height: 46,
    paddingHorizontal: 18,
  },
  label: {
    color: "#e7e7e9",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    paddingLeft: 14,
  },
});