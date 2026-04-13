import api from "@/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  interface LoginData {
    email: string;
    password: string;
  }

  const handleLogin = async () => {
    try {
      const response = await api().post("/auth/login", {
        email: email,
        password: password,
      } as LoginData);

      const token = response.data.token;
      await AsyncStorage.setItem("token", token);
      router.push("/home");
   
    } catch (error) {
      Alert.alert("Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.screen}
      >
        <View style={styles.content}>
          <Text style={styles.logo}>AutoTrack</Text>

          <Text style={styles.helperText}>
            Kullanıcı adı ve şifrenizi giriniz.
          </Text>

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Kullanıcı Adı"
            placeholderTextColor="#9a9a9a"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordField}>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Şifre"
              placeholderTextColor="#9a9a9a"
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              accessibilityLabel={
                isPasswordVisible ? "Şifreyi gizle" : "Şifreyi göster"
              }
              hitSlop={10}
              onPress={() => setIsPasswordVisible((value) => !value)}
            >
              <Text style={styles.eyeText}>
                {isPasswordVisible ? "Gizle" : "Göster"}
              </Text>
            </Pressable>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Giriş Yap</Text>
          </Pressable>

          <Text style={styles.accountText}>Hesabınız yok mu ?</Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/register")}
          >
            <Text style={styles.secondaryButtonText}>Kayıt Ol</Text>
          </Pressable>

          <View style={styles.socialRow}>
            <Pressable style={[styles.socialButton, styles.instagramButton]}>
              <Text style={styles.socialIcon}>◎</Text>
            </Pressable>
            <Pressable style={[styles.socialButton, styles.facebookButton]}>
              <Text style={styles.socialIcon}>f</Text>
            </Pressable>
            <Pressable style={[styles.socialButton, styles.xButton]}>
              <Text style={styles.socialIcon}>X</Text>
            </Pressable>
          </View>
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
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  logo: {
    color: "#bf7a32",
    fontSize: 38,
    fontWeight: "800",
    marginBottom: 74,
  },
  helperText: {
    alignSelf: "stretch",
    color: "#b9b9bd",
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    alignSelf: "stretch",
    backgroundColor: "#0d0d0f",
    borderRadius: 8,
    color: "#f1f1f1",
    fontSize: 16,
    height: 46,
    marginBottom: 22,
    paddingHorizontal: 18,
  },
  passwordField: {
    alignSelf: "stretch",
    alignItems: "center",
    backgroundColor: "#0d0d0f",
    borderRadius: 8,
    flexDirection: "row",
    height: 46,
    marginBottom: 26,
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
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#bd762f",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    marginBottom: 24,
    width: 102,
  },
  primaryButtonText: {
    color: "#f2f2f2",
    fontSize: 14,
    fontWeight: "700",
  },
  accountText: {
    color: "#a8a8ad",
    fontSize: 14,
    marginBottom: 24,
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#bd762f",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    marginBottom: 70,
    width: 102,
  },
  secondaryButtonText: {
    color: "#f2f2f2",
    fontSize: 13,
    fontWeight: "700",
  },
  socialRow: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  socialButton: {
    alignItems: "center",
    borderRadius: 7,
    height: 48,
    justifyContent: "center",
    width: 64,
  },
  instagramButton: {
    backgroundColor: "#78116f",
  },
  facebookButton: {
    backgroundColor: "#4b73bd",
  },
  xButton: {
    backgroundColor: "#050505",
  },
  socialIcon: {
    color: "#f4f4f4",
    fontSize: 30,
    fontWeight: "800",
  },
});
