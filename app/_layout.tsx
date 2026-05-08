import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";
import { NotificationProvider } from "../src/context/NotificationContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="(auth)" options={{ presentation: "modal" }} />
          </Stack>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}