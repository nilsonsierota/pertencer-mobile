"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { DevotionalService } from "../../src/services/devotional.service";
import type { Book } from "../../src/types";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Loading } from "../../src/components/Loading";

export default function BookListPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ title?: string }>();
  const title = params.title;
  const routeParams = useLocalSearchParams<{ planId: string }>();
  const planId = routeParams.planId;
  const { user, loading: authLoading } = useAuth();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/(auth)/login");
  }, [authLoading, user, router]);

  useFocusEffect(useCallback(() => {
    setNavigating(false);
  }, []));

  const { data: books = [], isLoading, isError, refetch } = useQuery<Book[]>({
    queryKey: ["books", planId, user?.uid],
    enabled: !!user && !!planId,
    staleTime: 1000 * 60 * 60 * 24,
    gcTime: 1000 * 60 * 60 * 24,
    retry: 1,
    queryFn: () => DevotionalService.getBooks(user!.uid, planId!),
  });

  if (authLoading || isLoading) {
    return <Loading />;
  }

  if (!user) return null;

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#FFFFFF", fontSize: 14, textAlign: "center", marginBottom: 16 }}>
            Erro ao carregar livros. Verifique sua conexão e tente novamente.
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#273107", borderRadius: 8 }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14 }}>Tentar novamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookPress = (book: Book) => {
    setNavigating(true);
    router.push(`/${planId}/${book.id}?title=${encodeURIComponent(book.title)}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Planos"}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{title}</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {books.length === 0 && (
          <Text style={styles.emptyText}>Nenhum livro</Text>
        )}
        <View style={styles.list}>
          {books.map((book) => {
            const isToday = book.isToday;
            return (
              <Pressable
                key={book.id}
                onPress={() => handleBookPress(book)}
                style={[
                  styles.card,
                  isToday ? styles.cardToday : styles.cardDefault,
                ]}
              >
                <View style={styles.cardInner}>
                  <View style={styles.spacer} />
                  <Text style={[styles.cardTitle, isToday && styles.cardTitleToday]}>
                    {book.title}
                  </Text>
                  <View style={styles.progress}>
                    <Text style={[styles.progressPercent, isToday && styles.progressTextToday]}>
                      {book.donePercentage}%
                    </Text>
                    <Text style={[styles.progressCount, isToday && styles.progressTextToday]}>
                      {book.doneChapters}/{book.totalChapters}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#189E50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 8,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 16,
  },
  list: {
    gap: 16,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#273107',
  },
  cardDefault: {
    backgroundColor: '#189E50',
  },
  cardToday: {
    backgroundColor: '#273107',
  },
  cardInner: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: {
    width: 60,
  },
  cardTitle: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center',
    flex: 1,
    fontWeight: '600',
  },
  cardTitleToday: {
    color: '#FFFFFF',
  },
  progress: {
    width: 60,
    alignItems: 'flex-end',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  progressCount: {
    fontSize: 12,
    color: '#000000',
  },
  progressTextToday: {
    color: '#FFFFFF',
  },
});
