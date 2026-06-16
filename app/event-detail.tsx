import { Ionicons } from "@expo/vector-icons";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { LoadingScreen } from "@/components/LoadingScreen";
import { UserAvatar } from "@/components/UserAvatar";
import {
  deleteEvent,
  getEvent,
  joinEvent,
  leaveEvent,
  updateEvent,
} from "@/services/eventService";
import type { AutoEvent, EventAttendee } from "@/types/domain";
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

type EventDetailParams = {
  id?: string | string[];
};

const TEXT = {
  attendee: "kat\u0131l\u0131mc\u0131",
  attendees: "Kay\u0131tl\u0131 Kullan\u0131c\u0131lar",
  creator: "Olu\u015fturan",
  delete: "Sil",
  deleteConfirm: "Bu etkinli\u011fi silmek istiyor musunuz?",
  deleteTitle: "Etkinli\u011fi Sil",
  detailError: "Etkinlik detay\u0131 al\u0131namad\u0131.",
  edit: "D\u00fczenle",
  editTitle: "Etkinli\u011fi D\u00fczenle",
  event: "Etkinlik",
  join: "Kat\u0131l",
  leave: "Ayr\u0131l",
  location: "Konum",
  imageAdd: "Foto\u011fraf Ekle",
  imageChange: "Foto\u011fraf\u0131 De\u011fi\u015ftir",
  noAttendee: "Hen\u00fcz kay\u0131tl\u0131 kullan\u0131c\u0131 yok.",
  permission: "Foto\u011fraf se\u00e7mek i\u00e7in galeri izni gerekli.",
  save: "Kaydet",
  eventTimePlaceholder: "Etkinlik saati se\u00e7",
  time: "Saat",
  title: "Ba\u015fl\u0131k",
  updateError: "Etkinlik g\u00fcncellenemedi.",
  validation: "Ba\u015fl\u0131k, konum, tarih ve saat girin.",
};

