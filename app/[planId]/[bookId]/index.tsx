"use client";

import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../../src/context/AuthContext";
import { DevotionalService } from "../../../src/services/devotional.service";
import type { Chapter } from "../../../src/types";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Loading } from "../../../src/components/Loading";

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
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>{"< Livros"}</Text>
        </Pressable>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title?.toUpperCase()}</Text>
      </View>
      <ScrollView style={styles.list}>
        <View style={styles.grid}>
          {chapters.map((chapter) => {
            const isToday = chapter.isToday || false;
            const isDone = chapter.done || false;
            let bgColor = styles.chapterDefault;
            let borderStyle = styles.chapterBorderDefault;
            if (isToday && isDone) {
              bgColor = styles.chapterDone;
              borderStyle = styles.chapterBorderToday;
            } else if (isToday) {
              bgColor = styles.chapterDefault;
              borderStyle = styles.chapterBorderToday;
            } else if (isDone) {
              bgColor = styles.chapterDone;
              borderStyle = styles.chapterBorderDone;
            }

            const bookKey = title ? title.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
            return (
              <Pressable key={chapter.id}
                onPress={() => router.push(`/${planId}/${bookId}/${chapter.id}?title=${encodeURIComponent(title||'')}&chapter=${chapter.number}&bookKey=${encodeURIComponent(bookKey)}`)}
                style={[styles.chapterButton, bgColor, borderStyle]}>
                <Text style={[styles.chapterNumber, isDone && !isToday && styles.chapterNumberDone]}>{chapter.number}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#189E50' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  backButton: { padding: 8 },
  backText: { color: '#FFFFFF', fontSize: 14 },
  titleContainer: { width: '100%', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginTop: 32, marginBottom: 24 },
  list: { flex: 1, padding: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  chapterButton: { width: 50, height: 50, borderRadius: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  chapterDefault: { backgroundColor: '#6C7278' },
  chapterDone: { backgroundColor: '#189E50' },
  chapterBorderDefault: { borderColor: '#6C7278' },
  chapterBorderToday: { borderColor: '#c2410c', borderWidth: 2 },
  chapterBorderDone: { borderColor: '#189E50' },
  chapterNumber: { fontWeight: 'bold', fontSize: 16, color: '#FFFFFF' },
  chapterNumberDone: { color: '#000000' },
});
