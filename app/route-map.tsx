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

const TEXT = {
  destination: "Biti\u015f",
  distance: "Mesafe",
  duration: "S\u00fcre",
  missingPoint: "Bu rota i\u00e7in ba\u015flang\u0131\u00e7 ya da biti\u015f noktas\u0131 yok.",
  noPoint: "Rota noktas\u0131 yok",
  notFound:
    "Rota haritada bulunamad\u0131. Ba\u015flang\u0131\u00e7 ve biti\u015f alanlar\u0131n\u0131 daha net yazmay\u0131 deneyin.",
  placing: "Rota haritaya yerle\u015ftiriliyor...",
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

  const [coordinates, setCoordinates] = useState<LatLng[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const routeSubtitle = useMemo(() => {
    if (startPoint && endPoint) return `${startPoint} - ${endPoint}`;
    return detail || startPoint || endPoint || TEXT.noPoint;
  }, [detail, endPoint, startPoint]);

  const geocodeRoute = useCallback(async () => {
    if (startCoordinate || endCoordinate) {
      setCoordinates(
        [startCoordinate, endCoordinate].filter(Boolean) as LatLng[],
      );
      setErrorMessage("");
      setLoading(false);
      return;
    }

    const pointsToFind = [startPoint, endPoint].filter(Boolean) as string[];

    if (pointsToFind.length === 0) {
      setCoordinates([]);
      setErrorMessage(TEXT.missingPoint);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const resolvedCoordinates = await Promise.all(
        pointsToFind.map(async (point) => {
          const [result] = await Location.geocodeAsync(point);

          if (!result) {
            throw new Error(`${point} bulunamadi`);
          }

          return {
            latitude: result.latitude,
            longitude: result.longitude,
          };
        }),
      );

      setCoordinates(resolvedCoordinates);
    } catch (error) {
      console.error("Route geocode error:", error);
      setCoordinates([]);
      setErrorMessage(TEXT.notFound);
    } finally {
      setLoading(false);
    }
  }, [endCoordinate, endPoint, startCoordinate, startPoint]);

  useEffect(() => {
    geocodeRoute();
  }, [geocodeRoute]);

  useEffect(() => {
    if (coordinates.length === 0) return;

    requestAnimationFrame(() => {
      if (coordinates.length === 1) {
        mapRef.current?.animateToRegion(getRegionForCoordinates(coordinates), 300);
        return;
      }

      mapRef.current?.fitToCoordinates(coordinates, {
        animated: false,
        edgePadding: {
          bottom: 120,
          left: 48,
          right: 48,
          top: 170,
        },
      });
    });
  }, [coordinates]);

  const openNativeMaps = async () => {
    const startValue = startCoordinate
      ? formatCoordinateForUrl(startCoordinate)
      : startPoint;
    const endValue = endCoordinate ? formatCoordinateForUrl(endCoordinate) : endPoint;
    const encodedStart = encodeURIComponent(startValue);
    const encodedEnd = encodeURIComponent(endValue);
    const encodedQuery = encodeURIComponent(endValue || startValue);
    let url = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`;

    if (Platform.OS === "ios") {
      url =
        startPoint && endPoint
          ? `http://maps.apple.com/?saddr=${encodedStart}&daddr=${encodedEnd}`
          : `http://maps.apple.com/?q=${encodedQuery}`;
    } else if (startPoint && endPoint) {
      url = `https://www.google.com/maps/dir/?api=1&origin=${encodedStart}&destination=${encodedEnd}&travelmode=driving`;
    }

    await Linking.openURL(url);
  };

  return (
    <View style={styles.screen}>
      <MapView ref={mapRef} style={styles.map} initialRegion={DEFAULT_REGION}>
        {coordinates[0] ? (
          <Marker coordinate={coordinates[0]} title={TEXT.start} description={startPoint} />
        ) : null}
        {coordinates[1] ? (
          <Marker coordinate={coordinates[1]} title={TEXT.destination} description={endPoint} />
        ) : null}
        {coordinates.length > 1 ? (
          <Polyline
            coordinates={coordinates}
            geodesic
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
          <Metric label={TEXT.distance} value={distance ? `${distance} km` : "-"} />
          <Metric label={TEXT.duration} value={duration ? `${duration} saat` : "-"} />
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
