import { Ionicons } from "@expo/vector-icons";
import { DatePickerField } from "@/components/forms/DatePickerField";
import { LoadingScreen } from "@/components/LoadingScreen";
import {
  createClub,
  createClubEvent,
  createClubRoute,
  getClubEvents,
  getClubRoutes,
  getClubs,
  joinClub,
  leaveClub,
} from "@/services/clubService";
import { joinEvent, leaveEvent } from "@/services/eventService";
import type { AutoEvent, Club, UserRoute } from "@/types/domain";
import { getSecureImageUrl } from "@/utils/imageUrl";
import { buildRouteMapParams } from "@/utils/routeMapParams";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
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
import MapView, {
  Marker,
  type LatLng,
  type MapPressEvent,
  type Region,
} from "react-native-maps";

const TEXT = {
  attendee: "kat\u0131l\u0131mc\u0131",
  cancel: "\u0130ptal",
  clubCreate: "Kul\u00fcp Olu\u015ftur",
  clubDescription: "Kul\u00fcp a\u00e7\u0131klamas\u0131",
  clubName: "Kul\u00fcp ad\u0131",
  clubRoute: "Kul\u00fcp rotas\u0131",
  clubs: "Kul\u00fcpler",
  create: "Olu\u015ftur",
  createEvent: "Etkinlik Olu\u015ftur",
  createRoute: "Rota Olu\u015ftur",
  date: "Tarih",
  description: "A\u00e7\u0131klama",
  distance: "Mesafe (km)",
  duration: "S\u00fcre (saat)",
  emptyClubs: "Hen\u00fcz kul\u00fcp yok.",
  emptyEvents: "Bu kul\u00fcbe ait etkinlik yok.",
  emptyRoutes: "Bu kul\u00fcbe ait rota yok.",
  endPoint: "Biti\u015f noktas\u0131",
  eventDatePlaceholder: "Etkinlik tarihi se\u00e7",
  events: "Etkinlikler",
  imageAdd: "Foto\u011fraf Ekle",
  imageChange: "Foto\u011fraf\u0131 De\u011fi\u015ftir",
  join: "Kat\u0131l",
  joined: "\u00dcyesin",
  leave: "Ayr\u0131l",
  loading: "Y\u00fckleniyor...",
  location: "Konum",
  manager: "Y\u00f6netici",
  members: "\u00fcye",
  permission: "Foto\u011fraf se\u00e7mek i\u00e7in galeri izni gerekli.",
  pickFromMap: "Haritadan se\u00e7",
  pointNotSelected: "Nokta se\u00e7ilmedi",
  pointSelected: "Noktay\u0131 Se\u00e7",
  routeTitle: "Rota ad\u0131",
  routeDate: "Rota Tarihi",
  routeDatePlaceholder: "Rota tarihi se\u00e7",
  routes: "Rotalar",
  save: "Kaydet",
  search: "Kul\u00fcp ara...",
  selectEnd: "Biti\u015f Se\u00e7",
  selectStart: "Ba\u015flang\u0131\u00e7 Se\u00e7",
  startPoint: "Ba\u015flang\u0131\u00e7 noktas\u0131",
  title: "Ba\u015fl\u0131k",
  validationClub: "Kul\u00fcp ad\u0131 girin.",
  validationEvent: "Ba\u015fl\u0131k, konum ve tarih girin.",
  validationRoute: "Rota ad\u0131, ba\u015flang\u0131\u00e7 ve biti\u015f girin.",
};

const DEFAULT_ROUTE_REGION: Region = {
  latitude: 39.9255,
  latitudeDelta: 0.12,
  longitude: 32.8663,
  longitudeDelta: 0.12,
};

type ModalMode = "club" | "event" | "route" | null;
type RoutePointMode = "start" | "end";

