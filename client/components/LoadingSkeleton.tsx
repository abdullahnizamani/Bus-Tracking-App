import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = BorderRadius.xs,
  style,
}: SkeletonProps) {
  const { theme } = useTheme();
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-SCREEN_WIDTH, SCREEN_WIDTH]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.backgroundSecondary,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, shimmerStyle]}>
        <LinearGradient
          colors={[
            "transparent",
            "rgba(255,255,255,0.3)",
            "transparent",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function BusCardSkeleton() {
  const { theme } = useTheme();

  return (
    <View
      style={[styles.cardContainer, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <Skeleton width={48} height={48} borderRadius={BorderRadius.sm} />
        <View style={styles.cardHeaderText}>
          <Skeleton width={120} height={20} />
          <Skeleton width={80} height={16} style={{ marginTop: Spacing.xs }} />
        </View>
        <Skeleton width={60} height={24} borderRadius={BorderRadius.full} />
      </View>
      <View style={[styles.divider, { backgroundColor: theme.divider }]} />
      <View style={styles.cardBody}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={styles.cardBodyText}>
          <Skeleton width={60} height={14} />
          <Skeleton width={100} height={16} style={{ marginTop: Spacing.xs }} />
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Skeleton width={100} height={20} />
        <Skeleton width={100} height={32} borderRadius={BorderRadius.full} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardHeaderText: {
    flex: 1,
  },
  divider: {
    height: 1,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  cardBodyText: {
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
