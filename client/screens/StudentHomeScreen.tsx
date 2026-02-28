import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { BusCard } from "@/components/BusCard";
import { EmptyState } from "@/components/EmptyState";
import { BusCardSkeleton } from "@/components/LoadingSkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Colors } from "@/constants/theme";
import { getStudentBus } from "@/lib/api";
// import { createStatusListener } from "@/lib/firebase";
import { Bus } from "@/types";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { useTranslation } from 'react-i18next';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const StudentHomeScreen = () => {
      const insets = useSafeAreaInsets();
const defaultHeaderHeight = Platform.select({ ios: 44, default: 56 });
  const headerHeight = insets.top + defaultHeaderHeight;

  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [bus, setBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [liveStatus, setLiveStatus] = useState<boolean>(false);
  const { t, i18n } = useTranslation();

  const fetchBus = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const busData = await getStudentBus(token);
      setBus(busData);

      if (busData) {
        setLiveStatus(busData.is_active);
      }
    } catch (err: any) {
      setError(err.message || t('failed_to_load_bus'));
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

  const handleBusPress = useCallback(() => {
    if (bus) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      navigation.navigate("BusDetails", { busId: bus.id, driver:bus.driver });
    }
  }, [bus, navigation]);

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
          description={t('no_bus_description_student')}
        />
      );
    }

    return (
      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <BusCard bus={bus} onPress={handleBusPress} showDriver={true} />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={[styles.infoCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.infoHeader}>
            <Feather name="info" size={20} color={Colors.light.primary} />
            <ThemedText type="body" style={styles.infoTitle}>
              How to Track Your Bus
            </ThemedText>
          </View>
          
          <ThemedText
            type="small"
            style={[styles.infoText, { color: theme.textSecondary }]}
          >
            {t('tap_bus_card_description')}
            {/* Tap on your bus card to view detailed information and live location
            tracking when the driver activates it. */}
          </ThemedText>
        </Animated.View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
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
          {user?.first_name || user?.username || "Student"}
        </ThemedText>
      </View>

      {renderContent()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  greeting: {
    marginBottom: Spacing.xl,
  },
  content: {
    gap: Spacing.lg,
  },
  infoCard: {
    padding: Spacing.lg,
    borderRadius: 12,
    gap: Spacing.sm,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoTitle: {
    fontWeight: "600",
  },
  infoText: {
    lineHeight: 20,
  },
});

 
export default StudentHomeScreen;