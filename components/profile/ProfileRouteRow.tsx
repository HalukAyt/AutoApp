import { Pressable, StyleSheet, Text, View } from "react-native";

interface ProfileRouteRowProps {
  title: string;
  detail: string;
  duration: number;
  distance: number;
  routeDate?: string | null;
  onDelete?: () => void;
  onEdit?: () => void;
  onPress?: () => void;
}

export function ProfileRouteRow({
  title,
  detail,
  duration,
  distance,
  routeDate,
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
        {routeDate ? (
          <Text style={styles.dateText}>{formatDisplayDate(routeDate)}</Text>
        ) : null}
        <Text style={styles.rowDetail}>{detail}</Text>
      </Pressable>
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
    </View>
  );
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
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
  dateText: {
    color: "#a8732b",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 3,
    marginLeft: 12,
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
