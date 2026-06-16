
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserAvatar } from "@/components/UserAvatar";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { GarageVehicleCard } from "@/components/profile/GarageVehicleCard";
import { ProfilePostRow } from "@/components/profile/ProfilePostRow";
import { ProfileRouteRow } from "@/components/profile/ProfileRouteRow";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { VehicleEditModal } from "@/components/profile/VehicleEditModal";
import { logout } from "@/services/authService";
import { createPost, deletePost, updatePost } from "@/services/postService";
import { getProfile } from "@/services/profileService";
import { createRoute, deleteRoute, updateRoute } from "@/services/routeService";
import { uploadImageToServer } from "@/services/userProfileService";
import { addVehicleExpense, updateVehicle } from "@/services/vehicleService";
import type {
  ProfilePost,
  UserProfile,
  UserRoute,
  Vehicle,
} from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { buildRouteMapParams } from "@/utils/routeMapParams";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import MapView, {
  Marker,
  type LatLng,
  type MapPressEvent,
  type Region,
} from "react-native-maps";

const coverImage = require("../../assets/images/21.jpg");
const garageOne = require("../../assets/images/5.jpg");
const garageTwo = require("../../assets/images/6.jpg");
const postImage = require("../../assets/images/33.jpg");

const DEFAULT_ROUTE_REGION: Region = {
  latitude: 41.0082,
  latitudeDelta: 0.25,
  longitude: 28.9784,
  longitudeDelta: 0.25,
};

