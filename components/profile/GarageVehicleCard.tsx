import type { Vehicle } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import type { ImageSourcePropType } from "react-native";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface GarageVehicleCardProps {
  vehicle: Vehicle;
  fallbackImage: ImageSourcePropType;
  onPress: () => void;
}

export function GarageVehicleCard({
  vehicle,
  fallbackImage,
  onPress,
}: GarageVehicleCardProps) {
  return (
    <TouchableOpacity style={styles.garageItem} onPress={onPress}>
      <Image
        source={
          vehicle.imageUrl
            ? { uri: getSecureImageUrl(vehicle.imageUrl) }
            : fallbackImage
        }
        style={styles.garageImage}
        contentFit="cover"
        transition={200}
      />
      <Text style={styles.imageLabel}>
        {vehicle.brand} {vehicle.model} {vehicle.year}
        {vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ""}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  garageImage: {
    borderRadius: 8,
    height: 78,
    width: "100%",
  },
  garageItem: {
    flex: 1,
  },
  imageLabel: {
    color: "#eeeeee",
    fontSize: 12,
    fontWeight: "800",
    marginTop: -18,
    paddingLeft: 10,
  },
});
