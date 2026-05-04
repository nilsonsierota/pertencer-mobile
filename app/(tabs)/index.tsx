"use client";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Plan } from "../../src/types";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useQuery } from "@tanstack/react-query";

export default function PlanListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [authLoading, user, router]);

  const { data: plans = [], isLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    enabled: !!user && !authLoading,
    queryFn: () => DevotionalService.getPlans(),
  });

  if (authLoading || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text className="text-white mt-2">Carregando planos...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="flex flex-col items-center py-4">
        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            onPress={() => router.push(`/${plan.id}?title=${encodeURIComponent(plan.name)}`)}
            className="w-full p-4 mb-3 rounded-lg bg-secondary border-2 border-primary"
          >
            <Text className="text-center text-white text-lg font-bold">
              {plan.name}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => router.push("/(tabs)/buscar")}
          className="w-full p-4 mt-2 rounded-lg bg-white border-2 border-primary"
        >
          <Text className="text-center text-primary text-lg font-bold">
            BUSCAR PALAVRA
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}