export default function EventDetail() {
  const router = useRouter();
  const params = useLocalSearchParams<EventDetailParams>();
  const eventId = Number(readParam(params.id));
  const [event, setEvent] = useState<AutoEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editImageUri, setEditImageUri] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!Number.isFinite(eventId)) {
      setLoading(false);
      return;
    }

    try {
      const data = await getEvent(eventId);
      setEvent(data);
    } catch (error) {
      console.log("Event detail fetch error:", error);
      Alert.alert("Hata", TEXT.detailError);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEvent();
    }, [fetchEvent]),
  );

  const handleToggleJoin = async () => {
    if (!event) return;

    try {
      setUpdating(true);
      const updated = event.joinedByMe
        ? await leaveEvent(event.id)
        : await joinEvent(event.id);
      const freshDetail = await getEvent(updated.id);
      setEvent(freshDetail);
    } catch (error) {
      console.log("Event detail join error:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = () => {
    if (!event) return;

    Alert.alert(TEXT.deleteTitle, TEXT.deleteConfirm, [
      { text: "\u0130ptal", style: "cancel" },
      {
        text: TEXT.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(event.id);
            router.back();
          } catch (error) {
            console.log("Event detail delete error:", error);
          }
        },
      },
    ]);
  };

  const openEditModal = () => {
    if (!event) return;

    setEditTitle(event.title);
    setEditDescription(event.description ?? "");
    setEditLocation(event.location);
    setEditDate(event.eventDate);
    setEditTime(event.eventTime ?? "");
    setEditImageUri(null);
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditImageUri(null);
  };

  const pickEventImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Uyar\u0131", TEXT.permission);
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

  const handleUpdateEvent = async () => {
    if (!event) return;

    if (
      !editTitle.trim() ||
      !editLocation.trim() ||
      !editDate.trim() ||
      !editTime.trim()
    ) {
      Alert.alert("Uyar\u0131", TEXT.validation);
      return;
    }

    try {
      setSavingEdit(true);
      const updated = await updateEvent(event.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: editLocation.trim(),
        eventDate: editDate,
        eventTime: editTime,
        imageUri: editImageUri,
      });
      setEvent(updated);
      setEditModalVisible(false);
    } catch (error) {
      console.log("Event update error:", error);
      Alert.alert("Hata", TEXT.updateError);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  if (!event) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title={TEXT.event} onBack={() => router.back()} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{TEXT.detailError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const imageUrl = event.imageUrl ? getSecureImageUrl(event.imageUrl) : undefined;
  const editImagePreview = editImageUri || imageUrl;
  const attendees = event.attendees ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={TEXT.event} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.heroImage} contentFit="cover" />
        ) : null}

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.meta}>
              {formatDisplayDateTime(event.eventDate, event.eventTime)} - {event.location}
            </Text>
          </View>
          <View style={styles.scopeBadge}>
            <Text style={styles.scopeBadgeText}>
              {event.clubName || "Bireysel"}
            </Text>
          </View>
        </View>

        {event.description ? (
          <Text style={styles.description}>{event.description}</Text>
        ) : null}

        <View style={styles.infoBand}>
          <InfoItem
            icon="people-outline"
            label={TEXT.attendee}
            value={String(event.attendeeCount)}
          />
          <View style={styles.divider} />
          <InfoItem
            icon="person-outline"
            label={TEXT.creator}
            value={event.creatorName || "-"}
          />
        </View>

        <View style={styles.actions}>
          {event.canManage ? (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={16} color="#ffb4a2" />
              <Text style={styles.deleteButtonText}>{TEXT.delete}</Text>
            </Pressable>
          ) : null}
          {event.createdByMe || event.canManage ? (
            <Pressable style={styles.editButton} onPress={openEditModal}>
              <Ionicons name="create-outline" size={16} color="#f4f4f6" />
              <Text style={styles.editButtonText}>{TEXT.edit}</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.joinButton, event.joinedByMe ? styles.joinedButton : null]}
            onPress={handleToggleJoin}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#111213" />
            ) : (
              <>
                <Ionicons
                  name={event.joinedByMe ? "checkmark" : "add"}
                  size={16}
                  color="#111213"
                />
                <Text style={styles.joinButtonText}>
                  {event.joinedByMe ? TEXT.leave : TEXT.join}
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.attendeeSection}>
          <Text style={styles.sectionTitle}>{TEXT.attendees}</Text>
          {attendees.length > 0 ? (
            attendees.map((attendee) => (
              <AttendeeRow key={attendee.id} attendee={attendee} />
            ))
          ) : (
            <Text style={styles.emptyText}>{TEXT.noAttendee}</Text>
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
                value={editTitle}
                onChangeText={setEditTitle}
              />
              <TextInput
                style={styles.input}
                placeholder={TEXT.location}
                placeholderTextColor="#8f929b"
                value={editLocation}
                onChangeText={setEditLocation}
              />
              <TextInput
                multiline
                style={[styles.input, styles.textarea]}
                placeholder="A\u00e7\u0131klama"
                placeholderTextColor="#8f929b"
                value={editDescription}
                onChangeText={setEditDescription}
              />
              <DatePickerField
                label="Tarih"
                value={editDate}
                onChange={setEditDate}
                placeholder="Etkinlik tarihi se\u00e7"
                iosDisplay="compact"
              />
              <DatePickerField
                label={TEXT.time}
                value={editTime}
                onChange={setEditTime}
                mode="time"
                placeholder={TEXT.eventTimePlaceholder}
                iosDisplay="compact"
              />
              {editImagePreview ? (
                <Image source={{ uri: editImagePreview }} style={styles.imagePreview} contentFit="cover" />
              ) : null}
              <Pressable style={styles.imagePickerButton} onPress={pickEventImage}>
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
                  <Text style={styles.modalButtonText}>{"\u0130ptal"}</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleUpdateEvent}
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

function Header({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <View style={styles.header}>
      <Pressable style={styles.iconButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerSpacer} />
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

function AttendeeRow({ attendee }: { attendee: EventAttendee }) {
  const router = useRouter();

  const openAttendeeProfile = () => {
    const cleanUsername = attendee.username?.replace(/^@/, "").trim();

    if (!cleanUsername) return;

    router.push({
      pathname: "/user-profile",
      params: { username: cleanUsername },
    });
  };

  return (
    <Pressable style={styles.attendeeRow} onPress={openAttendeeProfile}>
      <UserAvatar
        imageUrl={attendee.profilePhoto}
        name={attendee.name}
        username={attendee.username}
        size={42}
        borderRadius={8}
      />
      <View style={styles.attendeeTextBlock}>
        <Text style={styles.attendeeName} numberOfLines={1}>
          {attendee.name || attendee.username}
        </Text>
        <Text style={styles.attendeeUsername} numberOfLines={1}>
          @{attendee.username}
        </Text>
      </View>
    </Pressable>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function formatDisplayTime(value?: string | null) {
  if (!value) return "";

  const [hour, minute] = value.split(":");

  return hour && minute ? `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}` : value;
}

function formatDisplayDateTime(date: string, time?: string | null) {
  const displayTime = formatDisplayTime(time);

  return displayTime ? `${formatDisplayDate(date)} ${displayTime}` : formatDisplayDate(date);
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  attendeeName: {
    color: "#f4f4f6",
    fontSize: 14,
    fontWeight: "900",
  },
  attendeeRow: {
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
  attendeeSection: {
    marginTop: 22,
  },
  attendeeTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  attendeeUsername: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  cancelButton: {
    backgroundColor: "#363941",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#302529",
    borderRadius: 8,
    flexDirection: "row",
    gap: 7,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  deleteButtonText: {
    color: "#ffb4a2",
    fontSize: 13,
    fontWeight: "900",
  },
  description: {
    color: "#cfd0d3",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
    marginTop: 12,
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
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
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
  heroImage: {
    borderRadius: 8,
    height: 190,
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40,
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
  joinButton: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    height: 42,
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  joinedButton: {
    backgroundColor: "#6f747f",
  },
  joinButtonText: {
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
  safeArea: {
    backgroundColor: "#202124",
    flex: 1,
  },
  saveButton: {
    backgroundColor: "#c47a2d",
  },
  scopeBadge: {
    backgroundColor: "#2b2d32",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  scopeBadgeText: {
    color: "#c47a2d",
    fontSize: 11,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#f4f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  title: {
    color: "#f4f4f6",
    fontSize: 23,
    fontWeight: "900",
    lineHeight: 28,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  textarea: {
    height: 84,
    paddingTop: 13,
    textAlignVertical: "top",
  },
});
