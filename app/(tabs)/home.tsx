import { Ionicons } from "@expo/vector-icons";
import { getEvents } from "@/services/eventService";
import { getProfile } from "@/services/profileService";
import {
  getActiveVehicle,
  setActiveVehicle as activateVehicle,
} from "@/services/vehicleService";
import type { AutoEvent, UserRoute, Vehicle } from "@/types/domain";
import { useFocusEffect, useRouter } from "expo-router";
import type { ComponentProps } from "react";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const carImage = require("../../assets/images/5.jpg");
const eventImage = require("../../assets/images/33.jpg");

type IconName = ComponentProps<typeof Ionicons>["name"];

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAINTENANCE_REMINDER_WINDOW_DAYS = 3;
const ACTIVITY_REMINDER_WINDOW_DAYS = 7;

type ReminderItem = {
  date: Date;
  text: string;
};

type DashboardReminderInput = {
  events: AutoEvent[];
  routes: UserRoute[];
  vehicle: Vehicle | null;
};

const TEXT = {
  activeVehicle: "Aktif Ara\u00e7",
  add: "Ekle",
  addVehicle: "Ara\u00e7 ekle",
  autoTrack: "AutoTrack",
  change: "De\u011fi\u015ftir",
  clubs: "Kul\u00fcpler",
  clubsText: "Topluluklara ve garajlara bak",
  details: "Detay",
  emptyGarage: "Garajda ara\u00e7 yok.",
  events: "Etkinlikler",
  eventsText: "Bulu\u015fmalara kat\u0131l, yeni dostluklar kur",
  expensesThisMonth: "Bu Ay",
  explore: "Ke\u015ffet",
  exploreText: "Ara\u00e7lar\u0131 ve rotalar\u0131 bul",
  garage: "Garaj\u0131n",
  inspection: "Muayene",
  loadingGarage: "Garaj y\u00fckleniyor...",
  noVehicle: "Ara\u00e7 se\u00e7ilmedi",
  noReminder: "Yakla\u015fan hat\u0131rlatma yok.",
  posts: "G\u00f6nderiler",
  postsText: "Son payla\u015f\u0131mlar\u0131 g\u00f6r",
  quickAccess: "H\u0131zl\u0131 Eri\u015fim",
  reminder: "Hat\u0131rlatma",
  searchPlaceholder: "Kullan\u0131c\u0131, ara\u00e7 veya rota ara",
  selectActiveVehicle: "Aktif arac\u0131 se\u00e7",
  selectError: "Aktif ara\u00e7 de\u011fi\u015ftirilemedi.",
  selected: "Se\u00e7ili",
};

const formatTryAmount = (amount?: number | null) => {
  const numericAmount = Number(amount ?? 0);
  const safeAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

  return `\u20ba${safeAmount.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  })}`;
};

const formatDisplayDate = (date?: string | null) => {
  if (!date) return "-";

  const [year, month, day] = date.slice(0, 10).split("-");
  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
};

function buildDashboardReminders({
  events,
  routes,
  vehicle,
}: DashboardReminderInput) {
  const reminders: ReminderItem[] = [];

  const vehicleName = vehicle
    ? `${vehicle.brand} ${vehicle.model}`.trim()
    : "";
  const maintenanceReminder = createDateReminder(
    vehicleName ? `${vehicleName} bak\u0131m/muayenesi` : "Bak\u0131m/muayene",
    vehicle?.inspectionAppointmentDate,
    MAINTENANCE_REMINDER_WINDOW_DAYS,
  );

  if (maintenanceReminder) {
    reminders.push(maintenanceReminder);
  }

  events.forEach((event) => {
    const eventReminder = createDateReminder(
      `${event.title} etkinli\u011fi`,
      event.eventDate,
      ACTIVITY_REMINDER_WINDOW_DAYS,
    );

    if (eventReminder) {
      reminders.push(eventReminder);
    }
  });

  routes.forEach((route) => {
    const routeReminder = createDateReminder(
      `${route.title} rotas\u0131`,
      route.routeDate,
      ACTIVITY_REMINDER_WINDOW_DAYS,
    );

    if (routeReminder) {
      reminders.push(routeReminder);
    }
  });

  return reminders
    .sort((first, second) => first.date.getTime() - second.date.getTime())
    .slice(0, 4)
    .map((reminder) => reminder.text);
}

