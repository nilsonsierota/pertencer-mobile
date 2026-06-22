"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { useNotifications } from "../../src/context/NotificationContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Plan } from "../../src/types";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../src/components/Loading";

export default function PlanListPage() {
  const { user, loading: authLoading } = useAuth();
  const { scheduleDailyReminder, permissionGranted } = useNotifications();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (user && permissionGranted) {
      scheduleDailyReminder();
    }
  }, [user, permissionGranted, scheduleDailyReminder]);

  useFocusEffect(useCallback(() => {
    setNavigating(false);
  }, []));

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
    return <Loading />;
  }

  if (!user) return null;

  const handlePlanPress = (plan: Plan) => {
    setNavigating(true);
    router.push(`/${plan.id}?title=${encodeURIComponent(plan.name)}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.list}>
          {plans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => handlePlanPress(plan)}
              style={styles.card}
            >
              <View style={styles.cardInner}>
                <Text style={styles.cardText}>{plan.name}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable
            onPress={() => router.push("/(tabs)/buscar")}
            style={[styles.card, styles.searchCard]}
          >
            <View style={styles.cardInner}>
              <Text style={[styles.cardText, styles.searchCardText]}>Buscar palavra</Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#189E50',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  list: {
    alignItems: 'center',
    gap: 16,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#273107',
    backgroundColor: '#189E50',
  },
  cardInner: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  searchCard: {
    marginTop: 16,
  },
  searchCardText: {
    textTransform: 'uppercase',
  },
});
