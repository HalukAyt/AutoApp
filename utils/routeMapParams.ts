import type { UserRoute } from "@/types/domain";

const splitDetail = (detail: string) => {
  const [startPoint = "", endPoint = ""] = detail.split(" - ");
  return {
    endPoint: endPoint.trim(),
    startPoint: startPoint.trim(),
  };
};

export const buildRouteMapParams = (route: UserRoute) => {
  const fallbackPoints = splitDetail(route.detail || "");
  const startPoint = route.startPoint?.trim() || fallbackPoints.startPoint;
  const endPoint = route.endPoint?.trim() || fallbackPoints.endPoint;

  return {
    detail: route.detail || "",
    distance: String(route.distance),
    duration: String(route.duration),
    endLatitude:
      route.endLatitude !== null && route.endLatitude !== undefined
        ? String(route.endLatitude)
        : "",
    endLongitude:
      route.endLongitude !== null && route.endLongitude !== undefined
        ? String(route.endLongitude)
        : "",
    endPoint,
    id: String(route.id),
    startLatitude:
      route.startLatitude !== null && route.startLatitude !== undefined
        ? String(route.startLatitude)
        : "",
    startLongitude:
      route.startLongitude !== null && route.startLongitude !== undefined
        ? String(route.startLongitude)
        : "",
    startPoint,
    title: route.title,
  };
};
