import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

export function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.chevron}>{"\u203a"}</Text>
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#34353c",
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 20,
    paddingBottom: 14,
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  cardHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardTitle: {
    color: "#f2f2f2",
    fontSize: 17,
    fontWeight: "800",
  },
  chevron: {
    color: "#17181a",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 30,
  },
});