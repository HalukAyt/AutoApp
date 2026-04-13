import {
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from "react-native";
  
  export default function EditProfile() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.title}>Profil Düzenle</Text>
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
  
          <Field label="Ad" value="John" />
          <Field label="Soyad" value="Doe" />
          <Field label="E posta" placeholder="Eposta adresini yazınız" />
          <Field label="Telefon" placeholder="telefon numarası giriniz" />
  
          <Pressable style={styles.wideButton}>
            <Text style={styles.buttonText}>Araç Ekle</Text>
          </Pressable>
  
          <Pressable style={styles.saveButton}>
            <Text style={styles.buttonText}>Kaydet</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }
  
  function Field({
    label,
    value,
    placeholder,
  }: {
    label: string;
    value?: string;
    placeholder?: string;
  }) {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          defaultValue={value}
          placeholder={placeholder}
          placeholderTextColor="#6f7075"
          style={styles.input}
        />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#242528" },
    content: { flex: 1, paddingHorizontal: 34, paddingTop: 54 },
    title: { color: "#f3f3f4", fontSize: 34, fontWeight: "800", marginBottom: 30 },
    sectionTitle: { color: "#f3f3f4", fontSize: 20, fontWeight: "800", marginBottom: 16 },
    field: { marginBottom: 16 },
    label: { color: "#e7e7e9", fontSize: 18, fontWeight: "800", marginBottom: 8, paddingLeft: 14 },
    input: {
      backgroundColor: "#0c0c0e",
      borderRadius: 8,
      color: "#f5f5f5",
      fontSize: 16,
      height: 46,
      paddingHorizontal: 18,
    },
    wideButton: {
      alignItems: "center",
      backgroundColor: "#c77d2b",
      borderRadius: 8,
      height: 48,
      justifyContent: "center",
      marginTop: 18,
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
    buttonText: { color: "#f7f7f7", fontSize: 16, fontWeight: "700" },
  });
  