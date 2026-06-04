import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, {
  Marker,
  Polyline,
  type LatLng,
  type Region,
} from "react-native-maps";

const DEFAULT_REGION: Region = {
  latitude: 41.0082,
  latitudeDelta: 0.4,
  longitude: 28.9784,
  longitudeDelta: 0.4,
};

const DIRECTIONS_API_URL = "https://router.project-osrm.org/route/v1/driving";

const TEXT = {
  destination: "Biti\u015f",
  distance: "Mesafe",
  duration: "S\u00fcre",
  missingPoint: "Bu rota i\u00e7in ba\u015flang\u0131\u00e7 ya da biti\u015f noktas\u0131 yok.",
  noPoint: "Rota noktas\u0131 yok",
  notFound:
    "Rota haritada bulunamad\u0131. Ba\u015flang\u0131\u00e7 ve biti\u015f alanlar\u0131n\u0131 daha net yazmay\u0131 deneyin.",
  placing: "Rota haritaya yerle\u015ftiriliyor...",
  roadRouteFailed:
    "S\u00fcr\u00fc\u015f rotas\u0131 al\u0131namad\u0131. Noktalar\u0131 g\u00f6steriyorum.",
  route: "Rota",
  start: "Ba\u015flang\u0131\u00e7",
};

type RouteMapParams = {
  detail?: string | string[];
  distance?: string | string[];
  duration?: string | string[];
  endLatitude?: string | string[];
  endLongitude?: string | string[];
  endPoint?: string | string[];
  startLatitude?: string | string[];
  startLongitude?: string | string[];
  startPoint?: string | string[];
  title?: string | string[];
};

type DrivingRoute = {
  coordinates: LatLng[];
  distanceMeters: number | null;
  durationSeconds: number | null;
};

type OsrmRouteResponse = {
  code?: string;
  message?: string;
  routes?: {
    distance?: number;
    duration?: number;
    geometry?: {
      coordinates?: [number, number][];
    };
  }[];
};

