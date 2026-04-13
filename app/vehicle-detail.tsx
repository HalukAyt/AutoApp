import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Register() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screen}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>AutoTrack</Text>
          <Text style={styles.title}>Kayıt Ol</Text>

          <TextInput
            placeholder="Ad"
            placeholderTextColor="#9a9a9a"
            style={styles.input}
          />

          <TextInput
            placeholder="Soyad"
            placeholderTextColor="#9a9a9a"
            style={styles.input}
          />

          <TextInput
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="Mail Adresi"
            placeholderTextColor="#9a9a9a"
            style={styles.input}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#9a9a9a"
            style={styles.input}
          />

          <View style={styles.passwordField}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Parola"
              placeholderTextColor="#9a9a9a"
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
            />
            <Pressable
              accessibilityLabel={
                isPasswordVisible ? "Parolayı gizle" : "Parolayı göster"
              }
              hitSlop={10}
              onPress={() => setIsPasswordVisible((value) => !value)}
            >
              <Text style={styles.eyeText}>{isPasswordVisible ? "Gizle" : "Göster"}</Text>
            </Pressable>
          </View>

          <Pressable style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Kayıt Ol</Text>
          </Pressable>

          <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#242426",
  },
  screen: {
    flex: 1,
    backgroundColor: "#242426",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    color: "#bf7a32",
    fontSize: 38,
    fontWeight: "800",
    marginBottom: 20,
  },
  title: {
    color: "#f2f2f2",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 28,
  },
  input: {
    alignSelf: "stretch",
    backgroundColor: "#0d0d0f",
    borderRadius: 8,
    color: "#f1f1f1",
    fontSize: 16,
    height: 46,
    marginBottom: 18,
    paddingHorizontal: 18,
  },
  passwordField: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: "#0d0d0f",
    borderRadius: 8,
    flexDirection: "row",
    height: 46,
    marginBottom: 30,
    paddingLeft: 18,
    paddingRight: 14,
  },
  passwordInput: {
    color: "#f1f1f1",
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  eyeText: {
    color: "#8f8f94",
    fontSize: 12,
    fontWeight: "700",
  },
  registerButton: {
    alignItems: "center",
    backgroundColor: "#bd762f",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginBottom: 24,
    width: 112,
  },
  registerButtonText: {
    color: "#f2f2f2",
    fontSize: 14,
    fontWeight: "700",
  },
  loginText: {
    color: "#b8b8bd",
    fontSize: 16,
    fontWeight: "700",
  },
});
