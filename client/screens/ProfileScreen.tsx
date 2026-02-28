import React, { useCallback, useState, useMemo } from "react";
import { View, StyleSheet, Pressable, Alert, Image, Modal, TextInput, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { changePassword } from "@/lib/api";
import { useTranslation } from 'react-i18next';
import LanguageSwitch from "@/components/LanguageSwitch";

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user, student, driver, logout, token } = useAuth();
  const { t } = useTranslation();

  // Modal & Password States
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [visibility, setVisibility] = useState({ current: false, new: false, confirm: false });
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const isDriver = user?.role === "driver";
  const baseUrl = getApiUrl();

  // Performance: Memoize Avatar URL
  const avatarUrl = useMemo(() => {
    if (!user?.avatar) return null;
    return user.avatar.startsWith("https") ? user.avatar : `${baseUrl}${user.avatar}`;
  }, [user?.avatar, baseUrl]);

  const handleLogout = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(t('logout_title'), t('logout_description'), [
      { text: "Cancel", style: "cancel" },
      { text: t('logout_title'), style: "destructive", onPress: logout },
    ]);
  }, [logout, t]);

  const toggleVisibility = (field: keyof typeof visibility) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisibility(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswords({ current: "", new: "", confirm: "" });
    setPasswordError("");
  };

  const handleChangePassword = async () => {
    if (!token) return;
    const { current, new: newPass, confirm } = passwords;

    if (!current || !newPass || !confirm) return setPasswordError(t('password_error_details'));
    if (newPass.length < 6) return setPasswordError(t('password_error_length'));
    if (newPass !== confirm) return setPasswordError(t('password_error_not_match'));

    setIsChangingPassword(true);
    try {
      await changePassword(token, current, newPass);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", t('password_success'));
      closePasswordModal();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPasswordError(error.message || t('password_change_failed'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Helper for Input Groups
  const PasswordInput = ({ label, valueKey, placeholder }: any) => (
    <View style={styles.inputGroup}>
      <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>{label}</ThemedText>
      <View style={[
        styles.inputWrapper, 
        { backgroundColor: theme.backgroundSecondary },
        focusedInput === valueKey && { borderColor: Colors.light.primary, borderWidth: 1 }
      ]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          secureTextEntry={!visibility[valueKey as keyof typeof visibility]}
          value={passwords[valueKey as keyof typeof passwords]}
          onChangeText={(txt) => setPasswords(p => ({ ...p, [valueKey]: txt }))}
          onFocus={() => setFocusedInput(valueKey)}
          onBlur={() => setFocusedInput(null)}
          placeholder={placeholder}
          placeholderTextColor={theme.textSecondary}
        />
        <Pressable onPress={() => toggleVisibility(valueKey as any)} style={{ padding: Spacing.sm }}>
          <Feather name={visibility[valueKey as keyof typeof visibility] ? "eye" : "eye-off"} size={18} color={theme.textSecondary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + (Platform.OS === 'ios' ? 60 : 80),
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {/* Header Section */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.profileHeader}>
        <Pressable style={styles.avatarContainer} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <Image 
            source={avatarUrl ? { uri: avatarUrl } : require("../../assets/images/default-avatar.png")} 
            style={styles.avatar} 
          />
          <View style={[styles.editBadge, { backgroundColor: theme.backgroundDefault }]}>
            <Feather name="camera" size={12} color={theme.text} />
          </View>
          <View style={[styles.roleBadge, { backgroundColor: isDriver ? Colors.light.accent : Colors.light.primary }]}>
            <Feather name={isDriver ? "truck" : "user"} size={14} color="#FFFFFF" />
          </View>
        </Pressable>
        <ThemedText type="h3" style={styles.userName}>{user?.first_name} {user?.last_name}</ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>@{user?.username}</ThemedText>
      </Animated.View>

      {/* Info Section */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>{t('account_information_title')}</ThemedText>
        <InfoRow icon="mail" label="Email" value={user?.email} theme={theme} />
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        <InfoRow icon="phone" label="Phone" value={user?.phone} theme={theme} />
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        <InfoRow icon="hash" label={isDriver ? "Employee ID" : "Student ID"} value={isDriver ? driver?.employee_id : student?.student_id} theme={theme} />
      </Animated.View>

      {/* Settings Section */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={[styles.section, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText type="small" style={[styles.sectionTitle, { color: theme.textSecondary }]}>APP SETTINGS</ThemedText>
        <View style={styles.menuRow}>
          <View style={[styles.infoIcon, { backgroundColor: theme.backgroundSecondary }]}><Feather name="globe" size={18} color={theme.textSecondary} /></View>
          <ThemedText type="body" style={styles.menuText}>{t('language')}</ThemedText>
          <LanguageSwitch />
        </View>
        <View style={[styles.divider, { backgroundColor: theme.divider }]} />
        <MenuRow icon="lock" label={t('change_password_btn')} onPress={() => setShowPasswordModal(true)} theme={theme} />
      </Animated.View>

      {/* Logout */}
      <Animated.View entering={FadeInDown.delay(400).springify()}>
        <Pressable 
          style={({ pressed }) => [styles.logoutButton, pressed && { opacity: 0.7 }]} 
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color={Colors.light.error} />
          <ThemedText type="body" style={{ color: Colors.light.error, fontWeight: "600" }}>{t('logout')}</ThemedText>
        </Pressable>
      </Animated.View>

      {/* Change Password Modal */}
      <Modal visible={showPasswordModal} transparent animationType="fade" onRequestClose={closePasswordModal}>
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown} style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Change Password</ThemedText>
              <Pressable onPress={closePasswordModal}><Feather name="x" size={24} color={theme.text} /></Pressable>
            </View>

            {passwordError ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={16} color={Colors.light.error} />
                <ThemedText type="small" style={{ color: Colors.light.error, flex: 1 }}>{passwordError}</ThemedText>
              </View>
            ) : null}

            <PasswordInput label={t('current_password')} valueKey="current" placeholder={t('current_password_placeholder')} />
            <PasswordInput label={t('new_password')} valueKey="new" placeholder={t('new_password_placeholder')} />
            <PasswordInput label={t('confirm_new_password')} valueKey="confirm" placeholder={t('confirm_new_password_placeholder')} />

            <Pressable 
              style={[styles.changePasswordButton, { backgroundColor: Colors.light.primary, opacity: isChangingPassword ? 0.7 : 1 }]} 
              onPress={handleChangePassword} 
              disabled={isChangingPassword}
            >
              {isChangingPassword ? <ActivityIndicator color="#FFFFFF" /> : <ThemedText type="body" style={{ color: "#FFFFFF", fontWeight: "600" }}>{t('change_password_btn')}</ThemedText>}
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </KeyboardAwareScrollViewCompat>
  );
};

// Sub-components for cleaner JSX
const InfoRow = ({ icon, label, value, theme }: any) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIcon, { backgroundColor: theme.backgroundSecondary }]}><Feather name={icon} size={18} color={theme.textSecondary} /></View>
    <View style={styles.infoContent}>
      <ThemedText type="small" style={{ color: theme.textSecondary }}>{label}</ThemedText>
      <ThemedText type="body">{value || "Not set"}</ThemedText>
    </View>
  </View>
);

const MenuRow = ({ icon, label, onPress, theme }: any) => (
  <Pressable style={({ pressed }) => [styles.menuRow, pressed && { opacity: 0.5 }]} onPress={onPress}>
    <View style={[styles.infoIcon, { backgroundColor: theme.backgroundSecondary }]}><Feather name={icon} size={18} color={theme.textSecondary} /></View>
    <ThemedText type="body" style={styles.menuText}>{label}</ThemedText>
    <Feather name="chevron-right" size={20} color={theme.textSecondary} />
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { alignItems: "center", marginBottom: Spacing.xl },
  avatarContainer: { position: "relative", marginBottom: Spacing.md },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: "#E0E0E0", borderWidth: 4, borderColor: '#FFF' },
  editBadge: { position: 'absolute', right: 0, top: 5, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', ...Shadows.card },
  roleBadge: { position: "absolute", bottom: 0, right: 5, width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF" },
  userName: { marginBottom: Spacing.xs },
  section: { borderRadius: BorderRadius.md, padding: Spacing.lg, marginBottom: Spacing.lg, ...Shadows.card },
  sectionTitle: { fontWeight: "700", letterSpacing: 0.5, marginBottom: Spacing.lg, fontSize: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  infoIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  infoContent: { flex: 1 },
  divider: { height: 1, marginVertical: Spacing.md },
  menuRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.xs },
  menuText: { flex: 1 },
  logoutButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.lg, borderRadius: BorderRadius.sm, backgroundColor: "rgba(211, 47, 47, 0.08)" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "center", padding: Spacing.lg },
  modalContent: { borderRadius: BorderRadius.lg, padding: Spacing.xl, ...Shadows.card },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.xl },
  errorBox: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, padding: Spacing.md, backgroundColor: "rgba(211, 47, 47, 0.1)", borderRadius: BorderRadius.sm, marginBottom: Spacing.lg },
  inputGroup: { marginBottom: Spacing.lg },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm },
  input: { flex: 1, paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, fontSize: 16 },
  changePasswordButton: { paddingVertical: Spacing.md, borderRadius: BorderRadius.sm, alignItems: "center", justifyContent: "center", marginTop: Spacing.sm },
});

export default ProfileScreen;