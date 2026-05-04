"use client";

import { Tabs, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";

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
  );
}