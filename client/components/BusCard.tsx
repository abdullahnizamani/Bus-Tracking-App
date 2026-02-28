import React from "react";
import { View, StyleSheet, Pressable, Image } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows, Colors } from "@/constants/theme";
import { Bus, Driver } from "@/types";
import { getApiUrl } from "@/lib/query-client";
interface BusCardProps {
  bus: Bus;
  onPress?: () => void;
  showDriver?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function BusCard({ bus, onPress, showDriver = true }: BusCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
    const baseUrl = getApiUrl();
  
  const avatarUrl =
    bus.driver?.user?.avatar && bus.driver?.user.avatar.startsWith("https")
      ? bus.driver?.user?.avatar
      : bus.driver?.user?.avatar
      ? `${baseUrl}${bus.driver?.user?.avatar}`
      : null;
  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        { backgroundColor: theme.backgroundDefault },
        Shadows.card,
        animatedStyle,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.busInfo}>
          <View
            style={[
              styles.busIconContainer,
              { backgroundColor: Colors.light.primary },
            ]}
          >
            <Feather name="truck" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.busDetails}>
            <ThemedText type="h4" style={styles.busName}>
              {bus.name}
            </ThemedText>
            <ThemedText
              type="small"
              style={[styles.registration, { color: theme.textSecondary }]}
            >
              {bus.registration_number}
            </ThemedText>
          </View>
        </View>
        <StatusBadge isActive={bus.is_active} />
      </View>

      {showDriver && bus.driver ? (
        <View style={[styles.driverSection, { borderTopColor: theme.divider }]}>
          
          <Image
            source={
              bus.driver.user.avatar
                ? { uri: avatarUrl }
                : require("../../assets/images/default-avatar.png")
            }
            style={styles.driverAvatar}
          />
          <View style={styles.driverInfo}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              Driver
            </ThemedText>
            <ThemedText type="body" style={styles.driverName}>
              {bus.driver.user.first_name} {bus.driver.user.last_name}
            </ThemedText>
          </View>
          <Feather
            name="chevron-right"
            size={20}
            color={theme.textSecondary}
          />
        </View>
      ) : null}

      {bus.route ? (
        <View style={[styles.routeSection, { borderTopColor: theme.divider }]}>
          <Feather name="map-pin" size={16} color={Colors.light.accent} />
          <ThemedText
            type="small"
            style={[styles.routeText, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {bus.route.route_str || "Route not specified"}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <View style={styles.capacityBadge}>
          <Feather name="users" size={14} color={theme.textSecondary} />
          <ThemedText
            type="small"
            style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
          >
            Capacity: {bus.capacity || "N/A"}
          </ThemedText>
        </View>
        <View
          style={[styles.viewButton, { backgroundColor: Colors.light.primary }]}
        >
          <ThemedText style={styles.viewButtonText}>View Details</ThemedText>
          <Feather name="arrow-right" size={14} color="#FFFFFF" />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  busInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  busIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  busDetails: {
    flex: 1,
  },
  busName: {
    marginBottom: 2,
  },
  registration: {
    fontWeight: "500",
  },
  driverSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontWeight: "500",
  },
  routeSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  routeText: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.sm,
  },
  capacityBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  viewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
