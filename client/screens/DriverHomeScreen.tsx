import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { BusCardSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { getDriverBus } from "@/lib/api";
import { Bus } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DriverHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();

const defaultHeaderHeight = Platform.select({ ios: 44, default: 56 });
  const headerHeight = insets.top + defaultHeaderHeight;

  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user, token } = useAuth();

  const [bus, setBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fabScale = useSharedValue(1);
  const fabPulse = useSharedValue(1);
  useEffect(() => {
    fabPulse.value = withRepeat(
      withTiming(1.1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const fetchBus = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const busData = await getDriverBus(token);
      setBus(busData);
    } catch (err: any) {
      setError(err.message || "Failed to load bus information");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBus();
  }, [fetchBus]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchBus();
  }, [fetchBus]);

  const handleStartTracking = useCallback(() => {
    if (bus) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate("LiveTracking", { busId: bus.id });
    }
  }, [bus, navigation]);

  const handleFabPressIn = () => {
    fabScale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
  };

  const handleFabPressOut = () => {
    fabScale.value = withSpring(1, { damping: 15, stiffness: 200 });
  };
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.content}>
          <BusCardSkeleton />
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-bus.png")}
          title={t('something_went_wrong')}
          description={error}
          actionLabel={t('try_again')}
          onAction={fetchBus}
        />
      );
    }

    if (!bus) {
      return (
        <EmptyState
          image={require("../../assets/images/empty-bus.png")}
          title={t('no_bus_assigned')}
          description={t('no_bus_description')}
        />
      );
    }

    return (
      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={[styles.busCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.busHeader}>
            <View
              style={[
                styles.busIconContainer,
                { backgroundColor: Colors.light.primary },
              ]}
            >
              <Feather name="truck" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.busInfo}>
              <ThemedText type="h3">{bus.name}</ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary, marginTop: 2 }}
              >
                {bus.registration_number}
              </ThemedText>
            </View>
            <StatusBadge isActive={bus.is_active} size="medium" />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.divider }]} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="users" size={20} color={Colors.light.primary} />
              <View style={styles.statText}>
                <ThemedText type="h4">{bus.capacity || "N/A"}</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary }}
                >
                  {t('capacity')}
                </ThemedText>
              </View>
            </View>
            {bus.route ? (
              <View style={[styles.statItem, styles.routeStat]}>
                <Feather name="map-pin" size={20} color={Colors.light.accent} />
                <View style={styles.statText}>
                  <ThemedText type="body" numberOfLines={3} style={styles.routeName}>
                    {bus.route.route_str || "Route"}
                  </ThemedText>
                  <ThemedText
                    type="small"
                    style={{ color: theme.textSecondary }}
                  >
              {t('current_route')}
                  </ThemedText>
                </View>
              </View>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.instructionCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <Feather name="info" size={20} color={Colors.light.primary} />
          <View style={styles.instructionContent}>
            <ThemedText type="body" style={styles.instructionTitle}>
                {t('ready_to_start_route')}
            </ThemedText>
            <ThemedText
              type="small"
              style={{ color: theme.textSecondary, marginTop: 4 }}
            >
            {t('live_tracking_description')}

            </ThemedText>
          </View>
        </Animated.View>
      </View>
    );
  };



  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + 100,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.primary}
            colors={[Colors.light.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greeting}>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            {t('welcome')}
          </ThemedText>
          <ThemedText type="h3">
            {user?.first_name || user?.username || "Driver"}
          </ThemedText>
        </View>

        {renderContent()}
      </ScrollView>

      {bus ? (
        <Animated.View
          style={[
            styles.fabContainer,
            { bottom: insets.bottom + Spacing.xl },
            fabAnimatedStyle,
          ]}
        >
          <Pressable
            style={[styles.fab, { backgroundColor: Colors.light.accent }]}
            onPress={handleStartTracking}
            onPressIn={handleFabPressIn}
            onPressOut={handleFabPressOut}
            testID="button-start-tracking"
          >
            <Feather name="navigation" size={24} color="#FFFFFF" />
            <ThemedText style={styles.fabText}>{t('start_live_tracking')}</ThemedText>
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  greeting: {
    marginBottom: Spacing.xl,
  },
  content: {
    gap: Spacing.lg,
  },
  busCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    ...Shadows.card,
  },
  busHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  busIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  busInfo: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.xl,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  routeStat: {
    flex: 1,
  },
  statText: {},
  routeName: {
    fontWeight: "600",
  },
  instructionCard: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    gap: Spacing.md,
    alignItems: "flex-start",
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    alignItems: "center",
  },
  fab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing["2xl"],
    height: 56,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    ...Shadows.fab,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

 
export default DriverHomeScreen;