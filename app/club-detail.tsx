import { Ionicons } from "@expo/vector-icons";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserAvatar } from "@/components/UserAvatar";
import {
  getClub,
  joinClub,
  leaveClub,
  removeClubMember,
  updateClub,
} from "@/services/clubService";
import type { Club, ClubMember } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
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
} from "react-native";

type ClubDetailParams = {
  id?: string | string[];
};

const TEXT = {
  cancel: "Iptal",
  club: "Kulup",
  detailError: "Kulup detayi alinamadi.",
  edit: "Duzenle",
  editTitle: "Kulubu Duzenle",
  events: "Etkinlik",
  imageAdd: "Fotograf Ekle",
  imageChange: "Fotografi Degistir",
  join: "Katıl",
  joined: "Üyesin",
  leave: "Ayrıl",
  manager: "Yonetici",
  members: "Uyeler",
  noDescription: "Aciklama eklenmemis.",
  noMember: "Henuz uye yok.",
  permission: "Fotograf secmek icin galeri izni gerekli.",
  remove: "Cikar",
  removeConfirm: "Bu uyeyi kulupten cikarmak istiyor musunuz?",
  removeTitle: "Uyeyi Cikar",
  routes: "Rota",
  save: "Kaydet",
  title: "Kulup adi",
  updateError: "Kulup guncellenemedi.",
  validation: "Kulup adi girin.",
};

