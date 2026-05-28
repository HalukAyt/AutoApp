import { LoadingScreen } from "@/components/LoadingScreen";
import { GarageVehicleCard } from "@/components/profile/GarageVehicleCard";
import { ProfilePostRow } from "@/components/profile/ProfilePostRow";
import { ProfileRouteRow } from "@/components/profile/ProfileRouteRow";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { VehicleEditModal } from "@/components/profile/VehicleEditModal";
import { logout } from "@/services/authService";
import { getProfile } from "@/services/profileService";
import { uploadImageToServer } from "@/services/userProfileService";
import { updateVehicle } from "@/services/vehicleService";
import type { UserProfile, Vehicle } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const coverImage = require("../assets/images/21.jpg");
const avatarImage = require("../assets/images/3.jpg");
const garageOne = require("../assets/images/5.jpg");
const garageTwo = require("../assets/images/6.jpg");
const postImage = require("../assets/images/33.jpg");

export default function Profile() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [editBrand, setEditBrand] = useState("");
  const [editModel, setEditModel] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editLicensePlate, setEditLicensePlate] = useState("");
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getProfile();
        setProfile(profileData);
      } catch (error) {
        console.log("Profile fetch error:", error);
        Alert.alert("Hata", "Profil bilgileri al\u0131namad\u0131.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleImageSelection = async (
    isCover: boolean,
    fromCamera: boolean,
  ) => {
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Hata", "Gerekli izinler verilmedi.");
      return;
    }

    const options: ImagePicker.ImagePickerOptions = {
      allowsEditing: true,
      aspect: isCover ? [16, 9] : [1, 1],
      quality: 0.5,
    };

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setProfile((prev) => {
      if (!prev) return prev;
      return isCover
        ? { ...prev, coverPhoto: uri }
        : { ...prev, profilePhoto: uri };
    });

    const endpoint = isCover
      ? "/profile/uploadCoverPhoto"
      : "/profile/uploadProfilePhoto";
    const photoType = isCover ? "cover" : "profile";

    uploadImageToServer(uri, endpoint, photoType);
  };

  const handleProfilePhotoPress = () => {
    Alert.alert("Profil Foto\u011fraf\u0131 Se\u00e7", "Bir se\u00e7enek belirleyin.", [
      {
        text: "Foto\u011fraf \u00c7ek",
        onPress: () => handleImageSelection(false, true),
      },
      {
        text: "Galeriden Se\u00e7",
        onPress: () => handleImageSelection(false, false),
      },
      { text: "\u0130ptal", style: "cancel" },
    ]);
  };

  const handleCoverPhotoPress = () => {
    Alert.alert("Kapak Foto\u011fraf\u0131 Se\u00e7", "Bir se\u00e7enek belirleyin.", [
      {
        text: "Foto\u011fraf \u00c7ek",
        onPress: () => handleImageSelection(true, true),
      },
      {
        text: "Galeriden Se\u00e7",
        onPress: () => handleImageSelection(true, false),
      },
      { text: "\u0130ptal", style: "cancel" },
    ]);
  };

  const openEditVehicleModal = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setEditBrand(vehicle.brand);
    setEditModel(vehicle.model);
    setEditYear(vehicle.year.toString());
    setEditLicensePlate(vehicle.licensePlate || "");
    setEditImageUri(null);
    setEditModalVisible(true);
  };

  const pickVehicleImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
    });

    if (!result.canceled) {
      setEditImageUri(result.assets[0].uri);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicleId) return;

    const parsedYear = parseInt(editYear, 10);
    if (!editBrand.trim() || !editModel.trim() || Number.isNaN(parsedYear)) {
      Alert.alert("Uyar\u0131", "L\u00fctfen marka, model ve y\u0131l alanlar\u0131n\u0131 doldurun.");
      return;
    }

    setIsUpdating(true);
    try {
      const updatedVehicle = await updateVehicle(editingVehicleId, {
        brand: editBrand.trim(),
        model: editModel.trim(),
        year: parsedYear,
        licensePlate: editLicensePlate.trim(),
        imageUri: editImageUri,
      });

      setProfile((prev) => {
        if (!prev) return prev;
        const updatedGarage = prev.garage.map((vehicle) =>
          vehicle.id === editingVehicleId ? updatedVehicle : vehicle,
        );
        return { ...prev, garage: updatedGarage };
      });

      Alert.alert("Ba\u015far\u0131l\u0131", "Ara\u00e7 bilgileri g\u00fcncellendi!");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Vehicle update error:", error);
      Alert.alert("Hata", "Ara\u00e7 g\u00fcncellenirken bir sorun olu\u015ftu.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyScreenText}>Veri bulunamad\u0131.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.coverWrap}>
          <Pressable style={styles.coverPressable} onPress={handleCoverPhotoPress}>
            <Image
              source={
                profile.coverPhoto
                  ? { uri: getSecureImageUrl(profile.coverPhoto) }
                  : coverImage
              }
              style={styles.coverImage}
              contentFit="cover"
              transition={200}
            />
          </Pressable>
          <Pressable style={styles.settingsButton}>
            <Text style={styles.settingsText}>{"\u2699"}</Text>
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Pressable
              onPress={handleProfilePhotoPress}
              style={styles.avatarPressable}
            >
              <Image
                source={
                  profile.profilePhoto
                    ? { uri: getSecureImageUrl(profile.profilePhoto) }
                    : avatarImage
                }
                style={styles.avatarImage}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          </View>

          <View style={styles.identity}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.name}</Text>
              <Pressable
                style={styles.editButton}
                onPress={() => router.push("/edit-profile")}
              >
                <Text style={styles.editText}>{"Profili D\u00fczenle"}</Text>
              </Pressable>
            </View>

            <Text style={styles.username}>{profile.username}</Text>

            <View style={styles.followRow}>
              <Text style={styles.followNumber}>{profile.followerCount}</Text>
              <Text style={styles.followLabel}>{" Takip\u00e7i"}</Text>
              <Text style={styles.followNumber}> {profile.followingCount}</Text>
              <Text style={styles.followLabel}> Takip Edilen</Text>
            </View>
          </View>
        </View>

        <ProfileSection title={"Garaj\u0131m"}>
          <View style={styles.garageRow}>
            {profile.garage.length > 0 ? (
              profile.garage.map((vehicle, index) => (
                <GarageVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  fallbackImage={index % 2 === 0 ? garageOne : garageTwo}
                  onPress={() => openEditVehicleModal(vehicle)}
                />
              ))
            ) : (
              <Text style={styles.emptyText}>
                {"Garaj\u0131n\u0131zda hen\u00fcz ara\u00e7 yok."}
              </Text>
            )}
          </View>
        </ProfileSection>

        <ProfileSection title={"G\u00f6nderiler"}>
          {profile.posts.length > 0 ? (
            profile.posts.map((post) => (
              <ProfilePostRow
                key={post.id}
                image={
                  post.postPhoto
                    ? { uri: getSecureImageUrl(post.postPhoto) }
                    : postImage
                }
                title={post.content}
                time={post.time}
                likes={post.likesCount.toString()}
                comments={post.commentsCount.toString()}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {"Hen\u00fcz bir g\u00f6nderi payla\u015fmad\u0131n\u0131z."}
            </Text>
          )}
        </ProfileSection>

        <ProfileSection title="Rotalar">
          {profile.routes.length > 0 ? (
            profile.routes.map((route) => (
              <ProfileRouteRow
                key={route.id}
                title={route.title}
                detail={route.detail}
                duration={route.duration}
                distance={route.distance}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {"Hen\u00fcz bir rota olu\u015fturmad\u0131n\u0131z."}
            </Text>
          )}
        </ProfileSection>

        <Pressable
          style={styles.logoutButton}
          onPress={() => logout().then(() => router.push("/"))}
        >
          <Text style={styles.logoutButtonText}>{"\u00c7\u0131k\u0131\u015f Yap"}</Text>
        </Pressable>
      </ScrollView>

      <VehicleEditModal
        visible={isEditModalVisible}
        brand={editBrand}
        model={editModel}
        year={editYear}
        licensePlate={editLicensePlate}
        imageUri={editImageUri}
        isUpdating={isUpdating}
        onBrandChange={setEditBrand}
        onModelChange={setEditModel}
        onYearChange={setEditYear}
        onLicensePlateChange={setEditLicensePlate}
        onPickImage={pickVehicleImage}
        onSave={handleUpdateVehicle}
        onClose={() => setEditModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderColor: "#111213",
    borderRadius: 8,
    borderWidth: 2,
    height: 84,
    justifyContent: "center",
    overflow: "hidden",
    width: 84,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  avatarPressable: {
    height: "100%",
    width: "100%",
  },
  coverImage: {
    height: "100%",
    width: "100%",
  },
  coverPressable: {
    flex: 1,
  },
  coverWrap: {
    height: 170,
  },
  editButton: {
    backgroundColor: "#56565c",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  editText: {
    color: "#f5f5f5",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyScreen: {
    alignItems: "center",
    backgroundColor: "#17181a",
    flex: 1,
    justifyContent: "center",
  },
  emptyScreenText: {
    color: "white",
  },
  emptyText: {
    color: "#a9a9ae",
    marginBottom: 10,
    marginLeft: 10,
  },
  followLabel: {
    color: "#d5d5d8",
    fontSize: 17,
  },
  followNumber: {
    color: "#f3f3f3",
    fontSize: 19,
    fontWeight: "800",
  },
  followRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  garageRow: {
    flexDirection: "row",
    gap: 12,
  },
  identity: {
    flex: 1,
    marginLeft: 10,
    marginTop: 28,
  },
  logoutButton: {
    backgroundColor: "#ff0000",
    borderRadius: 8,
    marginHorizontal: 150,
    marginVertical: 12,
    padding: 14,
  },
  logoutButtonText: {
    alignSelf: "center",
    color: "#f2f2f2",
    fontSize: 14,
    fontWeight: "800",
  },
  name: {
    color: "#f0f0f1",
    fontSize: 20,
    fontWeight: "800",
    marginRight: 10,
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: -44,
    paddingBottom: 14,
    paddingHorizontal: 30,
  },
  safeArea: {
    backgroundColor: "#17181a",
    flex: 1,
  },
  scrollContent: {
    backgroundColor: "#17181a",
    paddingBottom: 18,
  },
  settingsButton: {
    alignItems: "center",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 10,
    width: 34,
  },
  settingsText: {
    color: "#202124",
    fontSize: 25,
    fontWeight: "800",
  },
  username: {
    color: "#a9a9ae",
    fontSize: 12,
    marginBottom: 2,
  },
});