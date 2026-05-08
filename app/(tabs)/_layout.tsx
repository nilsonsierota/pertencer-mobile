"use client";

import { Tabs, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

const isDevelopment = process.env.EXPO_PUBLIC_USE_TEST_USER === "true";
const NotificationDevTools = isDevelopment ? require("../../src/components/NotificationDevTools").NotificationDevTools : null;

export default function TabLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/login");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#189E50' }}>
        <Image source={require("../../assets/Logo. 25 [GIF].gif")} style={{ width: 120, height: 120, resizeMode: 'contain' }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#189E50",
          tabBarInactiveTintColor: "#6C7278",
          tabBarStyle: { backgroundColor: "#FFFFFF", borderTopColor: "#D9D9D9" },
          headerShown: true,
          headerStyle: { backgroundColor: "#189E50" },
          headerTintColor: "#FFFFFF",
          headerTitle: () => <Image source={require("../../assets/logo-pertencer.png")} style={{ width: 140, height: 40, resizeMode: 'contain' }} />,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ 
            title: "Início",
            headerTitle: "Pertencer",
            tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />
          }}
        />
        <Tabs.Screen
          name="buscar"
          options={{ 
            title: "Buscar",
            headerTitle: "Buscar",
            tabBarIcon: ({ color, size }) => <Ionicons name="search-outline" size={size} color={color} />
          }}
        />
      </Tabs>
      {isDevelopment && NotificationDevTools && <NotificationDevTools />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});