function createDateReminder(
  label: string,
  dateValue: string | null | undefined,
  windowDays: number,
): ReminderItem | null {
  const date = parseReminderDate(dateValue);

  if (!date) return null;

  const daysUntil = getDaysUntil(date);

  if (daysUntil < 0 || daysUntil > windowDays) {
    return null;
  }

  return {
    date,
    text: `${label.trim()} ${formatReminderTiming(daysUntil)}`,
  };
}

function parseReminderDate(value: string | null | undefined) {
  if (!value) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return startOfDay(date);
}

function getDaysUntil(date: Date) {
  const today = startOfDay(new Date());

  return Math.ceil((date.getTime() - today.getTime()) / DAY_IN_MS);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatReminderTiming(daysUntil: number) {
  if (daysUntil === 0) return "bug\u00fcn";
  if (daysUntil === 1) return "yar\u0131n";

  return `${daysUntil} g\u00fcn kald\u0131`;
}

export default function Home() {
  const router = useRouter();
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [garageVehicles, setGarageVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);
  const [isVehiclePickerVisible, setVehiclePickerVisible] = useState(false);
  const [activatingVehicleId, setActivatingVehicleId] = useState<number | null>(
    null,
  );
  const [isGarageLoading, setGarageLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setGarageLoading(true);

    const [activeResult, profileResult, eventResult] = await Promise.allSettled([
      getActiveVehicle(),
      getProfile(),
      getEvents(),
    ]);

    let nextActiveVehicle: Vehicle | null = null;
    let nextEvents: AutoEvent[] = [];
    let nextRoutes: UserRoute[] = [];

    if (activeResult.status === "fulfilled") {
      nextActiveVehicle = activeResult.value;
      setActiveVehicle(nextActiveVehicle);
    } else {
      setActiveVehicle(null);
      console.log("Active Vehicle Data error:", activeResult.reason);
    }

    if (profileResult.status === "fulfilled") {
      setGarageVehicles(profileResult.value.garage ?? []);
      nextRoutes = profileResult.value.routes ?? [];
    } else {
      setGarageVehicles([]);
      console.log("Profile garage data error:", profileResult.reason);
    }

    if (eventResult.status === "fulfilled") {
      nextEvents = eventResult.value;
    } else {
      console.log("Events reminder data error:", eventResult.reason);
    }

    setReminders(
      buildDashboardReminders({
        events: nextEvents,
        routes: nextRoutes,
        vehicle: nextActiveVehicle,
      }),
    );
    setGarageLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData]),
  );

  const vehicleTitle = activeVehicle
    ? `${activeVehicle.brand} ${activeVehicle.model}`
    : TEXT.noVehicle;

  const openVehiclePicker = () => {
    setVehiclePickerVisible(true);
  };

  const handleSelectActiveVehicle = async (vehicle: Vehicle) => {
    if (vehicle.id === activeVehicle?.id) {
      setVehiclePickerVisible(false);
      return;
    }

    try {
      setActivatingVehicleId(vehicle.id);
      await activateVehicle(vehicle.id);
      setActiveVehicle(vehicle);
      setVehiclePickerVisible(false);
      fetchDashboardData();
    } catch (error) {
      console.log("Set active vehicle error:", error);
      Alert.alert("Hata", TEXT.selectError);
    } finally {
      setActivatingVehicleId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerKicker}>{TEXT.garage}</Text>
            <Text style={styles.logo}>{TEXT.autoTrack}</Text>
          </View>

          <View style={styles.headerActions}>
            <IconButton
              icon="person-circle-outline"
              onPress={() => router.push("/profile")}
            />
            <IconButton
              icon="add"
              onPress={() => router.push("/add-vehicle")}
            />
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#a8abb3" />
          <TextInput
            placeholder={TEXT.searchPlaceholder}
            placeholderTextColor="#8f929b"
            style={styles.searchInput}
          />
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>{TEXT.quickAccess}</Text>
          </View>

          <View style={styles.quickGrid}>
            <QuickAction
              icon="compass-outline"
              title={TEXT.explore}
              text={TEXT.exploreText}
              onPress={() => router.push("/explore")}
            />
            <QuickAction
              icon="newspaper-outline"
              title={TEXT.posts}
              text={TEXT.postsText}
              onPress={() => router.push("/feed")}
            />
          </View>

          <QuickAction
            icon="people-outline"
            title={TEXT.clubs}
            text={TEXT.clubsText}
            onPress={() => router.push("/clubs")}
            wide
          />
        </View>

        <View style={styles.vehicleCard}>
          <View style={styles.vehicleImageFrame}>
            {activeVehicle?.imageUrl ? (
              <Image
                source={{ uri: activeVehicle.imageUrl }}
                style={styles.vehicleImage}
              />
            ) : (
              <Image source={carImage} style={styles.vehicleImage} />
            )}
          </View>

          <View style={styles.vehicleInfo}>
            <View style={styles.vehicleHeaderRow}>
              <View style={styles.vehicleTitleBlock}>
                <Text style={styles.vehicleEyebrow}>{TEXT.activeVehicle}</Text>
                <Text style={styles.vehicleName} numberOfLines={1}>
                  {vehicleTitle}
                </Text>
              </View>
            </View>

            <View style={styles.vehicleStatsRow}>
              <VehicleStat
                icon="wallet-outline"
                label={TEXT.expensesThisMonth}
                value={formatTryAmount(activeVehicle?.monthlyExpenseTotal)}
              />
              <View style={styles.vehicleDivider} />
              <VehicleStat
                icon="calendar-outline"
                label={TEXT.inspection}
                value={formatDisplayDate(
                  activeVehicle?.inspectionAppointmentDate,
                )}
              />
            </View>

            <View style={styles.vehicleActionsRow}>
              <Pressable
                style={[styles.vehicleActionButton, styles.secondaryAction]}
                onPress={openVehiclePicker}
              >
                <Ionicons name="swap-horizontal" size={15} color="#f4f4f6" />
                <Text style={styles.secondaryActionText}>{TEXT.change}</Text>
              </Pressable>
              <Pressable
                style={[styles.vehicleActionButton, styles.primaryAction]}
                onPress={() => {
                  if (activeVehicle) {
                    router.push("/vehicle-detail");
                    return;
                  }

                  router.push("/add-vehicle");
                }}
              >
                <Ionicons
                  name={activeVehicle ? "create-outline" : "add"}
                  size={15}
                  color="#111213"
                />
                <Text style={styles.primaryActionText}>
                  {activeVehicle ? TEXT.details : TEXT.add}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Pressable style={styles.activityCard} onPress={() => router.push("/events")}>
          <View style={styles.activityTextBox}>
            <View style={styles.activityIcon}>
              <Ionicons name="flag-outline" size={18} color="#c47a2d" />
            </View>
            <View style={styles.activityCopy}>
              <Text style={styles.activityTitle}>{TEXT.events}</Text>
              <Text style={styles.activityText} numberOfLines={2}>
                {TEXT.eventsText}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8f929b" />
          </View>
          <Image source={eventImage} style={styles.activityImage} />
        </Pressable>

        <View style={styles.reminderCard}>
          <View style={styles.reminderHeader}>
            <Ionicons name="notifications-outline" size={18} color="#c47a2d" />
            <Text style={styles.reminderTitle}>{TEXT.reminder}</Text>
          </View>
          {reminders.length > 0 ? (
            reminders.map((reminder, index) => (
              <ReminderRow key={`${reminder}-${index}`} text={reminder} />
            ))
          ) : (
            <ReminderRow muted text={TEXT.noReminder} />
          )}
        </View>
      </ScrollView>

      <VehiclePickerModal
        activeVehicleId={activeVehicle?.id ?? null}
        activatingVehicleId={activatingVehicleId}
        isGarageLoading={isGarageLoading}
        onAddVehicle={() => {
          setVehiclePickerVisible(false);
          router.push("/add-vehicle");
        }}
        onClose={() => setVehiclePickerVisible(false)}
        onSelect={handleSelectActiveVehicle}
        vehicles={garageVehicles}
        visible={isVehiclePickerVisible}
      />
    </SafeAreaView>
  );
}

