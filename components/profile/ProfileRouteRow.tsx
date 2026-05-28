import { StyleSheet, Text, View } from "react-native";

interface ProfileRouteRowProps {
  title: string;
  detail: string;
  duration: number;
  distance: number;
}

export function ProfileRouteRow({
  title,
  detail,
  duration,
  distance,
}: ProfileRouteRowProps) {
  return (
    <View style={styles.routeRow}>
      <View style={styles.routeTextBox}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.metricText}>
          {duration} saat {"\u00b7"} {distance} km
        </Text>
        <Text style={styles.rowDetail}>{detail}</Text>
      </View>
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