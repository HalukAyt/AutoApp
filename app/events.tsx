import { Ionicons } from "@expo/vector-icons";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  createEvent,
  deleteEvent,
  getEvents,
  joinEvent,
  leaveEvent,
} from "@/services/eventService";
import type { AutoEvent } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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

const TEXT = {
  attendee: "kat\u0131l\u0131mc\u0131",
  cancel: "\u0130ptal",
  create: "Etkinlik Olu\u015ftur",
  createError: "Etkinlik kaydedilemedi.",
  date: "Tarih",
  delete: "Sil",
  deleteConfirm: "Bu etkinli\u011fi silmek istiyor musunuz?",
  deleteTitle: "Etkinli\u011fi Sil",
  description: "A\u00e7\u0131klama",
  empty: "Hen\u00fcz etkinlik yok.",
  eventDatePlaceholder: "Etkinlik tarihi se\u00e7",
  events: "Etkinlikler",
  imageAdd: "Foto\u011fraf Ekle",
  imageChange: "Foto\u011fraf\u0131 De\u011fi\u015ftir",
  join: "Kat\u0131l",
  joined: "Kat\u0131ld\u0131n",
  leave: "Ayr\u0131l",
  location: "Konum",
  myEvent: "Bireysel",
  permission: "Foto\u011fraf se\u00e7mek i\u00e7in galeri izni gerekli.",
  save: "Kaydet",
  title: "Ba\u015fl\u0131k",
  validation: "Ba\u015fl\u0131k, konum ve tarih girin.",
};