export default function Clubs() {
  const router = useRouter();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedClubId, setExpandedClubId] = useState<number | null>(null);
  const [clubEvents, setClubEvents] = useState<Record<number, AutoEvent[]>>({});
  const [clubRoutes, setClubRoutes] = useState<Record<number, UserRoute[]>>({});
  const [contentLoadingClubId, setContentLoadingClubId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [clubName, setClubName] = useState("");
  const [clubDescription, setClubDescription] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventImageUri, setEventImageUri] = useState<string | null>(null);
  const [routeTitle, setRouteTitle] = useState("");
  const [routeStartPoint, setRouteStartPoint] = useState("");
  const [routeEndPoint, setRouteEndPoint] = useState("");
  const [routeStartCoordinate, setRouteStartCoordinate] = useState<LatLng | null>(null);
  const [routeEndCoordinate, setRouteEndCoordinate] = useState<LatLng | null>(null);
  const [routePickerMode, setRoutePickerMode] = useState<RoutePointMode>("start");
  const [routePickerCoordinate, setRoutePickerCoordinate] = useState<LatLng | null>(null);
  const [routePickerLabel, setRoutePickerLabel] = useState("");
  const [routePickerRegion, setRoutePickerRegion] = useState<Region>(DEFAULT_ROUTE_REGION);
  const [isRoutePickerVisible, setRoutePickerVisible] = useState(false);
  const [routeDistance, setRouteDistance] = useState("");
  const [routeDuration, setRouteDuration] = useState("");
  const [routeDate, setRouteDate] = useState("");

  const fetchClubs = useCallback(async () => {
    try {
      const data = await getClubs();
      setClubs(data);
    } catch (error) {
      console.log("Clubs fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchClubs();
    }, [fetchClubs]),
  );

  const visibleClubs = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase("tr-TR");
    if (!normalized) return clubs;

    return clubs.filter((club) =>
      [club.name, club.description, club.managerName].some((value) =>
        String(value ?? "").toLocaleLowerCase("tr-TR").includes(normalized),
      ),
    );
  }, [clubs, search]);

  const openModal = (mode: ModalMode, club?: Club) => {
    setModalMode(mode);
    setSelectedClub(club ?? null);
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedClub(null);
    setClubName("");
    setClubDescription("");
    setEventTitle("");
    setEventDescription("");
    setEventLocation("");
    setEventDate("");
    setEventImageUri(null);
    setRouteTitle("");
    setRouteStartPoint("");
    setRouteEndPoint("");
    setRouteStartCoordinate(null);
    setRouteEndCoordinate(null);
    setRoutePickerCoordinate(null);
    setRoutePickerLabel("");
    setRoutePickerRegion(DEFAULT_ROUTE_REGION);
    setRoutePickerVisible(false);
    setRouteDistance("");
    setRouteDuration("");
    setRouteDate("");
  };

  const loadClubContent = async (club: Club) => {
    if (!club.member && !club.manager) return;

    try {
      setContentLoadingClubId(club.id);
      const [events, routes] = await Promise.all([
        getClubEvents(club.id),
        getClubRoutes(club.id),
      ]);
      setClubEvents((current) => ({ ...current, [club.id]: events }));
      setClubRoutes((current) => ({ ...current, [club.id]: routes }));
    } catch (error) {
      console.log("Club content fetch error:", error);
    } finally {
      setContentLoadingClubId(null);
    }
  };

  const toggleExpandClub = async (club: Club) => {
    const nextExpanded = expandedClubId === club.id ? null : club.id;
    setExpandedClubId(nextExpanded);

    if (nextExpanded === club.id && !clubEvents[club.id] && !clubRoutes[club.id]) {
      await loadClubContent(club);
    }
  };

  const updateClubInList = (updatedClub: Club) => {
    setClubs((current) =>
      current.map((club) => (club.id === updatedClub.id ? updatedClub : club)),
    );
  };

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      Alert.alert("Uyar\u0131", TEXT.validationClub);
      return;
    }

    try {
      setSaving(true);
      const created = await createClub({
        name: clubName.trim(),
        description: clubDescription.trim(),
      });
      setClubs((current) => [created, ...current]);
      closeModal();
    } catch (error) {
      console.log("Club create error:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMembership = async (club: Club) => {
    try {
      setUpdatingId(club.id);
      const updated = club.member && !club.manager
        ? await leaveClub(club.id)
        : await joinClub(club.id);
      updateClubInList(updated);
      if (updated.member || updated.manager) {
        await loadClubContent(updated);
      }
    } catch (error) {
      console.log("Club membership error:", error);
    } finally {
      setUpdatingId(null);
    }
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
      setEventImageUri(result.assets[0].uri);
    }
  };
  const handleCreateClubEvent = async () => {
    if (!selectedClub || !eventTitle.trim() || !eventLocation.trim() || !eventDate.trim()) {
      Alert.alert("Uyar\u0131", TEXT.validationEvent);
      return;
    }

    try {
      setSaving(true);
      const created = await createClubEvent(selectedClub.id, {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        location: eventLocation.trim(),
        eventDate,
      });
      setClubEvents((current) => ({
        ...current,
        [selectedClub.id]: [created, ...(current[selectedClub.id] ?? [])],
      }));
      closeModal();
      await fetchClubs();
    } catch (error) {
      console.log("Club event create error:", error);
    } finally {
      setSaving(false);
    }
  };
  const openRoutePicker = (mode: RoutePointMode) => {
    const selectedCoordinate = mode === "start" ? routeStartCoordinate : routeEndCoordinate;
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
      console.log("Club route reverse geocode error:", error);
    }
  };

  const confirmRoutePoint = () => {
    if (!routePickerCoordinate) {
      Alert.alert("Uyar\u0131", "Haritadan bir nokta se\u00e7in.");
      return;
    }

    const label = routePickerLabel || formatCoordinateLabel(routePickerCoordinate);
    const nextStartCoordinate =
      routePickerMode === "start" ? routePickerCoordinate : routeStartCoordinate;
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
      setRouteDistance(formatDistance(calculateDistanceKm(nextStartCoordinate, nextEndCoordinate)));
    }

    setRoutePickerVisible(false);
  };

  const handleCreateClubRoute = async () => {
    if (!selectedClub || !routeTitle.trim() || !routeStartPoint.trim() || !routeEndPoint.trim() || !routeStartCoordinate || !routeEndCoordinate) {
      Alert.alert("Uyar\u0131", TEXT.validationRoute);
      return;
    }

    try {
      setSaving(true);
      const distance = Number(routeDistance.replace(",", ".")) || calculateDistanceKm(routeStartCoordinate, routeEndCoordinate);
      const duration = parseInt(routeDuration, 10) || Math.max(1, Math.round(distance / 70));
      const created = await createClubRoute(selectedClub.id, {
        title: routeTitle.trim(),
        startPoint: routeStartPoint.trim(),
        endPoint: routeEndPoint.trim(),
        startLatitude: routeStartCoordinate.latitude,
        startLongitude: routeStartCoordinate.longitude,
        endLatitude: routeEndCoordinate.latitude,
        endLongitude: routeEndCoordinate.longitude,
        distance,
        duration,
        routeDate: routeDate.trim() || undefined,
      });
      setClubRoutes((current) => ({
        ...current,
        [selectedClub.id]: [created, ...(current[selectedClub.id] ?? [])],
      }));
      closeModal();
      await fetchClubs();
    } catch (error) {
      console.log("Club route create error:", error);
      Alert.alert("Hata", "Rota olu\u015fturulamad\u0131. Noktalar\u0131 haritadan tekrar se\u00e7in.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEventJoin = async (clubId: number, event: AutoEvent) => {
    try {
      setUpdatingId(event.id);
      const updated = event.joinedByMe
        ? await leaveEvent(event.id)
        : await joinEvent(event.id);
      setClubEvents((current) => ({
        ...current,
        [clubId]: (current[clubId] ?? []).map((item) =>
          item.id === updated.id ? updated : item,
        ),
      }));
    } catch (error) {
      console.log("Club event join error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return <LoadingScreen backgroundColor="#202124" color="#c47a2d" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{TEXT.clubs}</Text>
          <Pressable style={styles.iconButton} onPress={() => openModal("club")}>
            <Ionicons name="add" size={22} color="#f4f4f6" />
          </Pressable>
        </View>

        <TextInput
          placeholder={TEXT.search}
          placeholderTextColor="#8f929b"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        {visibleClubs.length > 0 ? (
          visibleClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              events={clubEvents[club.id] ?? []}
              routes={clubRoutes[club.id] ?? []}
              expanded={expandedClubId === club.id}
              loadingContent={contentLoadingClubId === club.id}
              updating={updatingId === club.id}
              eventUpdatingId={updatingId}
              onCreateEvent={() => openModal("event", club)}
              onCreateRoute={() => openModal("route", club)}
              onToggleExpand={() => toggleExpandClub(club)}
              onToggleMembership={() => handleToggleMembership(club)}
              onToggleEventJoin={(event) => handleToggleEventJoin(club.id, event)}
              onOpenRoute={(route) =>
                router.push({ pathname: "/route-map", params: buildRouteMapParams(route) })
              }
            />
          ))
        ) : (
          <Text style={styles.emptyText}>{TEXT.emptyClubs}</Text>
        )}
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalMode !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {modalMode === "club" ? (
              <>
                <Text style={styles.modalTitle}>{TEXT.clubCreate}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={TEXT.clubName}
                  placeholderTextColor="#8f929b"
                  value={clubName}
                  onChangeText={setClubName}
                />
                <TextInput
                  multiline
                  style={[styles.input, styles.textarea]}
                  placeholder={TEXT.clubDescription}
                  placeholderTextColor="#8f929b"
                  value={clubDescription}
                  onChangeText={setClubDescription}
                />
              </>
            ) : null}

            {modalMode === "event" ? (
              <>
                <Text style={styles.modalTitle}>{`${selectedClub?.name ?? ""} - ${TEXT.createEvent}`}</Text>
                <TextInput style={styles.input} placeholder={TEXT.title} placeholderTextColor="#8f929b" value={eventTitle} onChangeText={setEventTitle} />
                <TextInput style={styles.input} placeholder={TEXT.location} placeholderTextColor="#8f929b" value={eventLocation} onChangeText={setEventLocation} />
                <TextInput multiline style={[styles.input, styles.textarea]} placeholder={TEXT.description} placeholderTextColor="#8f929b" value={eventDescription} onChangeText={setEventDescription} />
                <DatePickerField label={TEXT.date} value={eventDate} onChange={setEventDate} placeholder={TEXT.eventDatePlaceholder} />
                {eventImageUri ? (
                  <Image source={{ uri: eventImageUri }} style={styles.imagePreview} contentFit="cover" />
                ) : null}
                <Pressable style={styles.imagePickerButton} onPress={pickEventImage}>
                  <Ionicons name="image-outline" size={17} color="#c47a2d" />
                  <Text style={styles.imagePickerText}>{eventImageUri ? TEXT.imageChange : TEXT.imageAdd}</Text>
                </Pressable>
              </>
            ) : null}

            {modalMode === "route" ? (
              <>
                <Text style={styles.modalTitle}>{`${selectedClub?.name ?? ""} - ${TEXT.createRoute}`}</Text>
                <TextInput style={styles.input} placeholder={TEXT.routeTitle} placeholderTextColor="#8f929b" value={routeTitle} onChangeText={setRouteTitle} />
                <RoutePointButton label={TEXT.startPoint} value={routeStartPoint} onPress={() => openRoutePicker("start")} />
                <RoutePointButton label={TEXT.endPoint} value={routeEndPoint} onPress={() => openRoutePicker("end")} />
                <TextInput style={styles.input} keyboardType="decimal-pad" placeholder={TEXT.distance} placeholderTextColor="#8f929b" value={routeDistance} onChangeText={setRouteDistance} />
                <TextInput style={styles.input} keyboardType="numeric" placeholder={TEXT.duration} placeholderTextColor="#8f929b" value={routeDuration} onChangeText={setRouteDuration} />
                <DatePickerField label={TEXT.routeDate} value={routeDate} onChange={setRouteDate} optional placeholder={TEXT.routeDatePlaceholder} iosDisplay="compact" />
              </>
            ) : null}

            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={closeModal} disabled={saving}>
                <Text style={styles.modalButtonText}>{TEXT.cancel}</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={modalMode === "club" ? handleCreateClub : modalMode === "event" ? handleCreateClubEvent : handleCreateClubRoute}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>{TEXT.save}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isRoutePickerVisible} animationType="slide">
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
                title={routePickerMode === "start" ? TEXT.startPoint : TEXT.endPoint}
                description={routePickerLabel}
              />
            ) : null}
          </MapView>

          <SafeAreaView pointerEvents="box-none" style={styles.mapPickerOverlay}>
            <View style={styles.mapPickerHeader}>
              <Pressable style={styles.mapPickerIconButton} onPress={() => setRoutePickerVisible(false)}>
                <Text style={styles.mapPickerIconText}>{"<"}</Text>
              </Pressable>
              <View style={styles.mapPickerTitleWrap}>
                <Text style={styles.mapPickerTitle}>
                  {routePickerMode === "start" ? TEXT.selectStart : TEXT.selectEnd}
                </Text>
                <Text style={styles.mapPickerSubtitle} numberOfLines={1}>
                  {routePickerLabel || TEXT.pointNotSelected}
                </Text>
              </View>
            </View>

            <View style={styles.mapPickerFooter}>
              <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={() => setRoutePickerVisible(false)}>
                <Text style={styles.modalButtonText}>{TEXT.cancel}</Text>
              </Pressable>
              <Pressable style={[styles.modalButton, styles.saveButton]} onPress={confirmRoutePoint}>
                <Text style={styles.modalButtonText}>{TEXT.pointSelected}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ClubCard({
  club,
  eventUpdatingId,
  events,
  expanded,
  loadingContent,
  onCreateEvent,
  onCreateRoute,
  onOpenRoute,
  onToggleEventJoin,
  onToggleExpand,
  onToggleMembership,
  routes,
  updating,
}: {
  club: Club;
  eventUpdatingId: number | null;
  events: AutoEvent[];
  expanded: boolean;
  loadingContent: boolean;
  onCreateEvent: () => void;
  onCreateRoute: () => void;
  onOpenRoute: (route: UserRoute) => void;
  onToggleEventJoin: (event: AutoEvent) => void;
  onToggleExpand: () => void;
  onToggleMembership: () => void;
  routes: UserRoute[];
  updating: boolean;
}) {
  const canSeeContent = club.member || club.manager;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{club.name}</Text>
          <Text style={styles.cardMeta}>{`${club.memberCount} ${TEXT.members} - ${club.managerName}`}</Text>
        </View>
        {club.manager ? <Text style={styles.managerBadge}>{TEXT.manager}</Text> : null}
      </View>

      {club.description ? <Text style={styles.cardText}>{club.description}</Text> : null}

      <View style={styles.cardActions}>
        <Pressable style={styles.secondaryButton} onPress={onToggleExpand} disabled={!canSeeContent}>
          <Text style={styles.secondaryButtonText}>{expanded ? "Gizle" : "\u0130\u00e7erikler"}</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, club.member && !club.manager ? styles.neutralButton : null]}
          onPress={onToggleMembership}
          disabled={updating || club.manager}
        >
          {updating ? (
            <ActivityIndicator color="#111213" />
          ) : (
            <Text style={styles.primaryButtonText}>{club.member ? TEXT.joined : TEXT.join}</Text>
          )}
        </Pressable>
      </View>

      {expanded && canSeeContent ? (
        <View style={styles.clubContent}>
          {club.manager ? (
            <View style={styles.managerActions}>
              <Pressable style={styles.managerAction} onPress={onCreateEvent}>
                <Ionicons name="calendar-outline" size={16} color="#c47a2d" />
                <Text style={styles.managerActionText}>{TEXT.createEvent}</Text>
              </Pressable>
              <Pressable style={styles.managerAction} onPress={onCreateRoute}>
                <Ionicons name="map-outline" size={16} color="#c47a2d" />
                <Text style={styles.managerActionText}>{TEXT.createRoute}</Text>
              </Pressable>
            </View>
          ) : null}

          {loadingContent ? (
            <Text style={styles.emptyText}>{TEXT.loading}</Text>
          ) : (
            <>
              <ContentTitle title={TEXT.events} />
              {events.length > 0 ? (
                events.map((event) => (
                  <EventRow
                    key={event.id}
                    event={event}
                    updating={eventUpdatingId === event.id}
                    onToggleJoin={() => onToggleEventJoin(event)}
                  />
                ))
              ) : (
                <Text style={styles.inlineEmptyText}>{TEXT.emptyEvents}</Text>
              )}

              <ContentTitle title={TEXT.routes} />
              {routes.length > 0 ? (
                routes.map((route) => (
                  <Pressable key={route.id} style={styles.routeRow} onPress={() => onOpenRoute(route)}>
                    <View style={styles.rowIcon}>
                      <Ionicons name="map-outline" size={16} color="#c47a2d" />
                    </View>
                    <View style={styles.rowTextBlock}>
                      <Text style={styles.rowTitle}>{route.title}</Text>
                      <Text style={styles.rowMeta}>
                        {route.routeDate
                          ? `${formatDisplayDate(route.routeDate)} - ${route.detail}`
                          : route.detail}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#8f929b" />
                  </Pressable>
                ))
              ) : (
                <Text style={styles.inlineEmptyText}>{TEXT.emptyRoutes}</Text>
              )}
            </>
          )}
        </View>
      ) : null}
    </View>
  );
}

