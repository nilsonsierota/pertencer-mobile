"use client";

import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Book } from "../../src/types";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Planos"}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      <ScrollView style={styles.list}>
        {books.length === 0 && <Text style={styles.empty}>Nenhum livro</Text>}
        {books.map((book) => (
          <Pressable key={book.id} onPress={() => router.push(`/${planId}/${book.id}?title=${encodeURIComponent(book.title)}`)}
            style={[styles.bookItem, book.isToday ? styles.bookToday : styles.bookOther]}>
            <View style={styles.bookRow}>
              <Text style={[styles.bookTitle, book.isToday ? styles.textWhite : styles.textPrimary]}>{book.title}</Text>
              <View style={styles.bookStats}>
                <Text style={[styles.bookPercent, book.isToday ? styles.textWhite : styles.textPrimary]}>{book.donePercentage}%</Text>
                <Text style={[styles.bookChapters, book.isToday ? styles.textWhite70 : styles.textGray]}>{book.doneChapters}/{book.totalChapters}</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#189E50' },
  loadingText: { color: '#FFFFFF', marginTop: 8 },
  container: { flex: 1, backgroundColor: '#189E50' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { padding: 8 },
  backText: { color: '#FFFFFF', fontSize: 14 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  list: { flex: 1, padding: 16 },
  empty: { color: 'rgba(255,255,255,0.6)', textAlign: 'center' },
  bookItem: { width: '100%', padding: 16, marginBottom: 12, borderRadius: 8, borderWidth: 2, borderColor: '#273107' },
  bookToday: { backgroundColor: '#273107' },
  bookOther: { backgroundColor: '#FFFFFF' },
  bookRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bookTitle: { fontSize: 18, fontWeight: 'bold' },
  textWhite: { color: '#FFFFFF' },
  textPrimary: { color: '#273107' },
  textWhite70: { color: 'rgba(255,255,255,0.7)' },
  textGray: { color: '#6B7280' },
  bookStats: { alignItems: 'flex-end' },
  bookPercent: { fontSize: 14, fontWeight: 'bold' },
  bookChapters: { fontSize: 12 },
});