type RoutePointMode = "start" | "end";
type ConnectionType = "followers" | "following";

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
  const [editInspectionAppointmentDate, setEditInspectionAppointmentDate] =
    useState("");
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [expenseCategory, setExpenseCategory] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPostModalVisible, setPostModalVisible] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [postContent, setPostContent] = useState("");
  const [postImageUri, setPostImageUri] = useState<string | null>(null);
  const [postExistingPhoto, setPostExistingPhoto] = useState<string | null>(
    null,
  );
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isRouteModalVisible, setRouteModalVisible] = useState(false);
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [routeTitle, setRouteTitle] = useState("");
  const [routeStartPoint, setRouteStartPoint] = useState("");
  const [routeEndPoint, setRouteEndPoint] = useState("");
  const [routeStartCoordinate, setRouteStartCoordinate] =
    useState<LatLng | null>(null);
  const [routeEndCoordinate, setRouteEndCoordinate] = useState<LatLng | null>(
    null,
  );
  const [routePickerMode, setRoutePickerMode] =
    useState<RoutePointMode>("start");
  const [routePickerCoordinate, setRoutePickerCoordinate] =
    useState<LatLng | null>(null);
  const [routePickerLabel, setRoutePickerLabel] = useState("");
  const [routePickerRegion, setRoutePickerRegion] =
    useState<Region>(DEFAULT_ROUTE_REGION);
  const [isRoutePickerVisible, setRoutePickerVisible] = useState(false);
  const [routeDistance, setRouteDistance] = useState("");
  const [routeDuration, setRouteDuration] = useState("");
  const [routeDate, setRouteDate] = useState("");
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  const fetchProfileData = async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }

    try {
      const profileData = await getProfile();
      setProfile(profileData);
    } catch (error) {
      console.log("Profile fetch error:", error);
      Alert.alert("Hata", "Profil bilgileri alınamadı.");
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfileData(true);
    }, []),
  );

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
    Alert.alert(
      "Profil Fotoğrafı Seç",
      "Bir seçenek belirleyin.",
      [
        {
          text: "Fotoğraf Çek",
          onPress: () => handleImageSelection(false, true),
        },
        {
          text: "Galeriden Seç",
          onPress: () => handleImageSelection(false, false),
        },
        { text: "İptal", style: "cancel" },
      ],
    );
  };

  const handleCoverPhotoPress = () => {
    Alert.alert(
      "Kapak Fotoğrafı Seç",
      "Bir seçenek belirleyin.",
      [
        {
          text: "Fotoğraf Çek",
          onPress: () => handleImageSelection(true, true),
        },
        {
          text: "Galeriden Seç",
          onPress: () => handleImageSelection(true, false),
        },
        { text: "İptal", style: "cancel" },
      ],
    );
  };

  const openConnections = (type: ConnectionType) => {
    if (!profile?.username) return;

    router.push({
      pathname: "/user-connections",
      params: {
        type,
        username: profile.username.replace(/^@/, "").trim(),
      },
    });
  };

  const openEditVehicleModal = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    setEditBrand(vehicle.brand);
    setEditModel(vehicle.model);
    setEditYear(vehicle.year.toString());
    setEditLicensePlate(vehicle.licensePlate || "");
    setEditInspectionAppointmentDate(vehicle.inspectionAppointmentDate || "");
    setEditImageUri(null);
    setExpenseCategory("");
    setExpenseAmount("");
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

  const pickPostImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "Hata",
        "Fotoğraf galerisine erişim izni gerekiyor.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6,
    });

    if (!result.canceled) {
      setPostImageUri(result.assets[0].uri);
    }
  };

  const openCreatePostModal = () => {
    setEditingPostId(null);
    setPostContent("");
    setPostImageUri(null);
    setPostExistingPhoto(null);
    setPostModalVisible(true);
  };

  const openEditPostModal = (post: ProfilePost) => {
    setEditingPostId(post.id);
    setPostContent(post.content || "");
    setPostImageUri(null);
    setPostExistingPhoto(post.postPhoto);
    setPostModalVisible(true);
  };

  const closePostModal = () => {
    setPostModalVisible(false);
    setEditingPostId(null);
    setPostContent("");
    setPostImageUri(null);
    setPostExistingPhoto(null);
  };

  const openRoutePicker = (mode: RoutePointMode) => {
    Keyboard.dismiss();
    const selectedCoordinate =
      mode === "start" ? routeStartCoordinate : routeEndCoordinate;
    const selectedLabel = mode === "start" ? routeStartPoint : routeEndPoint;

    setRoutePickerMode(mode);
    setRoutePickerCoordinate(selectedCoordinate);
    setRoutePickerLabel(selectedLabel);
    setRoutePickerRegion(
      selectedCoordinate
        ? {
            latitude: selectedCoordinate.latitude,
            latitudeDelta: 0.04,
            longitude: selectedCoordinate.longitude,
            longitudeDelta: 0.04,
          }
        : DEFAULT_ROUTE_REGION,
    );
    setRouteModalVisible(false);
    setRoutePickerVisible(true);
  };

  const handleRouteMapPress = async (event: MapPressEvent) => {
    const coordinate = event.nativeEvent.coordinate;
    const fallbackLabel = formatCoordinateLabel(coordinate);

    setRoutePickerCoordinate(coordinate);
    setRoutePickerLabel(fallbackLabel);

    try {
      const [address] = await Location.reverseGeocodeAsync(coordinate);
      if (address) {
        setRoutePickerLabel(formatAddress(address, fallbackLabel));
      }
    } catch (error) {
      console.log("Route reverse geocode error:", error);
    }
  };

  const confirmRoutePoint = () => {
    if (!routePickerCoordinate) {
      Alert.alert("Uyarı", "Haritadan bir nokta seçin.");
      return;
    }

    const label =
      routePickerLabel || formatCoordinateLabel(routePickerCoordinate);
    const nextStartCoordinate =
      routePickerMode === "start"
        ? routePickerCoordinate
        : routeStartCoordinate;
    const nextEndCoordinate =
      routePickerMode === "end" ? routePickerCoordinate : routeEndCoordinate;

    if (routePickerMode === "start") {
      setRouteStartCoordinate(routePickerCoordinate);
      setRouteStartPoint(label);
    } else {
      setRouteEndCoordinate(routePickerCoordinate);
      setRouteEndPoint(label);
    }

    if (nextStartCoordinate && nextEndCoordinate) {
      setRouteDistance(
        formatDistance(
          calculateDistanceKm(nextStartCoordinate, nextEndCoordinate),
        ),
      );
    }

    closeRoutePicker(true);
  };

  const closeRoutePicker = (returnToRouteModal = true) => {
    setRoutePickerVisible(false);
    if (returnToRouteModal) {
      setTimeout(() => {
        setRouteModalVisible(true);
      }, 220);
    }
  };

  const resetRouteForm = () => {
    setEditingRouteId(null);
    setRouteTitle("");
    setRouteStartPoint("");
    setRouteEndPoint("");
    setRouteStartCoordinate(null);
    setRouteEndCoordinate(null);
    setRoutePickerCoordinate(null);
    setRoutePickerLabel("");
    setRouteDistance("");
    setRouteDuration("");
    setRouteDate("");
  };

  const openCreateRouteModal = () => {
    resetRouteForm();
    setRouteModalVisible(true);
  };

  const openEditRouteModal = (route: UserRoute) => {
    setEditingRouteId(route.id);
    setRouteTitle(route.title);
    setRouteStartPoint(route.startPoint || "");
    setRouteEndPoint(route.endPoint || "");
    setRouteStartCoordinate(
      route.startLatitude !== null &&
        route.startLatitude !== undefined &&
        route.startLongitude !== null &&
        route.startLongitude !== undefined
        ? {
            latitude: route.startLatitude,
            longitude: route.startLongitude,
          }
        : null,
    );
    setRouteEndCoordinate(
      route.endLatitude !== null &&
        route.endLatitude !== undefined &&
        route.endLongitude !== null &&
        route.endLongitude !== undefined
        ? {
            latitude: route.endLatitude,
            longitude: route.endLongitude,
          }
        : null,
    );
    setRouteDistance(String(route.distance));
    setRouteDuration(String(route.duration));
    setRouteDate(route.routeDate || "");
    setRoutePickerCoordinate(null);
    setRoutePickerLabel("");
    setRouteModalVisible(true);
  };

  const closeRouteModal = () => {
    setRouteModalVisible(false);
    setRoutePickerVisible(false);
    resetRouteForm();
  };

  const handleSavePost = async () => {
    if (!postContent.trim() && !postImageUri && !postExistingPhoto) {
      Alert.alert("Uyarı", "Bir metin ya da fotoğraf ekleyin.");
      return;
    }

    setIsCreatingPost(true);
    try {
      const isEditingPost = editingPostId !== null;
      if (editingPostId) {
        await updatePost(editingPostId, {
          content: postContent,
          imageUri: postImageUri,
        });
      } else {
        await createPost({
          content: postContent,
          imageUri: postImageUri,
        });
      }
      closePostModal();
      await fetchProfileData();
      Alert.alert(
        "Başarılı",
        isEditingPost
          ? "Gönderi güncellendi."
          : "Gönderi paylaşıldı.",
      );
    } catch (error) {
      console.error("Post save error:", error);
      Alert.alert("Hata", "Gönderi kaydedilemedi.");
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeletePost = (postId: number) => {
    Alert.alert(
      "Gönderiyi Sil",
      "Bu gönderiyi silmek istiyor musunuz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePost(postId);
              await fetchProfileData();
            } catch (error) {
              console.error("Post delete error:", error);
              Alert.alert("Hata", "Gönderi silinemedi.");
            }
          },
        },
      ],
    );
  };

  const handleSaveRoute = async () => {
    const parsedDistance = Number(routeDistance.replace(",", "."));
    const parsedDuration = parseInt(routeDuration, 10);

    if (
      !routeTitle.trim() ||
      !routeStartCoordinate ||
      !routeEndCoordinate ||
      Number.isNaN(parsedDistance) ||
      Number.isNaN(parsedDuration)
    ) {
      Alert.alert(
        "Uyarı",
        "Rota adı, başlangıç, bitiş, mesafe ve süre girin.",
      );
      return;
    }

    setIsCreatingRoute(true);
    try {
      const payload = {
        title: routeTitle.trim(),
        startPoint: routeStartPoint.trim(),
        endPoint: routeEndPoint.trim(),
        startLatitude: routeStartCoordinate.latitude,
        startLongitude: routeStartCoordinate.longitude,
        endLatitude: routeEndCoordinate.latitude,
        endLongitude: routeEndCoordinate.longitude,
        distance: parsedDistance,
        duration: parsedDuration,
        routeDate: routeDate.trim() || undefined,
      };

      const isEditingRoute = editingRouteId !== null;

      if (editingRouteId) {
        await updateRoute(editingRouteId, payload);
      } else {
        await createRoute(payload);
      }

      closeRouteModal();
      await fetchProfileData();
      Alert.alert(
        "Başarılı",
        isEditingRoute ? "Rota güncellendi." : "Rota oluşturuldu.",
      );
    } catch (error) {
      console.error("Route save error:", error);
      Alert.alert("Hata", "Rota kaydedilemedi.");
    } finally {
      setIsCreatingRoute(false);
    }
  };

  const handleDeleteRoute = (routeId: number) => {
    Alert.alert("Rotayı Sil", "Bu rotayı silmek istiyor musunuz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteRoute(routeId);
            await fetchProfileData();
          } catch (error) {
            console.error("Route delete error:", error);
            Alert.alert("Hata", "Rota silinemedi.");
          }
        },
      },
    ]);
  };

  const handleAddExpense = async () => {
    if (!editingVehicleId) return;

    const parsedAmount = Number(expenseAmount.replace(",", "."));
    if (
      !expenseCategory.trim() ||
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      Alert.alert(
        "Uyarı",
        "Masraf türü ve geçerli tutar girin.",
      );
      return;
    }

    setIsAddingExpense(true);
    try {
      await addVehicleExpense(editingVehicleId, {
        category: expenseCategory.trim(),
        amount: parsedAmount,
      });
      setExpenseCategory("");
      setExpenseAmount("");
      await fetchProfileData();
      Alert.alert("Başarılı", "Masraf eklendi.");
    } catch (error) {
      console.error("Expense add error:", error);
      Alert.alert("Hata", "Masraf eklenemedi.");
    } finally {
      setIsAddingExpense(false);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!editingVehicleId) return;

    const parsedYear = parseInt(editYear, 10);
    if (!editBrand.trim() || !editModel.trim() || Number.isNaN(parsedYear)) {
      Alert.alert(
        "Uyarı",
        "Lütfen marka, model ve yıl alanlarını doldurun.",
      );
      return;
    }

    setIsUpdating(true);
    try {
      const updatedVehicle = await updateVehicle(editingVehicleId, {
        brand: editBrand.trim(),
        model: editModel.trim(),
        year: parsedYear,
        licensePlate: editLicensePlate.trim(),
        inspectionAppointmentDate: editInspectionAppointmentDate.trim(),
        imageUri: editImageUri,
      });

      setProfile((prev) => {
        if (!prev) return prev;
        const updatedGarage = prev.garage.map((vehicle) =>
          vehicle.id === editingVehicleId ? updatedVehicle : vehicle,
        );
        return { ...prev, garage: updatedGarage };
      });

      Alert.alert(
        "Başarılı",
        "Araç bilgileri güncellendi!",
      );
      setEditModalVisible(false);
    } catch (error) {
      console.error("Vehicle update error:", error);
      Alert.alert(
        "Hata",
        "Araç güncellenirken bir sorun oluştu.",
      );
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
        <Text style={styles.emptyScreenText}>Veri bulunamadı.</Text>
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
          <Pressable
            style={styles.coverPressable}
            onPress={handleCoverPhotoPress}
          >
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
            <Text style={styles.settingsText}>{"⚙"}</Text>
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Pressable
              onPress={handleProfilePhotoPress}
              style={styles.avatarPressable}
            >
              <UserAvatar
                imageUrl={profile.profilePhoto}
                name={`${profile.name} ${profile.lastName ?? ""}`}
                username={profile.username}
                size={80}
                borderRadius={8}
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
                <Text style={styles.editText}>{"Profili Düzenle"}</Text>
              </Pressable>
            </View>

            <Text style={styles.username}>{profile.username}</Text>

            <View style={styles.followRow}>
              <Pressable
                style={styles.followMetric}
                onPress={() => openConnections("followers")}
              >
                <Text style={styles.followNumber}>{profile.followerCount}</Text>
                <Text style={styles.followLabel}>{" Takipçi"}</Text>
              </Pressable>
              <Pressable
                style={styles.followMetric}
                onPress={() => openConnections("following")}
              >
                <Text style={styles.followNumber}>
                  {profile.followingCount}
                </Text>
                <Text style={styles.followLabel}> Takip Edilen</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <ProfileSection title={"Garajım"}>
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
                {"Garajınızda henüz araç yok."}
              </Text>
            )}
          </View>
        </ProfileSection>

        <ProfileSection title={"Gönderiler"}>
          <Pressable
            style={styles.sectionActionButton}
            onPress={openCreatePostModal}
          >
            <Text style={styles.sectionActionText}>
              {"Gönderi Oluştur"}
            </Text>
          </Pressable>

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
                onEdit={() => openEditPostModal(post)}
                onDelete={() => handleDeletePost(post.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {"Henüz bir gönderi paylaşmadınız."}
            </Text>
          )}
        </ProfileSection>

        <ProfileSection title="Rotalar">
          <Pressable
            style={styles.sectionActionButton}
            onPress={openCreateRouteModal}
          >
            <Text style={styles.sectionActionText}>{"Rota Oluştur"}</Text>
          </Pressable>

          {profile.routes.length > 0 ? (
            profile.routes.map((route) => (
              <ProfileRouteRow
                key={route.id}
                title={route.title}
                detail={route.detail}
                duration={route.duration}
                distance={route.distance}
                routeDate={route.routeDate}
                onPress={() =>
                  router.push({
                    pathname: "/route-map",
                    params: buildRouteMapParams(route),
                  })
                }
                onEdit={() => openEditRouteModal(route)}
                onDelete={() => handleDeleteRoute(route.id)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>
              {"Henüz bir rota oluşturmadınız."}
            </Text>
          )}
        </ProfileSection>

        <Pressable
          style={styles.logoutButton}
          onPress={() => logout().then(() => router.push("/"))}
        >
          <Text style={styles.logoutButtonText}>
            {"Çıkış Yap"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={isPostModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={24}
          >
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingPostId
                    ? "Gönderiyi Düzenle"
                    : "Gönderi Oluştur"}
                </Text>

                <TextInput
                  style={[styles.modalInput, styles.postContentInput]}
                  multiline
                  placeholder="Ne paylaşmak istersin?"
                  placeholderTextColor="#999"
                  value={postContent}
                  onChangeText={setPostContent}
                />

                {postImageUri || postExistingPhoto ? (
                  <Image
                    source={
                      postImageUri
                        ? { uri: postImageUri }
                        : { uri: getSecureImageUrl(postExistingPhoto as string) }
                    }
                    style={styles.postPreviewImage}
                    contentFit="cover"
                  />
                ) : null}

                <Pressable
                  style={styles.imagePickerButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    pickPostImage();
                  }}
                >
                  <Text style={styles.imagePickerButtonText}>
                    {postImageUri
                      ? "Fotoğrafı Değiştir"
                      : "Fotoğraf Ekle"}
                  </Text>
                </Pressable>

                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      closePostModal();
                    }}
                    disabled={isCreatingPost}
                  >
                    <Text style={styles.modalButtonText}>{"İptal"}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleSavePost();
                    }}
                    disabled={isCreatingPost}
                  >
                    {isCreatingPost ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonText}>
                        {editingPostId ? "Kaydet" : "Paylaş"}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal visible={isRouteModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <KeyboardAvoidingView
            style={styles.modalOverlay}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={24}
          >
            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
            >
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingRouteId
                    ? "Rotayı Düzenle"
                    : "Rota Oluştur"}
                </Text>

                <TextInput
                  style={styles.modalInput}
                  placeholder="Rota adı"
                  placeholderTextColor="#999"
                  value={routeTitle}
                  onChangeText={setRouteTitle}
                />
                <RoutePointButton
                  label="Başlangıç"
                  value={routeStartPoint}
                  onPress={() => openRoutePicker("start")}
                />
                <RoutePointButton
                  label="Bitiş"
                  value={routeEndPoint}
                  onPress={() => openRoutePicker("end")}
                />
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  placeholder="Mesafe (km)"
                  placeholderTextColor="#999"
                  value={routeDistance}
                  onChangeText={setRouteDistance}
                />
                <TextInput
                  style={styles.modalInput}
                  keyboardType="numeric"
                  placeholder="Süre (saat)"
                  placeholderTextColor="#999"
                  value={routeDuration}
                  onChangeText={setRouteDuration}
                />
                <DatePickerField
                  label="Rota Tarihi"
                  value={routeDate}
                  onChange={setRouteDate}
                  optional
                  placeholder="Rota tarihi seç"
                  iosDisplay="compact"
                />

                <View style={styles.modalActions}>
                  <Pressable
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      closeRouteModal();
                    }}
                    disabled={isCreatingRoute}
                  >
                    <Text style={styles.modalButtonText}>{"İptal"}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={() => {
                      Keyboard.dismiss();
                      handleSaveRoute();
                    }}
                    disabled={isCreatingRoute}
                  >
                    {isCreatingRoute ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.modalButtonText}>{"Kaydet"}</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </TouchableWithoutFeedback>
            </ScrollView>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={isRoutePickerVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => closeRoutePicker(true)}
      >
        <View style={styles.mapPickerScreen}>
          <MapView
            style={styles.mapPicker}
            initialRegion={routePickerRegion}
            region={routePickerRegion}
            onRegionChangeComplete={setRoutePickerRegion}
            onPress={handleRouteMapPress}
          >
            {routePickerCoordinate ? (
              <Marker
                coordinate={routePickerCoordinate}
                title={
                  routePickerMode === "start"
                    ? "Başlangıç"
                    : "Bitiş"
                }
                description={routePickerLabel}
              />
            ) : null}
          </MapView>

          <SafeAreaView
            pointerEvents="box-none"
            style={styles.mapPickerOverlay}
          >
            <View style={styles.mapPickerHeader}>
              <Pressable
                style={styles.mapPickerIconButton}
                onPress={() => closeRoutePicker(true)}
              >
                <Text style={styles.mapPickerIconText}>{"<"}</Text>
              </Pressable>
              <View style={styles.mapPickerTitleWrap}>
                <Text style={styles.mapPickerTitle}>
                  {routePickerMode === "start"
                    ? "Başlangıç Seç"
                    : "Bitiş Seç"}
                </Text>
                <Text style={styles.mapPickerSubtitle} numberOfLines={1}>
                  {routePickerLabel || "Nokta seçilmedi"}
                </Text>
              </View>
            </View>

            <View style={styles.mapPickerFooter}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => closeRoutePicker(true)}
              >
                <Text style={styles.modalButtonText}>{"İptal"}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={confirmRoutePoint}
              >
                <Text style={styles.modalButtonText}>
                  {"Noktayı Seç"}
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <VehicleEditModal
        visible={isEditModalVisible}
        brand={editBrand}
        model={editModel}
        year={editYear}
        licensePlate={editLicensePlate}
        inspectionAppointmentDate={editInspectionAppointmentDate}
        imageUri={editImageUri}
        isUpdating={isUpdating}
        expenseCategory={expenseCategory}
        expenseAmount={expenseAmount}
        isAddingExpense={isAddingExpense}
        onBrandChange={setEditBrand}
        onModelChange={setEditModel}
        onYearChange={setEditYear}
        onLicensePlateChange={setEditLicensePlate}
        onInspectionAppointmentDateChange={setEditInspectionAppointmentDate}
        onExpenseCategoryChange={setExpenseCategory}
        onExpenseAmountChange={setExpenseAmount}
        onPickImage={pickVehicleImage}
        onSave={handleUpdateVehicle}
        onAddExpense={handleAddExpense}
        onClose={() => setEditModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function RoutePointButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.routePointButton} onPress={onPress}>
      <Text style={styles.routePointLabel}>{label}</Text>
      <Text
        style={[styles.routePointValue, !value && styles.routePointPlaceholder]}
        numberOfLines={2}
      >
        {value || "Haritadan seç"}
      </Text>
    </Pressable>
  );
}

