"use client";

import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { NotificationService } from "../services/notification.service";
import { useNotifications } from "../context/NotificationContext";

const isDevelopment = process.env.EXPO_PUBLIC_USE_TEST_USER === "true";

export function NotificationDevTools() {
  const { permissionGranted, scheduleDailyReminder, cancelAllNotifications } = useNotifications();
  const [scheduled, setScheduled] = useState<Notifications.NotificationRequest[]>([]);

  useEffect(() => {
    if (isDevelopment) {
      loadScheduled();
    }
  }, []);

  const loadScheduled = async () => {
    const notifications = await NotificationService.getScheduledNotifications();
    setScheduled(notifications);
  };

  const testNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Teste de Notificação",
        body: "Esta é uma notificação de teste",
        data: { type: "test" },
        sound: true,
      },
      trigger: null,
    });
    Alert.alert("Sucesso", "Notificação de teste enviada!");
  };

  const testWithSound = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📖 Hora de meditar",
        body: "Seu devocional diário está te esperando. Venha crescer na palavra!",
        data: { type: "daily_reminder" },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 8,
        minute: 0,
      },
    });
    loadScheduled();
    Alert.alert("Sucesso", "Lembrete diário agendado!");
  };

  if (!isDevelopment) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Dev Notification Tools</Text>
      <Text style={styles.status}>Permission: {permissionGranted ? "✅ Granted" : "❌ Denied"}</Text>
      
      <Pressable style={styles.button} onPress={testNotification}>
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </Pressable>
      
      <Pressable style={styles.button} onPress={testWithSound}>
        <Text style={styles.buttonText}>Schedule Daily (8 AM)</Text>
      </Pressable>
      
      <Pressable style={styles.buttonSecondary} onPress={scheduleDailyReminder}>
        <Text style={styles.buttonText}>Schedule via Service</Text>
      </Pressable>
      
      <Pressable style={styles.buttonDanger} onPress={cancelAllNotifications}>
        <Text style={styles.buttonText}>Cancel All</Text>
      </Pressable>
      
      <Text style={styles.subtitle}>Scheduled Notifications:</Text>
      {scheduled.map((n, i) => (
        <Text key={i} style={styles.item}>
          - {n.content.title}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    right: 16,
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#189E50",
    zIndex: 999,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  status: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 12,
  },
  subtitle: {
    color: "#fff",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  item: {
    color: "#aaa",
    fontSize: 12,
  },
  button: {
    backgroundColor: "#189E50",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonSecondary: {
    backgroundColor: "#4285F4",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonDanger: {
    backgroundColor: "#DC3545",
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});