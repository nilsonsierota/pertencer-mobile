"use client";

import { Tabs, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, Text, ActivityIndicator } from "react-native";
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
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#189E50" />
        <Text className="text-gray-500 mt-2">Carregando...</Text>
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
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Planos", headerTitle: "Pertencer" }}
      />
      <Tabs.Screen
        name="buscar"
        options={{ title: "Buscar" }}
      />
    </Tabs>
  );
}