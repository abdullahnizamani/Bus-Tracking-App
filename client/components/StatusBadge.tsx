import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

interface StatusBadgeProps {
  isActive: boolean;
  size?: "small" | "medium" | "large";
}

export function StatusBadge({ isActive, size = "medium" }: StatusBadgeProps) {
  const { theme } = useTheme();
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (isActive) {
      pulseScale.value = withRepeat(
        withTiming(1.8, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withTiming(0, { duration: 1500, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    } else {
      pulseScale.value = 1;
      pulseOpacity.value = 0;
    }
  }, [isActive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const sizes = {
    small: { padding: Spacing.xs, iconSize: 12, fontSize: 12 },
    medium: { padding: Spacing.sm, iconSize: 14, fontSize: 14 },
    large: { padding: Spacing.md, iconSize: 16, fontSize: 16 },
  };

  const sizeConfig = sizes[size];
  const backgroundColor = isActive ? Colors.light.success : theme.textSecondary;
  const textColor = "#FFFFFF";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingHorizontal: sizeConfig.padding + 4,
          paddingVertical: sizeConfig.padding,
        },
      ]}
    >
      <View style={styles.indicatorContainer}>
        {isActive ? (
          <Animated.View
            style={[
              styles.pulse,
              { backgroundColor: Colors.light.success },
              pulseStyle,
            ]}
          />
        ) : null}
        <View
          style={[
            styles.dot,
            {
              backgroundColor: textColor,
              width: sizeConfig.iconSize - 4,
              height: sizeConfig.iconSize - 4,
            },
          ]}
        />
      </View>
      <ThemedText
        style={[
          styles.text,
          { color: textColor, fontSize: sizeConfig.fontSize },
        ]}
      >
        {isActive ? "LIVE" : "OFFLINE"}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  indicatorContainer: {
    width: 12,
    height: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dot: {
    borderRadius: 6,
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