export default function ClubDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<ClubDetailParams>();
  const clubId = Number(readParam(params.id));
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUri, setEditImageUri] = useState<string | null>(null);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);

  const fetchClub = useCallback(async () => {
    if (!Number.isFinite(clubId)) {
      setLoading(false);
      return;
    }

    try {
      const data = await getClub(clubId);
      setClub(data);
    } catch (error) {
      console.log("Club detail fetch error:", error);
      Alert.alert("Hata", TEXT.detailError);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchClub();
    }, [fetchClub]),
  );

  const handleToggleMembership = async () => {
    if (!club || club.manager) return;

    try {
      setUpdating(true);
      if (club.member) {
        await leaveClub(club.id);
      } else {
        await joinClub(club.id);
      }

      const freshClub = await getClub(club.id);
      setClub(freshClub);
    } catch (error) {
      console.log("Club detail membership error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const openEditModal = () => {
    if (!club) return;

    setEditName(club.name);
    setEditDescription(club.description ?? "");
    setEditImageUri(null);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
  };

  const pickClubImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Uyari", TEXT.permission);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setEditImageUri(result.assets[0].uri);
    }
  };

  const handleUpdateClub = async () => {
    if (!club) return;

    if (!editName.trim()) {
      Alert.alert("Uyari", TEXT.validation);
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await updateClub(club.id, {
        name: editName.trim(),
        description: editDescription.trim(),
        imageUri: editImageUri,
      });
      setClub(updated);
      setEditModalVisible(false);
      setEditImageUri(null);
    } catch (error) {
      console.log("Club update error:", error);
      Alert.alert("Hata", TEXT.updateError);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRemoveMember = (member: ClubMember) => {
    if (!club || member.manager) return;

    Alert.alert(TEXT.removeTitle, TEXT.removeConfirm, [
      { text: TEXT.cancel, style: "cancel" },
      {
        text: TEXT.remove,
        style: "destructive",
        onPress: async () => {
          try {
            setRemovingMemberId(member.id);
            const updated = await removeClubMember(club.id, member.id);
            setClub(updated);
          } catch (error) {
            console.log("Club remove member error:", error);
          } finally {
            setRemovingMemberId(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  if (!club) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={TEXT.club} onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{TEXT.detailError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const members = club.members ?? [];
  const imageUrl = club.imageUrl ? getSecureImageUrl(club.imageUrl) : undefined;
  const editImagePreview = editImageUri || imageUrl;

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header
        title={TEXT.club}
        onBack={() => router.back()}
        onEdit={club.manager ? openEditModal : undefined}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} contentFit="cover" />
        ) : null}

        <View style={styles.heroBand}>
          <View style={styles.heroIcon}>
            <Ionicons name="people-outline" size={30} color="#c47a2d" />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.title}>{club.name}</Text>
            <Text style={styles.meta}>
              {club.memberCount} {TEXT.members.toLocaleLowerCase("tr-TR")}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>
          {club.description || TEXT.noDescription}
        </Text>

        <View style={styles.infoBand}>
          <InfoItem
            icon="person-outline"
            label={TEXT.manager}
            value={club.managerName || "-"}
          />
          <View style={styles.divider} />
          <InfoItem
            icon="calendar-outline"
            label={TEXT.events}
            value={String(club.eventCount)}
          />
          <View style={styles.divider} />
          <InfoItem
            icon="map-outline"
            label={TEXT.routes}
            value={String(club.routeCount)}
          />
        </View>

        {club.manager ? (
          <Pressable style={styles.editButton} onPress={openEditModal}>
            <Ionicons name="create-outline" size={16} color="#f4f4f6" />
            <Text style={styles.editButtonText}>{TEXT.edit}</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[
              styles.membershipButton,
              club.member ? styles.joinedButton : null,
            ]}
            onPress={handleToggleMembership}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#111213" />
            ) : (
              <>
                <Ionicons
                  name={club.member ? "checkmark" : "add"}
                  size={16}
                  color="#111213"
                />
                <Text style={styles.membershipText}>
                  {club.member ? TEXT.leave : TEXT.join}
                </Text>
              </>
            )}
          </Pressable>
        )}

        <View style={styles.memberSection}>
          <Text style={styles.sectionTitle}>{TEXT.members}</Text>
          {members.length > 0 ? (
            members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                canRemove={club.manager && !member.manager}
                removing={removingMemberId === member.id}
                onRemove={() => handleRemoveMember(member)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>{TEXT.noMember}</Text>
          )}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isEditModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{TEXT.editTitle}</Text>
              <TextInput
                style={styles.input}
                placeholder={TEXT.title}
                placeholderTextColor="#8f929b"
                value={editName}
                onChangeText={setEditName}
              />
              <TextInput
                multiline
                style={[styles.input, styles.textarea]}
                placeholder="Aciklama"
                placeholderTextColor="#8f929b"
                value={editDescription}
                onChangeText={setEditDescription}
              />
              {editImagePreview ? (
                <Image source={{ uri: editImagePreview }} style={styles.imagePreview} contentFit="cover" />
              ) : null}
              <Pressable style={styles.imagePickerButton} onPress={pickClubImage}>
                <Ionicons name="image-outline" size={17} color="#c47a2d" />
                <Text style={styles.imagePickerText}>
                  {editImagePreview ? TEXT.imageChange : TEXT.imageAdd}
                </Text>
              </Pressable>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeEditModal}
                  disabled={savingEdit}
                >
                  <Text style={styles.modalButtonText}>{TEXT.cancel}</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateClub}
                  disabled={savingEdit}
                >
                  {savingEdit ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.modalButtonText}>{TEXT.save}</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Header({
  onBack,
  onEdit,
  title,
}: {
  onBack: () => void;
  onEdit?: () => void;
  title: string;
}) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      {onEdit ? (
        <Pressable style={styles.iconButton} onPress={onEdit}>
          <Ionicons name="create-outline" size={20} color="#f4f4f6" />
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoItem}>
      <View style={styles.infoLabelRow}>
        <Ionicons name={icon} size={14} color="#8f929b" />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MemberRow({
  canRemove,
  member,
  onRemove,
  removing,
}: {
  canRemove: boolean;
  member: ClubMember;
  onRemove: () => void;
  removing: boolean;
}) {
  const router = useRouter();

  const openMemberProfile = () => {
    const cleanUsername = member.username?.replace(/^@/, "").trim();

    if (!cleanUsername) return;

    router.push({
      pathname: "/user-profile",
      params: { username: cleanUsername },
    });
  };

  return (
    <View style={styles.memberRow}>
      <Pressable style={styles.memberIdentityButton} onPress={openMemberProfile}>
        <UserAvatar
          imageUrl={member.profilePhoto}
          name={member.name}
          username={member.username}
          size={42}
          borderRadius={8}
        />
        <View style={styles.memberTextBlock}>
          <Text style={styles.memberName} numberOfLines={1}>
            {member.name || member.username}
          </Text>
          <Text style={styles.memberUsername} numberOfLines={1}>
            @{member.username}
          </Text>
        </View>
      </Pressable>
      {member.manager ? (
        <Text style={styles.managerBadge}>{TEXT.manager}</Text>
      ) : null}
      {canRemove ? (
        <Pressable
          style={styles.removeMemberButton}
          onPress={onRemove}
          disabled={removing}
        >
          {removing ? (
            <ActivityIndicator size="small" color="#ffb4a2" />
          ) : (
            <>
              <Ionicons name="person-remove-outline" size={16} color="#ffb4a2" />
              <Text style={styles.removeMemberText}>{TEXT.remove}</Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const styles = StyleSheet.create({
  cancelButton: {
    backgroundColor: "#363941",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  description: {
    color: "#cfd0d3",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  divider: {
    backgroundColor: "#30333a",
    width: 1,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  emptyText: {
    color: "#aeb1ba",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10,
  },
  editButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderColor: "#343842",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 44,
    justifyContent: "center",
    marginTop: 16,
  },
  editButtonText: {
    color: "#f4f4f6",
    fontSize: 13,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    color: "#f4f4f6",
    fontSize: 19,
    fontWeight: "900",
  },
  heroBand: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#2d3038",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 16,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  heroImage: {
    borderRadius: 8,
    height: 190,
    marginBottom: 14,
    width: "100%",
  },
  heroTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  infoBand: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#24262c",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    padding: 14,
  },
  infoItem: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  infoLabel: {
    color: "#8f929b",
    fontSize: 11,
    fontWeight: "900",
  },
  infoLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
  },
  infoValue: {
    color: "#e2e4e9",
    fontSize: 14,
    fontWeight: "900",
  },
  imagePickerButton: {
    alignItems: "center",
    backgroundColor: "#202126",
    borderColor: "#343842",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 44,
    justifyContent: "center",
    marginTop: 10,
  },
  imagePickerText: {
    color: "#f4f4f6",
    fontSize: 13,
    fontWeight: "900",
  },
  imagePreview: {
    borderRadius: 8,
    height: 140,
    marginTop: 10,
    width: "100%",
  },
  input: {
    backgroundColor: "#202126",
    borderRadius: 8,
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  joinedButton: {
    backgroundColor: "#6f747f",
  },
  managerBadge: {
    backgroundColor: "#302a22",
    borderRadius: 8,
    color: "#c47a2d",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  memberName: {
    color: "#f4f4f6",
    fontSize: 14,
    fontWeight: "900",
  },
  memberIdentityButton: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
    minWidth: 0,
  },
  memberRow: {
    alignItems: "center",
    backgroundColor: "#1f2227",
    borderColor: "#30333b",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
    padding: 10,
  },
  memberSection: {
    marginTop: 22,
  },
  memberTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  memberUsername: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  membershipButton: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 7,
    height: 44,
    justifyContent: "center",
    marginTop: 16,
  },
  membershipText: {
    color: "#111213",
    fontSize: 13,
    fontWeight: "900",
  },
  meta: {
    color: "#9da0a8",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
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
    fontWeight: "900",
  },
  modalContent: {
    backgroundColor: "#111213",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: "90%",
    padding: 18,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.56)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalTitle: {
    color: "#f4f4f6",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },
  removeMemberButton: {
    alignItems: "center",
    backgroundColor: "#302529",
    borderRadius: 8,
    flexDirection: "row",
    gap: 5,
    height: 34,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  removeMemberText: {
    color: "#ffb4a2",
    fontSize: 12,
    fontWeight: "900",
  },
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#c47a2d",
  },
  sectionTitle: {
    color: "#f4f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  title: {
    color: "#f4f4f6",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 29,
  },
  textarea: {
    height: 84,
    paddingTop: 13,
    textAlignVertical: "top",
  },
});