export default function RouteMap() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const params = useLocalSearchParams<RouteMapParams>();

  const title = readParam(params.title) || TEXT.route;
  const detail = readParam(params.detail);
  const startPoint = readParam(params.startPoint);
  const endPoint = readParam(params.endPoint);
  const distance = readParam(params.distance);
  const duration = readParam(params.duration);
  const startLatitude = readParam(params.startLatitude);
  const startLongitude = readParam(params.startLongitude);
  const endLatitude = readParam(params.endLatitude);
  const endLongitude = readParam(params.endLongitude);
  const startCoordinate = useMemo(
    () => readCoordinate(startLatitude, startLongitude),
    [startLatitude, startLongitude],
  );
  const endCoordinate = useMemo(
    () => readCoordinate(endLatitude, endLongitude),
    [endLatitude, endLongitude],
  );
  const canOpenNativeMaps = Boolean(
    startPoint || endPoint || startCoordinate || endCoordinate,
  );

  const [markerCoordinates, setMarkerCoordinates] = useState<LatLng[]>([]);
  const [routeCoordinates, setRouteCoordinates] = useState<LatLng[]>([]);
  const [routeDistance, setRouteDistance] = useState("");
  const [routeDuration, setRouteDuration] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const routeSubtitle = useMemo(() => {
    if (startPoint && endPoint) return `${startPoint} - ${endPoint}`;
    return detail || startPoint || endPoint || TEXT.noPoint;
  }, [detail, endPoint, startPoint]);

  const visibleCoordinates = useMemo(
    () => (routeCoordinates.length > 1 ? routeCoordinates : markerCoordinates),
    [markerCoordinates, routeCoordinates],
  );

  const loadDrivingRoute = useCallback(async (points: LatLng[]) => {
    setMarkerCoordinates(points);
    setRouteCoordinates([]);
    setRouteDistance("");
    setRouteDuration("");

    if (points.length < 2) {
      return;
    }

    try {
      const drivingRoute = await fetchDrivingRoute(points[0], points[1]);
      setRouteCoordinates(drivingRoute.coordinates);
      setRouteDistance(formatDistance(drivingRoute.distanceMeters));
      setRouteDuration(formatDuration(drivingRoute.durationSeconds));
      setErrorMessage("");
    } catch (error) {
      console.error("Driving route fetch error:", error);
      setErrorMessage(TEXT.roadRouteFailed);
    }
  }, []);

  const loadRoute = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const [resolvedStart, resolvedEnd] = await Promise.all([
        resolveRoutePoint(startCoordinate, startPoint),
        resolveRoutePoint(endCoordinate, endPoint),
      ]);
      const resolvedCoordinates = [resolvedStart, resolvedEnd].filter(
        Boolean,
      ) as LatLng[];

      if (resolvedCoordinates.length === 0) {
        setMarkerCoordinates([]);
        setRouteCoordinates([]);
        setRouteDistance("");
        setRouteDuration("");
        setErrorMessage(TEXT.missingPoint);
        return;
      }

      await loadDrivingRoute(resolvedCoordinates);
    } catch (error) {
      console.error("Route geocode error:", error);
      setMarkerCoordinates([]);
      setRouteCoordinates([]);
      setRouteDistance("");
      setRouteDuration("");
      setErrorMessage(TEXT.notFound);
    } finally {
      setLoading(false);
    }
  }, [endCoordinate, endPoint, loadDrivingRoute, startCoordinate, startPoint]);

  useEffect(() => {
    loadRoute();
  }, [loadRoute]);

  useEffect(() => {
    if (visibleCoordinates.length === 0) return;

    requestAnimationFrame(() => {
      if (visibleCoordinates.length === 1) {
        mapRef.current?.animateToRegion(
          getRegionForCoordinates(visibleCoordinates),
          300,
        );
        return;
      }

      mapRef.current?.fitToCoordinates(visibleCoordinates, {
        animated: false,
        edgePadding: {
          bottom: 120,
          left: 48,
          right: 48,
          top: 170,
        },
      });
    });
  }, [visibleCoordinates]);

  const openNativeMaps = async () => {
    const startValue = startCoordinate
      ? formatCoordinateForUrl(startCoordinate)
      : startPoint;
    const endValue = endCoordinate ? formatCoordinateForUrl(endCoordinate) : endPoint;
    const encodedStart = encodeURIComponent(startValue);
    const encodedEnd = encodeURIComponent(endValue);
    const encodedQuery = encodeURIComponent(endValue || startValue);
    const hasDirections = Boolean(startValue && endValue);
    let url = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    if (Platform.OS === "ios") {
      url = hasDirections
        ? `http://maps.apple.com/?saddr=${encodedStart}&daddr=${encodedEnd}`
        : `http://maps.apple.com/?q=${encodedQuery}`;
    } else if (hasDirections) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedEnd}&travelmode=driving`;
    }

    await Linking.openURL(url);
  };

  return (
    <View style={styles.screen}>
      <MapView ref={mapRef} style={styles.map} initialRegion={DEFAULT_REGION}>
        {markerCoordinates[0] ? (
          <Marker coordinate={markerCoordinates[0]} title={TEXT.start} description={startPoint} />
        ) : null}
        {markerCoordinates[1] ? (
          <Marker
            coordinate={markerCoordinates[1]}
            title={TEXT.destination}
            description={endPoint}
          />
        ) : null}
        {routeCoordinates.length > 1 ? (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#c47a2d"
            strokeWidth={5}
          />
        ) : null}
      </MapView>

      <SafeAreaView pointerEvents="box-none" style={styles.overlay}>
        <View style={styles.topBar}>
          <Pressable style={styles.iconButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#f4f4f6" />
          </Pressable>
          <View style={styles.titleWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              {routeSubtitle}
            </Text>
          </View>
          <Pressable
            style={styles.iconButton}
            onPress={openNativeMaps}
            disabled={!canOpenNativeMaps}
          >
            <Ionicons name="navigate" size={21} color="#f4f4f6" />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color="#c47a2d" />
            <Text style={styles.statusText}>{TEXT.placing}</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.statusBox}>
            <Ionicons name="alert-circle" size={22} color="#ffb4a2" />
            <Text style={styles.statusText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.bottomBar}>
          <Metric
            label={TEXT.distance}
            value={routeDistance || (distance ? `${distance} km` : "-")}
          />
          <Metric
            label={TEXT.duration}
            value={routeDuration || (duration ? `${duration} saat` : "-")}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function readCoordinate(latitudeValue: string, longitudeValue: string) {
  const latitude = Number(latitudeValue);
  const longitude = Number(longitudeValue);

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function formatCoordinateForUrl(coordinate: LatLng) {
  return `${coordinate.latitude},${coordinate.longitude}`;
}

async function resolveRoutePoint(coordinate: LatLng | null, point: string) {
  if (coordinate) return coordinate;
  if (!point) return null;

  const [result] = await Location.geocodeAsync(point);

  if (!result) {
    throw new Error(`${point} bulunamadi`);
  }

  return {
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

async function fetchDrivingRoute(
  start: LatLng,
  end: LatLng,
): Promise<DrivingRoute> {
  const url = `${DIRECTIONS_API_URL}/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson&steps=false`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Directions request failed: ${response.status}`);
  }

  const data = (await response.json()) as OsrmRouteResponse;
  const route = data.routes?.[0];

  if (!route) {
    throw new Error(data.message || "Driving route not found");
  }

  const coordinates =
    route.geometry?.coordinates
      ?.map(([longitude, latitude]) => ({ latitude, longitude }))
      .filter(isValidCoordinate) ?? [];

  if (coordinates.length < 2) {
    throw new Error(data.message || "Driving route geometry not found");
  }

  return {
    coordinates,
    distanceMeters: typeof route.distance === "number" ? route.distance : null,
    durationSeconds: typeof route.duration === "number" ? route.duration : null,
  };
}

