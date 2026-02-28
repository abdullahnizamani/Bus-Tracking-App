import React, { useCallback } from "react";
import { ActivityIndicator, View, StyleSheet, Pressable } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "@/contexts/AuthContext";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing } from "@/constants/theme";
import { HeaderTitle } from "@/components/HeaderTitle";

import LoginScreen from "@/screens/LoginScreen";
import DriverHomeScreen from "@/screens/DriverHomeScreen";
import StudentHomeScreen from "@/screens/StudentHomeScreen";
import BusDetailsScreen from "@/screens/BusDetailsScreen";
import LiveTrackingScreen from "@/screens/LiveTrackingScreen";
import ProfileScreen from "@/screens/ProfileScreen";

import { Feather } from "@expo/vector-icons";
import { Driver } from "@/types";
export type RootStackParamList = {
  Login: undefined;
  StudentHome: undefined;
  DriverHome: undefined;
  BusDetails: { busId: number, driver?: Driver };
  LiveTracking: { busId: number };
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// export default function RootStackNavigator() {
//   const screenOptions = useScreenOptions();
//   const { theme } = useTheme();
//   const { isAuthenticated, isLoading, user } = useAuth();

//   if (isLoading) {
//     return (
//       <View style={[styles.loading, { backgroundColor: Colors.light.primary }]}>
//         <ActivityIndicator size="large" color="#FFFFFF" />
//       </View>
//     );
//   }

//   return (
//         <Stack.Navigator screenOptions={screenOptions}>
//       {!isAuthenticated ? (
//         <Stack.Screen
//           name="Login"
//           component={LoginScreen}
//           options={{ headerShown: false }}
//         />
//       ):(
//         <>
//                  {user?.role === "driver" ? (
//             <Stack.Screen
//               name="DriverHome"
//               component={DriverHomeScreen}
//               options={({ navigation }) => ({
//                 headerTitle: () => <HeaderTitle title="My Route" />,
//                 headerRight: () => (
//                   <Pressable
//                     onPress={() => navigation.navigate("Profile")}
//                     style={styles.profileButton}
//                     hitSlop={{ top: 90, bottom: 90, left: 90, right: 90 }}
//                     android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
//                     testID="button-profile"
//                   >
//                     <Feather name="user" size={24} color={theme.text} />
//                   </Pressable>
//                 ),
//               })}
//             />
//       ): (
//             <Stack.Screen
//               name="StudentHome"
//               component={StudentHomeScreen}
//               options={({ navigation }) => ({
//                 headerTitle: () => <HeaderTitle title="My Route" />,
//                 headerRight: () => (
//                   <Pressable
//                     onPress={() => navigation.navigate("Profile")}
//                     style={styles.profileButton}
//                     android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
//                     hitSlop={{ top: 90, bottom: 90, left: 90, right: 90 }}

//                     testID="button-profile"
//                   >
//                     <Feather name="user" size={24} color={theme.text} />
//                   </Pressable>
//                 ),
//               })}
//             />
//           )}
//       </>
//       )}
//     </Stack.Navigator>
//   )
// }

// const styles = StyleSheet.create({
//   loading: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   profileButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     alignItems: "center",
//     justifyContent: "center",
//     marginRight: Spacing.xs,
//   },
// })



export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { theme } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: Colors.light.primary }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {!isAuthenticated ? (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      ) : (
        <>
          {user?.role === "driver" ? (
            <Stack.Screen
              name="DriverHome"
              component={DriverHomeScreen}
              options={({ navigation }) => ({
                headerTitle: () => <HeaderTitle title="My Route" />,
                headerRight: () => (
                  <Pressable
                    onPress={() => navigation.navigate("Profile")}
                    style={styles.profileButton}
                    hitSlop={{ top: 90, bottom: 90, left: 90, right: 90 }}
                    android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
                    testID="button-profile"
                  >
                    <Feather name="user" size={24} color={theme.text} />
                  </Pressable>
                ),
              })}
            />
          ) : (
            <Stack.Screen
              name="StudentHome"
              component={StudentHomeScreen}
              options={({ navigation }) => ({
                headerTitle: () => <HeaderTitle title="My Route" />,
                headerRight: () => (
                  <Pressable
                    onPress={() => navigation.navigate("Profile")}
                    style={styles.profileButton}
                    android_ripple={{ color: "rgba(0,0,0,0.1)", borderless: true }}
                    hitSlop={{ top: 90, bottom: 90, left: 90, right: 90 }}

                    testID="button-profile"
                  >
                    <Feather name="user" size={24} color={theme.text} />
                  </Pressable>
                ),
              })}
            />



          )}
          <Stack.Screen
            name="BusDetails"
            component={BusDetailsScreen}
            options={{
              headerTitle: "Bus Details",
              headerTransparent: false,
              headerBackTitle: "Back",
            }}
          />
          <Stack.Screen
            name="LiveTracking"
            component={LiveTrackingScreen}
            options={{
              headerShown: false,
              presentation: "fullScreenModal",
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerTitle: "Profile",
              headerBackTitle: "Back",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.xs,
  },
});
