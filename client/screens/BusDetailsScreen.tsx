import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  Platform,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import MapboxGL from "@rnmapbox/maps"; // IMPORT MAPBOX

import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { getBusDetails } from "@/lib/api";
import { createLocationListener, createStatusListener } from "@/lib/firebase";
import { Bus, BusLocation } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTranslation } from 'react-i18next';
import { getApiUrl } from "@/lib/query-client";
type BusDetailsRouteProp = RouteProp<RootStackParamList, "BusDetails">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAP_HEIGHT = 280;

const BusDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<BusDetailsRouteProp>();
  const { busId, driver } = route.params;
  const { theme } = useTheme();
  const { token, student } = useAuth();

  // Mapbox uses a Camera Ref, not a Map Ref for movement
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [bus, setBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busLocation, setBusLocation] = useState<BusLocation | null>(null);
  const [isLive, setIsLive] = useState(false);
  const { t, i18n } = useTranslation();

  const baseUrl = getApiUrl();
  
  const avatarUrl =
    driver?.user?.avatar && driver?.user.avatar.startsWith("https")
      ? driver?.user?.avatar
      : driver?.user?.avatar
      ? `${baseUrl}${driver?.user?.avatar}`
      : null;
  const routeGeoJSON = useMemo(() => {
    if (!bus?.route?.path || !Array.isArray(bus.route.path)) return null;
    
    // Ensure format is [lng, lat]
    const coordinates = bus.route.path.map(([lng, lat]) => [lng, lat]);

    return {
      type: "Feature" as const,
      properties: {},
      geometry: {
        type: "LineString" as const,
        coordinates: coordinates,
      },
    };
  }, [bus]);

  const startCoord = routeGeoJSON?.geometry.coordinates[0];
  const endCoord = routeGeoJSON?.geometry.coordinates[routeGeoJSON.geometry.coordinates.length - 1];

  const fetchBusDetails = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const busData = await getBusDetails(token, busId);
      setBus(busData);
      if (busData) {
        setIsLive(busData.is_active);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load bus details");
    } finally {
      setIsLoading(false);
    }
  }, [token, busId]);

  useEffect(() => {
    fetchBusDetails();
  }, [fetchBusDetails]);
  useEffect(() => {
    if (!bus) return;
    const unsubscribeStatus = createStatusListener(bus.id, (status) => {
      if (status) {
        setIsLive(status.isActive);
      }
    });
    return () => unsubscribeStatus();
  }, [bus?.id]);

  useEffect(() => {
    if (!bus || !isLive) {
      setBusLocation(null);
      return;
    }

    const unsubscribeLocation = createLocationListener(bus.id, (location) => {
      setBusLocation(location);

           
      // 2. Animate Camera to new Location
      if (location && cameraRef.current) {
        cameraRef.current.setCamera({
          centerCoordinate: [location.lng, location.lat],
          zoomLevel: 15,
          animationDuration: 1000,
        });
      }
    });

    return () => unsubscribeLocation();
  }, [bus?.id, isLive]);

  const handleCallDriver = useCallback(() => {
    if (bus?.driver?.user?.phone) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`tel:${bus.driver.user.phone}`);
    }
  }, [bus]);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }
  if (error || !bus) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="alert-circle" size={48} color={theme.textSecondary} />
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          {error || "Bus not found"}
        </ThemedText>
        <Pressable style={styles.retryButton} onPress={fetchBusDetails}>
          <ThemedText style={{ color: Colors.light.primary }}>Try Again</ThemedText>
        </Pressable>
      </View>
    );
  }

  // Calculate default center
  const initialCenter = busLocation 
    ? [busLocation.lng, busLocation.lat] 
    : (student?.home_lon && student?.home_lat) 
      ? [Number(student.home_lon), Number(student.home_lat)]
      : [73.0479, 33.6844];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeIn.delay(100)} style={styles.mapContainer}>
        <MapboxGL.MapView
          style={styles.map}
          styleURL={MapboxGL.StyleURL.Street}
          logoEnabled={false}
          attributionEnabled={false}
        >
          <MapboxGL.Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: initialCenter,
              zoomLevel: 13,
            }}
          />

          {/* --- ROUTE POLYLINE --- */}
          {routeGeoJSON && (
            <MapboxGL.ShapeSource id="route-source" shape={routeGeoJSON}>
              <MapboxGL.LineLayer
                id="route-layer"
                style={{
                  lineColor: Colors.light.primary,
                  lineWidth: 4,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </MapboxGL.ShapeSource>
          )}

          {/* --- START MARKER --- */}
          {startCoord && (
            <MapboxGL.PointAnnotation
              id="start-marker"
              coordinate={startCoord}
              title="Route Start"
            >
              <View style={styles.dotMarkerContainer}>
                 <View style={[styles.dotMarker, { backgroundColor: Colors.light.success }]} />
              </View>
            </MapboxGL.PointAnnotation>
          )}

          {/* --- END MARKER --- */}
          {endCoord && (
            <MapboxGL.PointAnnotation
              id="end-marker"
              coordinate={endCoord}
              title="Route End"
            >
              <View style={styles.dotMarkerContainer}>
                 <View style={[styles.dotMarker, { backgroundColor: Colors.light.error }]} />
              </View>
            </MapboxGL.PointAnnotation>
          )}

          {/* --- LIVE BUS MARKER --- */}
          {busLocation && isLive && (
            <MapboxGL.PointAnnotation
              id="bus-marker"
              coordinate={[busLocation.lng, busLocation.lat]}
              title={bus.name}
            >
              <View style={styles.busMarker}>
                <View style={styles.busMarkerPulse} />
                <View style={styles.busMarkerInner}>
                  <Feather name="navigation" size={16} color="#FFFFFF" />
                </View>
              </View>
              <MapboxGL.Callout title={bus.name} />
            </MapboxGL.PointAnnotation>
          )}

          {/* --- STUDENT HOME MARKER --- */}
          {student?.home_lat && student?.home_lon && (
            <MapboxGL.PointAnnotation
              id="student-home"
              coordinate={[Number(student.home_lon), Number(student.home_lat)]}
              title="Your Location"
            >
               <View style={styles.dotMarkerContainer}>
                 <View style={[styles.dotMarker, { backgroundColor: Colors.light.accent }]} />
              </View>
            </MapboxGL.PointAnnotation>
          )}
        </MapboxGL.MapView>

        {/* --- OVERLAYS --- */}
        <View style={styles.mapOverlay}>
          <StatusBadge isActive={isLive} size="medium" />
        </View>

        {!isLive && (
          <View style={styles.offlineOverlay}>
            <Feather name="wifi-off" size={24} color={theme.textSecondary} />
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              Bus is currently offline
            </ThemedText>
          </View>
        )}
      </Animated.View>

      {/* --- INFO CARDS --- */}
      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.busInfoCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.busHeader}>
            <View
              style={[
                styles.busIcon,
                { backgroundColor: Colors.light.primary },
              ]}
            >
              <Feather name="truck" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.busDetails}>
              <ThemedText type="h3">{bus.name}</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: 2 }}
              >
                {bus.registration_number}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Feather name="users" size={18} color={theme.textSecondary} />
              <ThemedText type="body" style={styles.infoValue}>
                {bus.capacity || "N/A"}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {t('capacity')}
              </ThemedText>
            </View>
            {bus.route ? (
              <View style={[styles.infoItem, { flex: 2 }]}>
                <Feather name="map-pin" size={18} color={Colors.light.accent} />
                <ThemedText
                  type="body"
                  style={styles.infoValue}
                  // numberOfLines={2}
                >
                  {bus.route.route_str || "Route"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {t('route')}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {bus.driver ? (
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            style={[
              styles.driverCard,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <ThemedText
              type="small"
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              DRIVER
            </ThemedText>
            <View style={styles.driverInfo}>
              <Image
                source={
                  driver?.user.avatar
                    ? { uri: avatarUrl }
                    : require("../../assets/images/default-avatar.png")
                }
                style={styles.driverAvatar}
              />
              <View style={styles.driverDetails}>
                <ThemedText type="h4">
                  {bus.driver.user.first_name} {bus.driver.user.last_name}
                </ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: 2 }}
                >
                  License: {bus.driver.license_id}
                </ThemedText>
              </View>
              {bus.driver.user.phone ? (
                <Pressable
                  style={[
                    styles.callButton,
                    { backgroundColor: Colors.light.success },
                  ]}
                  onPress={handleCallDriver}
                  testID="button-call-driver"
                >
                  <Feather name="phone" size={20} color="#FFFFFF" />
                </Pressable>
              ) : null}
            </View>
          </Animated.View>
        ) : null}

        {isLive && busLocation ? (
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={[
              styles.liveInfoCard,
              { backgroundColor: "rgba(56, 142, 60, 0.1)" },
            ]}
          >
            <Feather name="radio" size={20} color={Colors.light.success} />
            <View style={styles.liveInfoContent}>
              <ThemedText type="body" style={{ color: Colors.light.success }}>
                Live Tracking Active
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: 2 }}
              >
                Last updated:{" "}
                {new Date(busLocation.timestamp).toLocaleTimeString()}
              </ThemedText>
            </View>
            {busLocation.speed !== undefined ? (
              <View style={styles.speedIndicator}>
                <ThemedText type="h4" style={{ color: Colors.light.primary }}>
                  {Math.round(busLocation.speed)}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  km/h
                </ThemedText>
              </View>
            ) : null}
          </Animated.View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  retryButton: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
  },
  mapContainer: {
    height: MAP_HEIGHT,
    position: "relative",
    overflow: 'hidden', 
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: "absolute",
    top: Spacing.lg,
    right: Spacing.lg,
  },
  offlineOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  busMarker: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  busMarkerPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    opacity: 0.3,
  },
  busMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  dotMarkerContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  busInfoCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  busHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  busIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  busDetails: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  infoRow: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.xs,
  },
  infoValue: {
    fontWeight: "600",
    marginTop: Spacing.xs,
  },
  driverCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  sectionLabel: {
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
  },
  driverDetails: {
    flex: 1,
  },
  callButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.fab,
  },
  liveInfoCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    gap: Spacing.md,
  },
  liveInfoContent: {
    flex: 1,
  },
  speedIndicator: {
    alignItems: "center",
    justifyContent: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 107, 94, 0.1)",
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
});
 
export default BusDetailsScreen;