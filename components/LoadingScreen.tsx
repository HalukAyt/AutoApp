import { ActivityIndicator, StyleSheet, View } from "react-native";

interface LoadingScreenProps {
  backgroundColor?: string;
  color?: string;
}

export function LoadingScreen({
  backgroundColor = "#17181a",
  color = "#a8732b",
}: LoadingScreenProps) {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ActivityIndicator size="large" color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
});