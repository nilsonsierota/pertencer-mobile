"use client";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Plan } from "../../src/types";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Carregando planos...</Text>
      </View>
    );
  }

  if (!user) return null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {plans.map((plan) => (
          <Pressable
            key={plan.id}
            onPress={() => router.push(`/${plan.id}?title=${encodeURIComponent(plan.name)}`)}
            style={styles.planButton}
          >
            <Text style={styles.planText}>{plan.name}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => router.push("/(tabs)/buscar")}
          style={styles.searchButton}
        >
          <Text style={styles.searchText}>BUSCAR PALAVRA</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#189E50' },
  loadingText: { color: '#FFFFFF', marginTop: 8 },
  container: { flex: 1, backgroundColor: '#189E50', padding: 16 },
  content: { alignItems: 'center', paddingVertical: 16 },
  planButton: { width: '100%', padding: 16, marginBottom: 12, borderRadius: 8, backgroundColor: '#189E50', borderWidth: 2, borderColor: '#273107' },
  planText: { textAlign: 'center', color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  searchButton: { width: '100%', padding: 16, marginTop: 8, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#273107' },
  searchText: { textAlign: 'center', color: '#273107', fontSize: 18, fontWeight: 'bold' },
});