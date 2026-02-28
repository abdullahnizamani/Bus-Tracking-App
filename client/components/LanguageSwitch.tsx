import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitch() {
  const { i18n } = useTranslation();
  
  const currentLang = i18n.language || 'en';
  const isUrdu = currentLang.startsWith('ur');

  const slideAnim = useRef(new Animated.Value(isUrdu ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isUrdu ? 1 : 0,
      duration: 250, 
      useNativeDriver: true,
    }).start();
  }, [isUrdu]);

  const toggleLanguage = () => {
    const newLang = isUrdu ? 'en' : 'ur';
    i18n.changeLanguage(newLang);
  };

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20], 
  });

  return (
    <Pressable onPress={toggleLanguage} style={styles.container}>
      
      <Text style={[styles.label, !isUrdu ? styles.textActive : styles.textInactive]}>
        EN
      </Text>

      <View style={[styles.track, isUrdu ? styles.trackUrdu : styles.trackEn]}>
        <Animated.View 
          style={[styles.thumb, { transform: [{ translateX }] }]}
        />
      </View>

      <Text style={[styles.label, isUrdu ? styles.textActive : styles.textInactive]}>
        اردو
      </Text>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12, // Space between text and switch
    paddingVertical: 8,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  textActive: {
    color: '#1f2937', 
  },
  textInactive: {
    color: '#d1d5db', 
  },
  track: {
    width: 56,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  trackEn: {
    backgroundColor: '#334155', 
  },
  trackUrdu: {
    backgroundColor: '#16a34a', 
  },
  thumb: {
    width: 28,
    height: 28,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  }
});