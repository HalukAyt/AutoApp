import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
  } from "react-native";
  
  const f1Image = require("../assets/images/33.jpg");
  const skodaImage = require("../assets/images/22.png.webp");
  
  export default function Clubs() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            placeholder="Kulüp Ara..."
            placeholderTextColor="#d7d7dc"
            style={styles.search}
          />
          <Text style={styles.title}>Kulüpler</Text>
          <ClubCard
            image={f1Image}
            title="F1 Severler Kulübü"
            text="Formula 1 tutkunlarını bir araya getiren bir topluluktur. Yarış haftalarını birlikte takip eden, takımlar ve pilotlar hakkında fikir alışverişi yapan üyeler."
          />
          <ClubCard
            image={skodaImage}
            title="Skoda Türkiye"
            text="Skoda marka araç kullanıcılarını ve meraklılarını bir araya getiren topluluk. Üyeler araç deneyimlerini paylaşır, bakım ve modifikasyon konuşur."
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  function ClubCard({ image, title, text }: { image: number; title: string; text: string }) {
    return (
      <View style={styles.card}>
        <Image source={image} style={styles.image} />
        <View style={styles.textPanel}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardText}>Hakkında: {text}</Text>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#202124" },
    content: { padding: 28, paddingBottom: 32 },
    search: {
      backgroundColor: "#55565a",
      borderRadius: 18,
      color: "#fff",
      height: 38,
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    title: { color: "#f4f4f6", fontSize: 23, fontWeight: "800", marginBottom: 26 },
    card: { backgroundColor: "#30323b", borderRadius: 8, marginBottom: 34, overflow: "hidden" },
    image: { height: 150, width: "100%" },
    textPanel: { padding: 10 },
    cardTitle: { color: "#f5f5f6", fontSize: 23, fontWeight: "500", marginBottom: 8 },
    cardText: { color: "#e0e0e4", fontSize: 13, lineHeight: 21 },
  });
  