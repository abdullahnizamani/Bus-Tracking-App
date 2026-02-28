import { BackHandler } from "react-native";
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import MapboxGL from "@rnmapbox/maps";
// import { useKeepAwake } from 'expo-keep-awake'; // Highly recommended for drivers
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { updateBusLocation, setBusActiveStatus, setBusDriver } from "@/lib/firebase";
import { updateBusActiveStatus } from "@/lib/api";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTranslation } from 'react-i18next';

type LiveTrackingRouteProp = RouteProp<RootStackParamList, "LiveTracking">;

export default function LiveTrackingScreen() {
  // useKeepAwake(); // Prevents the screen from turning off during the trip
  const insets = useSafeAreaInsets();
  const route = useRoute<LiveTrackingRouteProp>();
  const navigation = useNavigation();
  const { busId } = route.params;
  const { theme } = useTheme();
  const { token, driver, user } = useAuth();
  const { t } = useTranslation();

  const cameraRef = useRef<MapboxGL.Camera>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const driverSentRef = useRef(false);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [trackingDuration, setTrackingDuration] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);

  // Animations
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isTracking) {
      pulseScale.value = withRepeat(
        withTiming(1.8, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
    }
  }, [isTracking]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 1 - (pulseScale.value - 1),
  }));

  // --- TRACKING LOGIC ---

  const stopTracking = useCallback(async () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
    await setBusActiveStatus(busId, false);
    if (token) await updateBusActiveStatus(token, busId, false).catch(() => {});
    setIsTracking(false);
    setCurrentSpeed(0);
  }, [busId, token]);

  const handleStopPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      t('stop_tracking'),
      t('stop_tracking_description'),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            await stopTracking();
            navigation.goBack();
          },
        },
      ]
    );
  }, [t, navigation, stopTracking]);

  // --- BACK BUTTON PROTECTION ---

  const handleBackAction = useCallback(() => {
    if (isTracking) {
      handleStopPress();
      return true; // Block default back behavior
    }
    navigation.goBack();
    return true;
  }, [isTracking, handleStopPress, navigation]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", handleBackAction);
    return () => backHandler.remove();
  }, [handleBackAction]);

  // --- LOCATION & PERMISSIONS ---

  useEffect(() => {
    requestLocationPermission();
    return () => { stopTracking(); };
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTracking) {
      interval = setInterval(() => setTrackingDuration((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTracking]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setHasPermission(status === "granted");
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setCurrentLocation(location);
        cameraRef.current?.setCamera({
          centerCoordinate: [location.coords.longitude, location.coords.latitude],
          zoomLevel: 15,
          animationDuration: 1000,
        });
      }
    } catch (error) {
      setHasPermission(false);
    }
  };

  const startTracking = async () => {
    if (!hasPermission) return requestLocationPermission();

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsTracking(true);
      setTrackingDuration(0);

      await setBusActiveStatus(busId, true);
      if (token) await updateBusActiveStatus(token, busId, true).catch(() => {});
      if (driver && !driverSentRef.current) {
        await setBusDriver(busId, {
          id: user?.id ?? 0,
          name: `${user?.first_name} ${user?.last_name}` || 'Driver',
        });
        driverSentRef.current = true;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (location) => {
          setCurrentLocation(location);
          const speedKmh = Math.round((location.coords.speed || 0) * 3.6);
          setCurrentSpeed(speedKmh > 0 ? speedKmh : 0);

          updateBusLocation(busId, {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            timestamp: Date.now(),
            speed: speedKmh,
            heading: location.coords.heading || 0
          });

          cameraRef.current?.setCamera({
            centerCoordinate: [location.coords.longitude, location.coords.latitude],
            zoomLevel: 16,
            heading: location.coords.heading || 0,
            pitch: 45,
            animationDuration: 1500,
          });
        }
      );
    } catch (error) {
      setIsTracking(false);
      Alert.alert("Error", "Failed to start tracking.");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (hasPermission === false) return (
    <View style={[styles.permissionContainer, { backgroundColor: theme.backgroundRoot }]}>
      <Feather name="slash" size={64} color={Colors.light.error} />
      <ThemedText type="h3" style={styles.permissionTitle}>{t('location_request_title')}</ThemedText>
      <Pressable style={[styles.primaryBtn, { backgroundColor: Colors.light.primary }]} onPress={requestLocationPermission}>
        <ThemedText style={styles.btnText}>{t('enable_location')}</ThemedText>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.container}>
      <MapboxGL.MapView 
        style={styles.map} 
        styleURL={MapboxGL.StyleURL.Street} 
        logoEnabled={false} 
        attributionEnabled={false}
      >
        <MapboxGL.Camera ref={cameraRef} />
        {currentLocation && (
          <MapboxGL.PointAnnotation id="driver" coordinate={[currentLocation.coords.longitude, currentLocation.coords.latitude]}>
            <View style={styles.markerContainer}>
              {isTracking && <Animated.View style={[styles.markerPulse, pulseStyle]} />}
              <View style={[styles.markerInner, { backgroundColor: isTracking ? Colors.light.success : Colors.light.primary }]}>
                <Feather name="navigation" size={20} color="#FFF" />
              </View>
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      <View style={[styles.topHud, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.iconCircle} onPress={handleBackAction}>
          <Feather name="x" size={24} color={theme.text} />
        </Pressable>
        
        {isTracking && (
          <Animated.View entering={FadeInDown} style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>ON AIR</ThemedText>
          </Animated.View>
        )}
      </View>

      <View style={[styles.dashboard, { paddingBottom: insets.bottom + 20, backgroundColor: theme.backgroundDefault }]}>
        {!isTracking ? (
          <View style={styles.readyStack}>
            <ThemedText type="h3">{t('ready_to_start')}</ThemedText>
            <ThemedText style={{ color: theme.textSecondary, textAlign: 'center' }}>{t('button_heading_start')}</ThemedText>
            <Pressable style={[styles.primaryBtn, { backgroundColor: Colors.light.accent }]} onPress={startTracking}>
              <Feather name="play" size={20} color="#FFF" />
              <ThemedText style={styles.btnText}>{t('start_tracking_btn')}</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.activeDashboard}>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>SPEED</ThemedText>
                <ThemedText style={styles.statValue}>{currentSpeed}</ThemedText>
                <ThemedText style={styles.statUnit}>km/h</ThemedText>
              </View>
              <View style={[styles.statDivider, { backgroundColor: theme.divider }]} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>DURATION</ThemedText>
                <ThemedText style={styles.statValue}>{formatDuration(trackingDuration)}</ThemedText>
                <ThemedText style={styles.statUnit}>min</ThemedText>
              </View>
            </View>

            <Pressable style={styles.stopBtn} onPress={handleStopPress}>
              <View style={styles.stopIconBox}>
                <Feather name="square" size={18} color="#FFF" />
              </View>
              <ThemedText style={styles.stopBtnText}>END TRIP</ThemedText>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ... Styles (kept from previous version)
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  topHud: { position: 'absolute', top: 0, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', ...Shadows.card },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.light.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' },
  liveText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  markerContainer: { width: 60, height: 60, alignItems: 'center', justifyContent: 'center' },
  markerPulse: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: Colors.light.success },
  markerInner: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF', ...Shadows.card },
  dashboard: { position: 'absolute', bottom: 0, width: '100%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, ...Shadows.cardRaised },
  readyStack: { alignItems: 'center', gap: 10 },
  primaryBtn: { width: '100%', height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  btnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  activeDashboard: { gap: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 10 },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: '800', color: '#9E9E9E', letterSpacing: 1 },
  statValue: { fontSize: 32, fontWeight: '800', marginTop: -4 },
  statUnit: { fontSize: 12, fontWeight: '600', color: '#9E9E9E' },
  statDivider: { width: 1, height: 40 },
  stopBtn: { width: '100%', height: 60, backgroundColor: '#F5F5F5', borderRadius: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  stopIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: Colors.light.error, justifyContent: 'center', alignItems: 'center' },
  stopBtnText: { flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 16, marginRight: 48, color: Colors.light.error },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  permissionTitle: { textAlign: 'center', marginVertical: 20 }
});