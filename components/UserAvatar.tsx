import { Image } from "expo-image";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";

import { getSecureImageUrl } from "@/utils/imageUrl";

type UserAvatarProps = {
  imageUrl?: string | null;
  name?: string | null;
  username?: string | null;
  size?: number;
  borderRadius?: number;
  textSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function UserAvatar({
  borderRadius = 8,
  imageUrl,
  name,
  size = 42,
  style,
  textSize,
  username,
}: UserAvatarProps) {
  const secureImageUrl = imageUrl ? getSecureImageUrl(imageUrl) : undefined;
  const avatarStyle = [
    styles.avatar,
    { borderRadius, height: size, width: size },
    style,
  ];

  return (
    <View style={avatarStyle}>
      {secureImageUrl ? (
        <Image
          source={{ uri: secureImageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.initials, { fontSize: textSize ?? Math.max(11, size * 0.32) }]}>
            {getInitials(name, username)}
          </Text>
        </View>
      )}
    </View>
  );
}

function getInitials(name?: string | null, username?: string | null) {
  const displayName = name?.trim();

  if (displayName) {
    const initials = displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("");

    return initials.toLocaleUpperCase("tr-TR");
  }

  const cleanUsername = username?.replace(/^@/, "").trim();
  return cleanUsername ? cleanUsername.slice(0, 2).toLocaleUpperCase("tr-TR") : "?";
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: "#302a22",
    overflow: "hidden",
  },
  fallback: {
    alignItems: "center",
    backgroundColor: "#302a22",
    flex: 1,
    justifyContent: "center",
  },
  initials: {
    color: "#c47a2d",
    fontWeight: "900",
  },
});