function isValidCoordinate(coordinate: LatLng) {
  return (
    Number.isFinite(coordinate.latitude) &&
    Number.isFinite(coordinate.longitude)
  );
}

function formatDistance(meters: number | null) {
  if (meters === null) return "";

  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }

  return `${(meters / 1000).toLocaleString("tr-TR", {
    maximumFractionDigits: 1,
  })} km`;
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "";

  const minutes = Math.max(1, Math.round(seconds / 60));

  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes
    ? `${hours} sa ${remainingMinutes} dk`
    : `${hours} sa`;
}

function getRegionForCoordinates(coordinates: LatLng[]): Region {
  if (coordinates.length === 1) {
    return {
      ...DEFAULT_REGION,
      latitude: coordinates[0].latitude,
      longitude: coordinates[0].longitude,
    };
  }

  const latitudes = coordinates.map((coordinate) => coordinate.latitude);
  const longitudes = coordinates.map((coordinate) => coordinate.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);

  return {
    latitude: (minLatitude + maxLatitude) / 2,
    latitudeDelta: Math.max((maxLatitude - minLatitude) * 1.7, 0.05),
    longitude: (minLongitude + maxLongitude) / 2,
    longitudeDelta: Math.max((maxLongitude - minLongitude) * 1.7, 0.05),
  };
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    alignSelf: "center",
    backgroundColor: "rgba(23, 24, 26, 0.92)",
    borderRadius: 8,
    bottom: 28,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    position: "absolute",
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(23, 24, 26, 0.86)",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  metric: {
    minWidth: 94,
  },
  metricLabel: {
    color: "#a9a9ae",
    fontSize: 11,
    fontWeight: "800",
  },
  metricValue: {
    color: "#f4f4f6",
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  screen: {
    backgroundColor: "#202124",
    flex: 1,
  },
  statusBox: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(23, 24, 26, 0.92)",
    borderRadius: 8,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 24,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusText: {
    color: "#f4f4f6",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "800",
  },
  subtitle: {
    color: "#c7c7cc",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  title: {
    color: "#f4f4f6",
    fontSize: 16,
    fontWeight: "900",
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: 10,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingTop: 8,
  },
});