function RoutePointButton({
  label,
  onPress,
  value,
}: {
  label: string;
  onPress: () => void;
  value: string;
}) {
  return (
    <Pressable style={styles.routePointButton} onPress={onPress}>
      <Text style={styles.routePointLabel}>{label}</Text>
      <Text style={[styles.routePointValue, !value && styles.routePointPlaceholder]} numberOfLines={2}>
        {value || TEXT.pickFromMap}
      </Text>
    </Pressable>
  );
}

function EventRow({ event, onToggleJoin, updating }: { event: AutoEvent; onToggleJoin: () => void; updating: boolean }) {
  const imageUrl = event.imageUrl ? getSecureImageUrl(event.imageUrl) : undefined;

  return (
    <View style={styles.eventRow}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.eventThumbnail} contentFit="cover" />
      ) : (
        <View style={styles.rowIcon}>
          <Ionicons name="calendar-outline" size={16} color="#c47a2d" />
        </View>
      )}
      <View style={styles.rowTextBlock}>
        <Text style={styles.rowTitle}>{event.title}</Text>
        <Text style={styles.rowMeta}>{`${formatDisplayDate(event.eventDate)} - ${event.location} - ${event.attendeeCount} ${TEXT.attendee}`}</Text>
      </View>
      <Pressable style={styles.smallJoinButton} onPress={onToggleJoin} disabled={updating}>
        {updating ? <ActivityIndicator color="#111213" /> : <Text style={styles.smallJoinText}>{event.joinedByMe ? TEXT.leave : TEXT.join}</Text>}
      </Pressable>
    </View>
  );
}

