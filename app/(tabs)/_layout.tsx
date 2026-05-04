"use client";

import { Tabs, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { View, Text, ActivityIndicator } from "react-native";
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
        <ActivityIndicator size="large" color="#189E50" />
        <Text style={{ color: '#6B7280', marginTop: 8 }}>Carregando...</Text>
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