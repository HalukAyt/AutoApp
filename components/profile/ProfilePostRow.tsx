import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { StyleSheet, Text, View } from "react-native";

interface ProfilePostRowProps {
  image: ImageSourcePropType;
  title: string;
  time: string;
  likes: string;
  comments: string;
}

export function ProfilePostRow({
  image,
  title,
  time,
  likes,
  comments,
}: ProfilePostRowProps) {
  return (
    <View style={styles.postRow}>
      <Image source={image} style={styles.postImage} />
      <View style={styles.postTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{time}</Text>
      </View>
      <Text style={styles.metricText}>{likes} {"\u2661"}</Text>
      <Text style={styles.metricText}>{comments} {"\u25b1"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metricText: {
    color: "#d1d1d5",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 12,
  },
  postImage: {
    borderRadius: 8,
    height: 44,
    width: 72,
  },
  postRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 14,
  },
  postTextBox: {
    flex: 1,
    marginLeft: 10,
  },
  rowDetail: {
    color: "#c3c3c8",
    fontSize: 12,
    fontWeight: "700",
  },
  rowTitle: {
    color: "#f0f0f1",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 4,
  },
});