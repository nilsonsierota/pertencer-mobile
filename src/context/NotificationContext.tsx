"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { NotificationService } from "../services/notification.service";

interface NotificationContextProps {
  permissionGranted: boolean;
  loading: boolean;
  scheduleDailyReminder: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps>({
  permissionGranted: false,
  loading: true,
  scheduleDailyReminder: async () => {},
  cancelAllNotifications: async () => {},
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          setPermissionGranted(true);
        } else {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          setPermissionGranted(newStatus === "granted");
        }

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("daily-reminder", {
            name: "Lembrete Diário",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#189E50",
          });
        }

        setLoading(false);
      } catch (error) {
        console.error("Error initializing notifications:", error);
        setLoading(false);
      }
    };

    initNotifications();

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response:", response);
      const data = response.notification.request.content.data;
      if (data?.type === "daily_reminder") {
        console.log("User tapped daily reminder");
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  const scheduleDailyReminder = useCallback(async () => {
    if (!permissionGranted) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") return;
      setPermissionGranted(true);
    }
    await NotificationService.scheduleDailyReminder();
  }, [permissionGranted]);

  const cancelAllNotifications = useCallback(async () => {
    await NotificationService.cancelAllNotifications();
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        permissionGranted,
        loading,
        scheduleDailyReminder,
        cancelAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);