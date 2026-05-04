"use client";

import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Plan } from "../../src/types";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Wheel } from "../../src/components/Wheel";

export default function PlanListPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

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

  const handlePlanPress = (plan: any) => {
    setNavigating(true);
    router.push(`/${plan.id}?title=${encodeURIComponent(plan.title)}`);
  };

  const planItems = plans.length > 0 
    ? plans.map(p => ({ id: p.id, title: p.name }))
    : [
        { id: 'plano1', title: 'Plano 1' },
        { id: 'plano2', title: 'Plano 2' }
      ];

  return (
    <View style={styles.container}>
      <Wheel 
        items={planItems} 
        onPress={handlePlanPress} 
        itemColor="#FFFFFF" 
        showProgress={false}
        loading={navigating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#189E50' 
  },
  loadingText: { 
    color: '#FFFFFF', 
    marginTop: 8 
  },
  container: { 
    flex: 1, 
    backgroundColor: '#189E50' 
  },
});