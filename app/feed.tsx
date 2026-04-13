import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
  } from "react-native";
  
  const users = [
    { name: "Semih İlkay", image: require("../assets/images/3.jpg") },
    { name: "jade", image: require("../assets/images/19.jpeg") },
    { name: "madeline", image: require("../assets/images/23.jpg") },
    { name: "katrina", image: require("../assets/images/18.jpeg") },
  ];
  
  const feedOne = require("../assets/images/12.jpg.webp");
  const feedTwo = require("../assets/images/21.jpg");
  
  export default function Feed() {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.logo}>AutoTrack</Text>
  
          <View style={styles.storyRow}>
            {users.map((user) => (
              <View style={styles.story} key={user.name}>
                <Image source={user.image} style={styles.storyImage} />
                <Text style={styles.storyName}>{user.name}</Text>
              </View>
            ))}
          </View>
  
          <Post
            author="James Green"
            image={feedOne}
            username="jamesgreen"
            caption="Sunset drive along the coast"
            time="2 days ago"
          />
          <Post
            author="Noah Hessler"
            image={feedTwo}
            username="noahhesler"
            caption="Morning drive in the mountains"
            time="4 days ago"
          />
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  function Post({
    author,
    image,
    username,
    caption,
    time,
  }: {
    author: string;
    image: number;
    username: string;
    caption: string;
    time: string;
  }) {
    return (
      <View style={styles.post}>
        <Text style={styles.author}>●  {author}</Text>
        <Image source={image} style={styles.postImage} />
        <Text style={styles.caption}>
          <Text style={styles.username}>{username}</Text>   {caption}
        </Text>
        <Text style={styles.time}>{time}</Text>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#202124" },
    content: { paddingHorizontal: 24, paddingTop: 22, paddingBottom: 34 },
    logo: { color: "#c47a2d", fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 10 },
    storyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 18 },
    story: { alignItems: "center", width: 72 },
    storyImage: { borderColor: "#c457a5", borderRadius: 8, borderWidth: 2, height: 58, width: 58 },
    storyName: { color: "#f2f2f4", fontSize: 11, fontWeight: "800", marginTop: 6 },
    post: { borderTopColor: "#34353a", borderTopWidth: 1, paddingTop: 14, marginBottom: 26 },
    author: { color: "#f2f2f4", fontSize: 20, fontWeight: "800", marginBottom: 10 },
    postImage: { borderRadius: 8, height: 182, width: "100%" },
    caption: { color: "#f0f0f2", fontSize: 13, marginTop: 12 },
    username: { fontWeight: "800" },
    time: { color: "#c7c7cc", fontSize: 12, marginTop: 2 },
  });
  