export default function EventsScreen() {
  const router = useRouter();
  const [events, setEvents] = useState<AutoEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [updatingEventId, setUpdatingEventId] = useState<number | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.log("Events fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchEvents();
    }, [fetchEvents]),
  );

  const upcomingEvents = useMemo(
    () => [...events].sort((a, b) => a.eventDate.localeCompare(b.eventDate)),
    [events],
  );

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setEventDate("");
    setImageUri(null);
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleCreateEvent = async () => {
    if (!title.trim() || !location.trim() || !eventDate.trim()) {
      Alert.alert("Uyar\u0131", TEXT.validation);
      return;
    }

    try {
      setSaving(true);
      await createEvent({
        imageUri: imageUri || undefined,
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        eventDate,
      });
      closeModal();
      await fetchEvents();
    } catch (error) {
      console.log("Event create error:", error);
      Alert.alert("Hata", TEXT.createError);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleJoin = async (event: AutoEvent) => {
    try {
      setUpdatingEventId(event.id);
      const updated = event.joinedByMe
        ? await leaveEvent(event.id)
        : await joinEvent(event.id);
      setEvents((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (error) {
      console.log("Event join error:", error);
    } finally {
      setUpdatingEventId(null);
    }
  };

  const handleDeleteEvent = (eventId: number) => {
    Alert.alert(TEXT.deleteTitle, TEXT.deleteConfirm, [
      { text: TEXT.cancel, style: "cancel" },
      {
        text: TEXT.delete,
        style: "destructive",
        onPress: async () => {
          try {
            await deleteEvent(eventId);
            await fetchEvents();
          } catch (error) {
            console.log("Event delete error:", error);
          }
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#f4f4f6" />
        </Pressable>
        <Text style={styles.headerTitle}>{TEXT.events}</Text>
        <Pressable style={styles.iconButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={22} color="#f4f4f6" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.createCard} onPress={() => setModalVisible(true)}>
          <View style={styles.createIcon}>
            <Ionicons name="calendar-outline" size={24} color="#c47a2d" />
          </View>
          <View style={styles.createTextBlock}>
            <Text style={styles.createTitle}>{TEXT.create}</Text>
            <Text style={styles.createText}>{"Bireysel bulu\u015fma veya s\u00fcr\u00fc\u015f etkinli\u011fi a\u00e7"}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#8f929b" />
        </Pressable>

        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              updating={updatingEventId === event.id}
              onDelete={() => handleDeleteEvent(event.id)}
              onToggleJoin={() => handleToggleJoin(event)}
            />
          ))
        ) : (
          <Text style={styles.emptyText}>{TEXT.empty}</Text>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent visible={isModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>{TEXT.create}</Text>
              <TextInput
                style={styles.input}
                placeholder={TEXT.title}
                placeholderTextColor="#8f929b"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.input}
                placeholder={TEXT.location}
                placeholderTextColor="#8f929b"
                value={location}
                onChangeText={setLocation}
              />
              <TextInput
                multiline
                style={[styles.input, styles.textarea]}
                placeholder={TEXT.description}
                placeholderTextColor="#8f929b"
                value={description}
                onChangeText={setDescription}
              />
              <DatePickerField
                label={TEXT.date}
                value={eventDate}
                onChange={setEventDate}
                placeholder={TEXT.eventDatePlaceholder}
              />

              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
              ) : null}
              <Pressable style={styles.imagePickerButton} onPress={pickEventImage}>
                <Ionicons name="image-outline" size={17} color="#c47a2d" />
                <Text style={styles.imagePickerText}>
                  {imageUri ? TEXT.imageChange : TEXT.imageAdd}
                </Text>
              </Pressable>

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={closeModal}
                  disabled={saving}
                >
                  <Text style={styles.modalButtonText}>{TEXT.cancel}</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleCreateEvent}
                  disabled={saving}
                >
                  {saving ? (
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

function EventCard({
  event,
  onDelete,
  onToggleJoin,
  updating,
}: {
  event: AutoEvent;
  onDelete: () => void;
  onToggleJoin: () => void;
  updating: boolean;
}) {
  const imageUrl = event.imageUrl ? getSecureImageUrl(event.imageUrl) : undefined;

  return (
    <View style={styles.eventCard}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.eventImage} contentFit="cover" />
      ) : null}
      <View style={styles.eventHeader}>
        <View style={styles.eventTitleBlock}>
          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventMeta}>
            {formatDisplayDate(event.eventDate)} - {event.location}
          </Text>
        </View>
        <View style={styles.scopeBadge}>
          <Text style={styles.scopeBadgeText}>
            {event.clubName || TEXT.myEvent}
          </Text>
        </View>
      </View>

      {event.description ? (
        <Text style={styles.eventDescription}>{event.description}</Text>
      ) : null}

      <View style={styles.eventFooter}>
        <Text style={styles.attendeeText}>
          {event.attendeeCount} {TEXT.attendee}
        </Text>
        <View style={styles.eventActions}>
          {event.canManage ? (
            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <Ionicons name="trash-outline" size={16} color="#ffb4a2" />
            </Pressable>
          ) : null}
          <Pressable
            style={[styles.joinButton, event.joinedByMe ? styles.joinedButton : null]}
            onPress={onToggleJoin}
            disabled={updating}
          >
            {updating ? (
              <ActivityIndicator color="#111213" />
            ) : (
              <Text style={styles.joinButtonText}>
                {event.joinedByMe ? TEXT.leave : TEXT.join}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

const styles = StyleSheet.create({
  attendeeText: {
    color: "#aeb1ba",
    fontSize: 13,
    fontWeight: "800",
  },
  cancelButton: {
    backgroundColor: "#363941",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  createCard: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    padding: 14,
  },
  createIcon: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  createText: {
    color: "#aeb1ba",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  createTextBlock: {
    flex: 1,
    gap: 4,
  },
  createTitle: {
    color: "#f4f4f6",
    fontSize: 16,
    fontWeight: "900",
  },
  deleteButton: {
    alignItems: "center",
    backgroundColor: "#302529",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  emptyText: {
    color: "#aeb1ba",
    marginTop: 28,
    textAlign: "center",
  },
  eventActions: {
    flexDirection: "row",
    gap: 8,
  },
  eventCard: {
    backgroundColor: "#1f2227",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    overflow: "hidden",
    padding: 14,
  },
  eventDescription: {
    color: "#cfd0d3",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 10,
  },
  eventFooter: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  eventHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
  },
  eventImage: {
    borderRadius: 8,
    height: 150,
    marginBottom: 12,
    width: "100%",
  },
  eventMeta: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
  eventTitle: {
    color: "#f4f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  eventTitleBlock: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: "#f4f4f6",
    fontSize: 19,
    fontWeight: "900",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40,
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
    height: 150,
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
  joinButton: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    height: 34,
    justifyContent: "center",
    minWidth: 82,
    paddingHorizontal: 12,
  },
  joinedButton: {
    backgroundColor: "#6f747f",
  },
  joinButtonText: {
    color: "#111213",
    fontSize: 13,
    fontWeight: "900",
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
  textarea: {
    height: 84,
    paddingTop: 13,
    textAlignVertical: "top",
  },
});