function formatAddress(
  address: Location.LocationGeocodedAddress,
  fallback: string,
) {
  const parts = [
    address.name,
    address.street,
    address.district,
    address.city,
    address.region,
  ].filter(Boolean) as string[];
  const uniqueParts = [...new Set(parts)];

  return uniqueParts.length > 0 ? uniqueParts.join(", ") : fallback;
}

function formatCoordinateLabel(coordinate: LatLng) {
  return `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
}

function calculateDistanceKm(start: LatLng, end: LatLng) {
  const earthRadiusKm = 6371;
  const latitudeDelta = degreesToRadians(end.latitude - start.latitude);
  const longitudeDelta = degreesToRadians(end.longitude - start.longitude);
  const startLatitude = degreesToRadians(start.latitude);
  const endLatitude = degreesToRadians(end.latitude);
  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(value: number) {
  return value.toFixed(value >= 10 ? 1 : 2);
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
  avatarPressable: {
    height: "100%",
    width: "100%",
  },
  cancelButton: {
    backgroundColor: "#55575f",
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
  followMetric: {
    alignItems: "center",
    flexDirection: "row",
  },
  followNumber: {
    color: "#f3f3f3",
    fontSize: 19,
    fontWeight: "800",
  },
  followRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  imagePickerButton: {
    alignItems: "center",
    backgroundColor: "#3a3b40",
    borderRadius: 8,
    marginTop: 12,
    paddingVertical: 12,
  },
  imagePickerButtonText: {
    color: "#c47a2d",
    fontSize: 14,
    fontWeight: "800",
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
  mapPicker: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  mapPickerFooter: {
    alignSelf: "center",
    backgroundColor: "rgba(23, 24, 26, 0.92)",
    borderRadius: 8,
    bottom: 26,
    flexDirection: "row",
    gap: 10,
    padding: 10,
    position: "absolute",
    width: "88%",
  },
  mapPickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  mapPickerIconButton: {
    alignItems: "center",
    backgroundColor: "rgba(23, 24, 26, 0.86)",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  mapPickerIconText: {
    color: "#f4f4f6",
    fontSize: 24,
    fontWeight: "900",
  },
  mapPickerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPickerScreen: {
    backgroundColor: "#202124",
    flex: 1,
  },
  mapPickerSubtitle: {
    color: "#c7c7cc",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  mapPickerTitle: {
    color: "#f4f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  mapPickerTitleWrap: {
    backgroundColor: "rgba(23, 24, 26, 0.86)",
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  modalButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    height: 44,
    justifyContent: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  modalContent: {
    backgroundColor: "#2a2b30",
    borderRadius: 10,
    padding: 18,
    width: "86%",
  },
  modalInput: {
    backgroundColor: "#17181a",
    borderColor: "#44464d",
    borderRadius: 8,
    borderWidth: 1,
    color: "#fff",
    fontSize: 14,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.72)",
    flex: 1,
    justifyContent: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  modalTitle: {
    color: "#f2f2f2",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
    textAlign: "center",
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
  postContentInput: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  postPreviewImage: {
    borderRadius: 8,
    height: 150,
    width: "100%",
  },
  routePointButton: {
    backgroundColor: "#17181a",
    borderColor: "#44464d",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  routePointLabel: {
    color: "#a9a9ae",
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 4,
  },
  routePointPlaceholder: {
    color: "#999",
  },
  routePointValue: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 18,
  },
  safeArea: {
    backgroundColor: "#17181a",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#a8732b",
  },
  scrollContent: {
    backgroundColor: "#17181a",
    paddingBottom: 18,
  },
  sectionActionButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#a8732b",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sectionActionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
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
