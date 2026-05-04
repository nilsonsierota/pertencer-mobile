"use client";

import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { DevotionalService } from "../../../src/services/devotional.service";
import type { Chapter } from "../../../src/types";
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChapterListPage() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ title?: string }>();
  const title = searchParams.title;
  const params = useLocalSearchParams<{ planId: string; bookId: string }>();
  const planId = params.planId;
  const bookId = params.bookId;
  const { user } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid || !bookId) return;
    DevotionalService.getChapters(bookId, user.uid).then(data => { setChapters(data); setLoading(false); });
  }, [bookId, user]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Carregando capitulos...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Livros"}</Text>
        </Pressable>
      </View>
      <Text style={styles.title}>{title?.toUpperCase()}</Text>
      <ScrollView style={styles.list}>
        <View style={styles.grid}>
          {chapters.map((chapter) => {
            const isToday = chapter.isToday || false;
            const isDone = chapter.done || false;
            let bgColor = styles.chapterDefault;
            let textColor = styles.textWhite;
            if (isToday) { bgColor = isDone ? styles.chapterDoneToday : styles.chapterToday; }
            else if (isDone) { bgColor = styles.chapterDone; textColor = styles.textPrimary; }

            return (
              <Pressable key={chapter.id}
                onPress={() => router.push(`/${planId}/${bookId}/${chapter.id}?title=${encodeURIComponent(title||'')}&chapter=${chapter.number}`)}
                style={[styles.chapterButton, bgColor, textColor]}>
                <Text style={[styles.chapterNumber, textColor]}>{chapter.number}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
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
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 16, textTransform: 'uppercase' },
  list: { flex: 1, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  chapterButton: { width: 56, height: 56, margin: 4, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  chapterDefault: { backgroundColor: '#6B7280', borderColor: '#6B7280' },
  chapterToday: { backgroundColor: '#6B7280', borderColor: '#F97316', borderWidth: 3 },
  chapterDoneToday: { backgroundColor: '#189E50', borderColor: '#F97316', borderWidth: 3 },
  chapterDone: { backgroundColor: '#189E50', borderColor: '#FFFFFF', borderWidth: 2 },
  chapterNumber: { fontWeight: 'bold', fontSize: 18 },
  textWhite: { color: '#FFFFFF' },
  textPrimary: { color: '#273107' },
});