function ContentTitle({ title }: { title: string }) {
  return <Text style={styles.contentTitle}>{title}</Text>;
}

function formatAddress(address: Location.LocationGeocodedAddress, fallback: string) {
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

function formatDistance(value: number) {
  return value.toFixed(value >= 10 ? 1 : 2);
}

function calculateDistanceKm(start: LatLng, end: LatLng) {
  const earthRadiusKm = 6371;
  const latitudeDelta = degreesToRadians(end.latitude - start.latitude);
  const longitudeDelta = degreesToRadians(end.longitude - start.longitude);
  const startLatitude = degreesToRadians(start.latitude);
  const endLatitude = degreesToRadians(end.latitude);
  const halfChord =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(startLatitude) * Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) * Math.sin(longitudeDelta / 2);

  return Math.round(earthRadiusKm * 2 * Math.atan2(Math.sqrt(halfChord), Math.sqrt(1 - halfChord)) * 10) / 10;
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

const styles = StyleSheet.create({
  cancelButton: { backgroundColor: "#363941" },
  card: {
    backgroundColor: "#1f2227",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 14,
  },
  cardActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  cardHeader: { alignItems: "flex-start", flexDirection: "row", gap: 10 },
  cardMeta: { color: "#9da0a8", fontSize: 12, fontWeight: "800", marginTop: 4 },
  cardText: { color: "#cfd0d3", fontSize: 13, fontWeight: "700", lineHeight: 20, marginTop: 10 },
  cardTitle: { color: "#f4f4f6", fontSize: 18, fontWeight: "900" },
  cardTitleBlock: { flex: 1 },
  clubContent: { borderTopColor: "#30333b", borderTopWidth: 1, marginTop: 14, paddingTop: 12 },
  content: { padding: 20, paddingBottom: 36 },
  contentTitle: { color: "#f4f4f6", fontSize: 14, fontWeight: "900", marginBottom: 8, marginTop: 12 },
  emptyText: { color: "#aeb1ba", marginTop: 24, textAlign: "center" },
  eventRow: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 8 },
  eventThumbnail: { backgroundColor: "#24272e", borderRadius: 8, height: 42, width: 42 },
  headerRow: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  iconButton: { alignItems: "center", backgroundColor: "#24272e", borderRadius: 8, height: 40, justifyContent: "center", width: 40 },
  imagePickerButton: { alignItems: "center", backgroundColor: "#202126", borderColor: "#343842", borderRadius: 8, borderWidth: 1, flexDirection: "row", gap: 8, height: 44, justifyContent: "center", marginTop: 10 },
  imagePickerText: { color: "#f4f4f6", fontSize: 13, fontWeight: "900" },
  imagePreview: { borderRadius: 8, height: 140, marginTop: 10, width: "100%" },
  inlineEmptyText: { color: "#8f929b", fontSize: 12, fontWeight: "700", marginBottom: 4 },
  input: { backgroundColor: "#202126", borderRadius: 8, color: "#fff", fontSize: 15, fontWeight: "700", height: 48, marginBottom: 12, paddingHorizontal: 14 },
  managerAction: { alignItems: "center", backgroundColor: "#24272e", borderRadius: 8, flex: 1, flexDirection: "row", gap: 7, height: 40, justifyContent: "center" },
  managerActions: { flexDirection: "row", gap: 10, marginBottom: 4 },
  managerActionText: { color: "#f4f4f6", fontSize: 12, fontWeight: "900" },
  managerBadge: { backgroundColor: "#302a22", borderRadius: 8, color: "#c47a2d", fontSize: 11, fontWeight: "900", paddingHorizontal: 8, paddingVertical: 6 },
  mapPicker: { ...StyleSheet.absoluteFillObject },
  mapPickerFooter: { alignSelf: "center", backgroundColor: "rgba(23, 24, 26, 0.92)", borderRadius: 8, bottom: 26, flexDirection: "row", gap: 10, padding: 10, position: "absolute", width: "88%" },
  mapPickerHeader: { alignItems: "center", flexDirection: "row", paddingHorizontal: 14, paddingTop: 8 },
  mapPickerIconButton: { alignItems: "center", backgroundColor: "rgba(23, 24, 26, 0.86)", borderRadius: 8, height: 42, justifyContent: "center", width: 42 },
  mapPickerIconText: { color: "#f4f4f6", fontSize: 24, fontWeight: "900" },
  mapPickerOverlay: { ...StyleSheet.absoluteFillObject },
  mapPickerScreen: { backgroundColor: "#202124", flex: 1 },
  mapPickerSubtitle: { color: "#c7c7cc", fontSize: 12, fontWeight: "700", marginTop: 2 },
  mapPickerTitle: { color: "#f4f4f6", fontSize: 17, fontWeight: "900" },
  mapPickerTitleWrap: { backgroundColor: "rgba(23, 24, 26, 0.86)", borderRadius: 8, flex: 1, marginLeft: 10, paddingHorizontal: 12, paddingVertical: 9 },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 16 },
  modalButton: { alignItems: "center", borderRadius: 8, flex: 1, height: 44, justifyContent: "center" },
  modalButtonText: { color: "#fff", fontSize: 14, fontWeight: "900" },
  modalContent: { backgroundColor: "#111213", borderTopLeftRadius: 8, borderTopRightRadius: 8, maxHeight: "88%", padding: 18 },
  modalOverlay: { backgroundColor: "rgba(0, 0, 0, 0.56)", flex: 1, justifyContent: "flex-end" },
  modalTitle: { color: "#f4f4f6", fontSize: 18, fontWeight: "900", marginBottom: 14 },
  neutralButton: { backgroundColor: "#6f747f" },
  primaryButton: { alignItems: "center", backgroundColor: "#c47a2d", borderRadius: 8, flex: 1, height: 38, justifyContent: "center" },
  primaryButtonText: { color: "#111213", fontSize: 13, fontWeight: "900" },
  routePointButton: { backgroundColor: "#202126", borderColor: "#343842", borderRadius: 8, borderWidth: 1, marginBottom: 12, minHeight: 58, paddingHorizontal: 14, paddingVertical: 10 },
  routePointLabel: { color: "#a9a9ae", fontSize: 11, fontWeight: "800", marginBottom: 4 },
  routePointPlaceholder: { color: "#8f929b" },
  routePointValue: { color: "#fff", fontSize: 14, fontWeight: "800", lineHeight: 18 },
  routeRow: { alignItems: "center", flexDirection: "row", gap: 10, marginBottom: 8 },
  rowIcon: { alignItems: "center", backgroundColor: "#24272e", borderRadius: 8, height: 34, justifyContent: "center", width: 34 },
  rowMeta: { color: "#9da0a8", fontSize: 11, fontWeight: "700", marginTop: 2 },
  rowTextBlock: { flex: 1, minWidth: 0 },
  rowTitle: { color: "#f4f4f6", fontSize: 13, fontWeight: "900" },
  safeArea: { backgroundColor: "#202124", flex: 1 },
  saveButton: { backgroundColor: "#c47a2d" },
  search: { backgroundColor: "#111213", borderColor: "#272a31", borderRadius: 8, borderWidth: 1, color: "#fff", height: 46, marginBottom: 16, paddingHorizontal: 14 },
  secondaryButton: { alignItems: "center", backgroundColor: "#24272e", borderColor: "#343842", borderRadius: 8, borderWidth: 1, flex: 1, height: 38, justifyContent: "center" },
  secondaryButtonText: { color: "#f4f4f6", fontSize: 13, fontWeight: "900" },
  smallJoinButton: { alignItems: "center", backgroundColor: "#c47a2d", borderRadius: 8, height: 32, justifyContent: "center", minWidth: 62, paddingHorizontal: 10 },
  smallJoinText: { color: "#111213", fontSize: 12, fontWeight: "900" },
  textarea: { height: 82, paddingTop: 13, textAlignVertical: "top" },
  title: { color: "#f4f4f6", fontSize: 24, fontWeight: "900" },
});
