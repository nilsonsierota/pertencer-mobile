"use client";

import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Book } from "../../src/types";
import { View, Text, Pressable, ActivityIndicator, StyleSheet, SafeAreaView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Wheel } from "../../src/components/Wheel";

export default function BookListPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string }>();
  const title = params.title;
  const routeParams = useLocalSearchParams<{ planId: string }>();
  const planId = routeParams.planId;
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/(auth)/login");
  }, [authLoading, user, router]);

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ["books", planId, user?.uid],
    enabled: !!user && !!planId,
    queryFn: () => DevotionalService.getBooks(user!.uid, planId!),
  });

  if (authLoading || isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Carregando livros...</Text>
      </View>
    );
  }

  const handleBookPress = (book: Book) => {
    router.push(`/${planId}/${book.id}?title=${encodeURIComponent(book.title)}`);
  };

  const bookItems = books
    .filter(book => book.title)
    .map(book => ({
    id: book.id,
    title: book.title,
    donePercentage: book.donePercentage,
    doneChapters: book.doneChapters,
    totalChapters: book.totalChapters,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Planos"}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Wheel 
        items={bookItems} 
        onPress={handleBookPress} 
        isBooks={true}
        showProgress={true}
        itemColor="#273107"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#189E50' },
  loadingText: { color: '#FFFFFF', marginTop: 8 },
  container: { flex: 1, backgroundColor: '#189E50' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { padding: 8 },
  backText: { color: '#FFFFFF', fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
});