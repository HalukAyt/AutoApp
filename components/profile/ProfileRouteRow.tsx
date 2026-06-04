import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileRouteRowProps {
  title: string;
  detail: string;
  duration: number;
  distance: number;
  onDelete?: () => void;
  onEdit?: () => void;
  onPress?: () => void;
}

export function ProfileRouteRow({
  title,
  detail,
  duration,
  distance,
  onDelete,
  onEdit,
  onPress,
}: ProfileRouteRowProps) {
  return (
    <View style={styles.routeRow}>
      <Pressable style={styles.routeTextBox} onPress={onPress}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.metricText}>
          {duration} saat {"\u00b7"} {distance} km
        </Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </Pressable>
      <View style={styles.actionGroup}>
        <Pressable style={styles.actionButton} onPress={onEdit}>
          <Text style={styles.actionText}>{"D\u00fczenle"}</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
          <Text style={styles.actionText}>{"Sil"}</Text>
        </Pressable>
      </View>
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
  routeRow: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 12,
  },
  routeTextBox: {
    flex: 1,
    marginLeft: 12,
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