function IconButton({ icon, onPress }: { icon: IconName; onPress: () => void }) {
  return (
    <Pressable style={styles.iconButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color="#f4f4f6" />
    </Pressable>
  );
}

function QuickAction({
  icon,
  onPress,
  text,
  title,
  wide = false,
}: {
  icon: IconName;
  onPress: () => void;
  text: string;
  title: string;
  wide?: boolean;
}) {
  return (
    <Pressable
      style={[styles.quickAction, wide ? styles.quickActionWide : null]}
      onPress={onPress}
    >
      <View style={styles.quickIconBox}>
        <Ionicons name={icon} size={20} color="#c47a2d" />
      </View>
      <View style={styles.quickTextBlock}>
        <Text style={styles.quickTitle}>{title}</Text>
        <Text style={styles.quickText} numberOfLines={2}>
          {text}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#7f838d" />
    </Pressable>
  );
}

function VehicleStat({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.vehicleStat}>
      <View style={styles.vehicleStatLabelRow}>
        <Ionicons name={icon} size={14} color="#8f929b" />
        <Text style={styles.vehicleStatLabel}>{label}</Text>
      </View>
      <Text style={styles.vehicleStatValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function VehiclePickerModal({
  activeVehicleId,
  activatingVehicleId,
  isGarageLoading,
  onAddVehicle,
  onClose,
  onSelect,
  vehicles,
  visible,
}: {
  activeVehicleId: number | null;
  activatingVehicleId: number | null;
  isGarageLoading: boolean;
  onAddVehicle: () => void;
  onClose: () => void;
  onSelect: (vehicle: Vehicle) => void;
  vehicles: Vehicle[];
  visible: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.vehiclePickerSheet}>
          <View style={styles.vehiclePickerHeader}>
            <Text style={styles.vehiclePickerTitle}>{TEXT.selectActiveVehicle}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#f4f4f6" />
            </Pressable>
          </View>

          {isGarageLoading ? (
            <View style={styles.vehiclePickerStatus}>
              <ActivityIndicator color="#c47a2d" />
              <Text style={styles.vehiclePickerStatusText}>
                {TEXT.loadingGarage}
              </Text>
            </View>
          ) : vehicles.length > 0 ? (
            <ScrollView style={styles.vehiclePickerList}>
              {vehicles.map((vehicle) => {
                const isActive = vehicle.id === activeVehicleId;
                const isActivating = vehicle.id === activatingVehicleId;

                return (
                  <Pressable
                    key={vehicle.id}
                    style={styles.vehicleOption}
                    onPress={() => onSelect(vehicle)}
                  >
                    <View style={styles.vehicleOptionImageFrame}>
                      {vehicle.imageUrl ? (
                        <Image
                          source={{ uri: vehicle.imageUrl }}
                          style={styles.vehicleOptionImage}
                        />
                      ) : (
                        <Image source={carImage} style={styles.vehicleOptionImage} />
                      )}
                    </View>
                    <View style={styles.vehicleOptionTextBlock}>
                      <Text style={styles.vehicleOptionTitle} numberOfLines={1}>
                        {`${vehicle.brand} ${vehicle.model}`}
                      </Text>
                      <Text style={styles.vehicleOptionMeta} numberOfLines={1}>
                        {`${vehicle.year}${vehicle.licensePlate ? ` - ${vehicle.licensePlate}` : ""}`}
                      </Text>
                    </View>
                    {isActivating ? (
                      <ActivityIndicator color="#c47a2d" />
                    ) : isActive ? (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={14} color="#111213" />
                        <Text style={styles.selectedBadgeText}>{TEXT.selected}</Text>
                      </View>
                    ) : (
                      <Ionicons name="chevron-forward" size={18} color="#7f838d" />
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.vehiclePickerStatus}>
              <Text style={styles.vehiclePickerStatusText}>{TEXT.emptyGarage}</Text>
              <Pressable style={styles.addVehicleButton} onPress={onAddVehicle}>
                <Ionicons name="add" size={16} color="#111213" />
                <Text style={styles.addVehicleText}>{TEXT.addVehicle}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

function ReminderRow({ muted = false, text }: { muted?: boolean; text: string }) {
  return (
    <View style={styles.reminderRow}>
      <View style={[styles.reminderDot, muted ? styles.reminderDotMuted : null]} />
      <Text style={[styles.reminderText, muted ? styles.reminderTextMuted : null]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activityCard: {
    backgroundColor: "#1f2227",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    overflow: "hidden",
  },
  activityCopy: {
    flex: 1,
    gap: 3,
  },
  activityIcon: {
    alignItems: "center",
    backgroundColor: "#2b2d32",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  activityImage: {
    height: 104,
    width: "100%",
  },
  activityText: {
    color: "#b9bbc2",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  activityTextBox: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  activityTitle: {
    color: "#f3f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  addVehicleButton: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    height: 38,
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 14,
  },
  addVehicleText: {
    color: "#111213",
    fontSize: 13,
    fontWeight: "900",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderRadius: 8,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  headerKicker: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 1,
  },
  headerTextBlock: {
    flex: 1,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#24272e",
    borderColor: "#343842",
    borderRadius: 8,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  logo: {
    color: "#f4f4f6",
    fontSize: 28,
    fontWeight: "900",
  },
  modalBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.56)",
    flex: 1,
    justifyContent: "flex-end",
  },
  primaryAction: {
    backgroundColor: "#c47a2d",
  },
  primaryActionText: {
    color: "#111213",
    fontSize: 12,
    fontWeight: "900",
  },
  quickAction: {
    alignItems: "center",
    backgroundColor: "#1f2227",
    borderColor: "#2f333b",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 90,
    padding: 12,
  },
  quickActionWide: {
    marginTop: 10,
  },
  quickGrid: {
    flexDirection: "row",
    gap: 10,
  },
  quickIconBox: {
    alignItems: "center",
    backgroundColor: "#2b2d32",
    borderRadius: 8,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  quickText: {
    color: "#aeb1ba",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  quickTextBlock: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  quickTitle: {
    color: "#f3f4f6",
    fontSize: 15,
    fontWeight: "900",
  },
  reminderCard: {
    backgroundColor: "#111213",
    borderColor: "#24262c",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  reminderDot: {
    backgroundColor: "#c47a2d",
    borderRadius: 3,
    height: 6,
    marginTop: 8,
    width: 6,
  },
  reminderDotMuted: {
    backgroundColor: "#6f747f",
  },
  reminderHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  reminderRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 7,
  },
  reminderText: {
    color: "#cfd0d3",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  reminderTextMuted: {
    color: "#8f929b",
  },
  reminderTitle: {
    color: "#f4f4f6",
    fontSize: 17,
    fontWeight: "900",
  },
  safeArea: {
    backgroundColor: "#191a1c",
    flex: 1,
  },
  scrollContent: {
    backgroundColor: "#191a1c",
    paddingBottom: 92,
  },
  searchBar: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#272a31",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    height: 46,
    marginHorizontal: 20,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: "#ffffff",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    height: "100%",
  },
  secondaryAction: {
    backgroundColor: "#24272e",
    borderColor: "#343842",
    borderWidth: 1,
  },
  secondaryActionText: {
    color: "#f4f4f6",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionBlock: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionLabel: {
    color: "#dfe0e4",
    fontSize: 16,
    fontWeight: "900",
  },
  selectedBadge: {
    alignItems: "center",
    backgroundColor: "#c47a2d",
    borderRadius: 8,
    flexDirection: "row",
    gap: 4,
    height: 28,
    paddingHorizontal: 8,
  },
  selectedBadgeText: {
    color: "#111213",
    fontSize: 11,
    fontWeight: "900",
  },
  vehicleActionButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    height: 34,
    justifyContent: "center",
  },
  vehicleActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  vehicleCard: {
    alignItems: "center",
    backgroundColor: "#111213",
    borderColor: "#2b2e35",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    marginHorizontal: 20,
    marginTop: 18,
    minHeight: 154,
    padding: 12,
  },
  vehicleDivider: {
    backgroundColor: "#30333a",
    height: 42,
    width: 1,
  },
  vehicleEyebrow: {
    color: "#c47a2d",
    fontSize: 11,
    fontWeight: "900",
    marginBottom: 2,
  },
  vehicleHeaderRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  vehicleImage: {
    height: "100%",
    width: "100%",
  },
  vehicleImageFrame: {
    backgroundColor: "#24262c",
    borderRadius: 8,
    height: 104,
    overflow: "hidden",
    width: 96,
  },
  vehicleInfo: {
    flex: 1,
    gap: 13,
    minWidth: 0,
  },
  vehicleName: {
    color: "#f0f0f1",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 21,
  },
  vehicleOption: {
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
  vehicleOptionImage: {
    height: "100%",
    width: "100%",
  },
  vehicleOptionImageFrame: {
    backgroundColor: "#24262c",
    borderRadius: 8,
    height: 52,
    overflow: "hidden",
    width: 58,
  },
  vehicleOptionMeta: {
    color: "#9da0a8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  vehicleOptionTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  vehicleOptionTitle: {
    color: "#f4f4f6",
    fontSize: 15,
    fontWeight: "900",
  },
  vehiclePickerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  vehiclePickerList: {
    maxHeight: 390,
  },
  vehiclePickerSheet: {
    backgroundColor: "#111213",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  vehiclePickerStatus: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 130,
  },
  vehiclePickerStatusText: {
    color: "#cfd0d3",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
  },
  vehiclePickerTitle: {
    color: "#f4f4f6",
    fontSize: 18,
    fontWeight: "900",
  },
  vehicleStat: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  vehicleStatLabel: {
    color: "#8f929b",
    fontSize: 11,
    fontWeight: "900",
  },
  vehicleStatLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
  },
  vehicleStatValue: {
    color: "#e2e4e9",
    fontSize: 14,
    fontWeight: "900",
  },
  vehicleStatsRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
  },
  vehicleTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
});
