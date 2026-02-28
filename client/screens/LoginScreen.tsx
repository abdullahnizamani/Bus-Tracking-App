import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";
import { useTranslation } from 'react-i18next';

const LoginScreen = () => {
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<'user' | 'pass' | null>(null);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError(t('error_missing_fields') || "Enter your credentials");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ username: username.trim(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.message || t('login_failed'));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.light.primary, "#004D40"]} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(800).springify()} style={styles.headerSection}>
            <Image
              source={require("../../assets/images/login-illustration.png")}
              style={styles.illustration}
              resizeMode="contain"
            />
            <ThemedText style={styles.title}>{t('welcome_login')}</ThemedText>
            <ThemedText style={styles.subtitle}>{t('welcome_login_sub')}</ThemedText>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).duration(800).springify()} style={styles.formSection}>
            <View style={[styles.inputWrapper, focusedField === 'user' && styles.inputFocused]}>
              <Feather name="user" size={20} color={focusedField === 'user' ? Colors.light.primary : Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t('username')}
                placeholderTextColor={Colors.light.textDisabled}
                value={username}
                onChangeText={setUsername}
                onFocus={() => setFocusedField('user')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                editable={!isSubmitting}
              />
            </View>

            <View style={[styles.inputWrapper, focusedField === 'pass' && styles.inputFocused]}>
              <Feather name="lock" size={20} color={focusedField === 'pass' ? Colors.light.primary : Colors.light.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder={t('password')}
                placeholderTextColor={Colors.light.textDisabled}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('pass')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!isSubmitting}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={20} color={Colors.light.textSecondary} />
              </Pressable>
            </View>

            {error && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color={Colors.light.error} />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.loginButton,
                { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: isSubmitting ? 0.7 : 1 },
              ]}
              onPress={handleLogin}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <ThemedText style={styles.loginButtonText}>{t('sign_in')}</ThemedText>
                  <Feather name="arrow-right" size={20} color="#FFFFFF" />
                </>
              )}
            </Pressable>
          </Animated.View>

          <View style={styles.footerSection}>
            <ThemedText style={styles.footerText}>{t('contact_admin_txt')}</ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl, justifyContent: 'center' },
  headerSection: { alignItems: "center", marginBottom: Spacing["2xl"] },
  illustration: { width: 240, height: 160, marginBottom: Spacing.lg },
  title: { fontSize: 32, fontWeight: "800", color: "#FFFFFF", textAlign: "center" },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 4 },
  formSection: { backgroundColor: "#FFFFFF", borderRadius: BorderRadius.xl, padding: Spacing.xl, ...Shadows.cardRaised, gap: Spacing.md },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, height: 56, borderWidth: 1.5, borderColor: "transparent" },
  inputFocused: { borderColor: Colors.light.primary, backgroundColor: "#FFFFFF" },
  input: { flex: 1, fontSize: 16, color: Colors.light.textPrimary, marginLeft: Spacing.sm },
  eyeButton: { padding: Spacing.xs },
  errorContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", padding: Spacing.md, borderRadius: BorderRadius.sm, gap: Spacing.sm },
  errorText: { color: Colors.light.error, fontSize: 14, fontWeight: '500', flex: 1 },
  loginButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.light.primary, height: 56, borderRadius: BorderRadius.md, gap: Spacing.sm, marginTop: Spacing.sm, ...Shadows.cardRaised },
  loginButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
  footerSection: { marginTop: Spacing["2xl"], alignItems: "center" },
  footerText: { color: "rgba(255,255,255,0.5)", fontSize: 13, textAlign: "center" },
});

export default LoginScreen;