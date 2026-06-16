import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfilePostRowProps {
  image: ImageSourcePropType;
  title: string;
  time: string;
  likes: string;
  comments: string;
  onDelete?: () => void;
  onEdit?: () => void;
  onPress?: () => void;
}

export function ProfilePostRow({
  image,
  title,
  time,
  likes,
  comments,
  onDelete,
  onEdit,
  onPress,
}: ProfilePostRowProps) {
  const content = (
    <>
      <Image source={image} style={styles.postImage} />
      <View style={styles.postTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDetail}>{time}</Text>
      </View>
      <Text style={styles.metricText}>{likes} {"\u2661"}</Text>
      <Text style={styles.metricText}>{comments} {"\u25b1"}</Text>
      {onEdit || onDelete ? (
        <View style={styles.actionGroup}>
          {onEdit ? (
            <Pressable style={styles.actionButton} onPress={onEdit}>
              <Text style={styles.actionText}>{"D\u00fczenle"}</Text>
            </Pressable>
          ) : null}
          {onDelete ? (
            <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Text style={styles.actionText}>{"Sil"}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </>
  );

  return onPress ? (
    <Pressable style={styles.postRow} onPress={onPress}>
      {content}
    </Pressable>
  ) : (
    <View style={styles.postRow}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    alignItems: "center",
    backgroundColor: "#4b4c52",
    borderRadius: 8,
    minWidth: 58,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionGroup: {
    gap: 6,
    marginLeft: 10,
  },
  actionText: {
    color: "#f4f4f6",
    fontSize: 10,
    fontWeight: "900",
  },
  deleteButton: {
    backgroundColor: "#8d3838",
  },
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
